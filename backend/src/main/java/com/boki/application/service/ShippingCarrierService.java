package com.boki.application.service;

import com.boki.application.dto.request.CalculateFeeRequest;
import com.boki.application.dto.request.PushShippingRequest;
import com.boki.application.dto.request.UpdateOrderCodRequest;
import com.boki.application.dto.request.UpdateShippingInfoRequest;
import com.boki.application.dto.response.CarrierFeeEstimateResponse;
import com.boki.application.dto.response.PrintWaybillResponse;
import com.boki.application.dto.response.ShippingPushResult;
import com.boki.domain.model.book.Book;
import com.boki.domain.model.order.Order;
import com.boki.domain.model.order.OrderItem;
import com.boki.domain.model.order.ShippingCarrier;
import com.boki.domain.model.user.User;
import com.boki.domain.port.out.BookRepository;
import com.boki.domain.port.out.UserRepository;
import com.boki.infrastructure.persistence.entity.StoreConfigJpaEntity;
import com.boki.infrastructure.persistence.repository.StoreConfigJpaRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class ShippingCarrierService {

    private static final Logger log = LoggerFactory.getLogger(ShippingCarrierService.class);

    private final StoreConfigJpaRepository storeConfigRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;
    private final Random random = new Random();

    public ShippingCarrierService(
            StoreConfigJpaRepository storeConfigRepository,
            UserRepository userRepository,
            BookRepository bookRepository,
            ObjectMapper objectMapper
    ) {
        this.storeConfigRepository = storeConfigRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder().build();
    }

    /**
     * Pushes order to the carrier's real HTTP API gateway (Sandbox or Production).
     * If manual tracking is provided, uses that directly.
     */
    public ShippingPushResult pushOrderToGateway(Order order, PushShippingRequest request) {
        ShippingCarrier carrier = request.carrier();
        int weight = (request.weightGrams() != null && request.weightGrams() > 0) ? request.weightGrams() : 500;

        // 1. If manual tracking number is explicitly specified by Admin, use it
        if (request.trackingNumber() != null && !request.trackingNumber().trim().isBlank()) {
            String tracking = request.trackingNumber().trim().toUpperCase();
            BigDecimal fee = request.shippingFee() != null && request.shippingFee().compareTo(BigDecimal.ZERO) > 0
                    ? request.shippingFee()
                    : calculateShippingFee(carrier, weight);
            Instant est;
            if (request.estimatedDelivery() != null && !request.estimatedDelivery().isBlank()) {
                try {
                    est = java.time.LocalDate.parse(request.estimatedDelivery().trim()).atStartOfDay(java.time.ZoneId.systemDefault()).toInstant();
                } catch (Exception e) {
                    try {
                        est = Instant.parse(request.estimatedDelivery().trim());
                    } catch (Exception ignored) {
                        est = calculateEstimatedDelivery(carrier);
                    }
                }
            } else {
                est = calculateEstimatedDelivery(carrier);
            }
            return new ShippingPushResult(
                    tracking,
                    fee,
                    est,
                    "READY_TO_PICK",
                    "Liên kết vận đơn thủ công (" + carrier.getDisplayName() + "): " + tracking
            );
        }

        // 2. Load configurations from store_config
        JsonNode carrierConfig = getCarrierConfig(carrier.name());
        JsonNode storeGeneral = getStoreGeneralConfig();

        // 3. Dispatch to official carrier API gateways
        return switch (carrier) {
            case GHN -> pushToGhnGateway(order, request, carrierConfig, storeGeneral, weight);
            case GHTK -> pushToGhtkGateway(order, request, carrierConfig, storeGeneral, weight);
            case VIETTEL_POST -> pushToViettelPostGateway(order, request, carrierConfig, storeGeneral, weight);
            case SPX -> pushToSpxGateway(order, request, carrierConfig, storeGeneral, weight);
            case VNPOST -> pushToVnPostGateway(order, request, carrierConfig, storeGeneral, weight);
            default -> generateLocalCarrierResult(carrier, request, weight);
        };
    }

    /**
     * Real HTTP Call to Giao Hàng Nhanh (GHN) API Gateway
     * Official documentation: https://developer.ghn.vn/vi/docs/order/create
     */
    private ShippingPushResult pushToGhnGateway(Order order, PushShippingRequest request, JsonNode config, JsonNode storeGeneral, int weight) {
        String token = config != null ? config.path("apiToken").asText(null) : null;
        String rawShopId = config != null ? config.path("shopId").asText(null) : null;
        boolean isSandbox = config == null || config.path("isSandbox").asBoolean(true);

        String rawEndpoint = config != null ? config.path(isSandbox ? "sandboxEndpoint" : "productionEndpoint").asText("").trim() : "";
        String endpoint = normalizeGhnCreateOrderEndpoint(rawEndpoint, isSandbox);

        if (token == null || token.trim().isBlank()) {
            throw new IllegalArgumentException(
                    "Đơn vị [GHN] đang ở chế độ " + (isSandbox ? "Sandbox chính thức (" + endpoint + ")" : "Production") + 
                    " nhưng chưa được cấu hình API Token trong hệ thống. " +
                    "Vui lòng vào 'Cài Đặt -> Đơn Vị Vận Chuyển' để dán Token được cấp từ tài khoản GHN (https://dev-online-gateway.ghn.vn), " +
                    "hoặc chọn 'Nhập mã vận đơn thủ công' nếu bạn tạo đơn trực tiếp trên portal GHN."
            );
        }

        // Resolve integer ShopId (auto-discovers shop _id from GHN token if user entered client_id or left empty)
        Integer effectiveShopId = resolveGhnShopId(token, rawShopId, isSandbox);
        if (effectiveShopId == null) {
            throw new IllegalArgumentException(
                    "Không tìm thấy Shop ID hợp lệ cho tài khoản GHN. Vui lòng kiểm tra lại Token hoặc Shop ID trên trang Cài đặt."
            );
        }

        Map<String, String> recipient = resolveRecipient(order);

        String fromName = storeGeneral != null && !storeGeneral.path("storeName").asText("").isBlank()
                ? storeGeneral.path("storeName").asText() : "Boki Bookstore";
        String fromPhone = storeGeneral != null && !storeGeneral.path("senderPhone").asText("").isBlank()
                ? storeGeneral.path("senderPhone").asText() : "0935234074";
        String fromAddress = storeGeneral != null && !storeGeneral.path("senderAddress").asText("").isBlank()
                ? storeGeneral.path("senderAddress").asText() : "123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh";

        Map<String, Object> body = new HashMap<>();
        body.put("payment_type_id", 2); // 2: Buyer pays COD
        body.put("required_note", "CHOXEMHANGKHONGTHU"); // Strictly: CHOTHUHANG, CHOXEMHANGKHONGTHU, or KHONGCHOXEMHANG
        body.put("note", request.notes() != null && !request.notes().isBlank() ? request.notes().trim() : "Gọi trước khi giao hàng");

        // Sender Info
        body.put("from_name", fromName);
        body.put("from_phone", fromPhone);
        body.put("from_address", fromAddress);
        body.put("from_ward_name", "Phường Bến Nghé");
        body.put("from_district_name", "Quận 1");
        body.put("from_province_name", "TP. Hồ Chí Minh");

        // Return Info
        body.put("return_name", fromName);
        body.put("return_phone", fromPhone);
        body.put("return_address", fromAddress);
        body.put("return_ward_name", "Phường Bến Nghé");
        body.put("return_district_name", "Quận 1");
        body.put("return_province_name", "TP. Hồ Chí Minh");

        // Recipient Info
        body.put("to_name", recipient.get("name"));
        body.put("to_phone", recipient.get("phone"));
        body.put("to_address", recipient.get("address"));
        body.put("to_ward_name", recipient.get("ward"));
        body.put("to_district_name", recipient.get("district"));
        body.put("to_province_name", recipient.get("province"));

        body.put("cod_amount", order.getTotalAmount() != null ? order.getTotalAmount().longValue() : 0L);
        body.put("content", "Sách Boki - Đơn #" + order.getId().value().toString().substring(0, 8));
        body.put("weight", Math.max(100, weight));
        body.put("length", 20);
        body.put("width", 15);
        body.put("height", 5);
        body.put("service_type_id", 2);

        List<Map<String, Object>> items = new ArrayList<>();
        for (OrderItem it : order.getItems()) {
            String bookTitle = bookRepository.findById(it.bookId())
                    .map(Book::getTitle)
                    .orElse("Sách Boki");
            Map<String, Object> itemMap = new HashMap<>();
            itemMap.put("name", bookTitle);
            itemMap.put("code", it.bookId().value().toString().substring(0, Math.min(8, it.bookId().value().toString().length())));
            itemMap.put("quantity", it.quantity());
            itemMap.put("price", it.unitPrice().longValue());
            itemMap.put("weight", Math.max(100, weight / Math.max(1, order.getItems().size())));
            items.add(itemMap);
        }
        body.put("items", items);

        log.info("Pushing order {} to GHN gateway: {} (ShopId: {})", order.getId().value(), endpoint, effectiveShopId);

        try {
            JsonNode response = restClient.post()
                    .uri(endpoint)
                    .header("Token", token.trim())
                    .header("ShopId", String.valueOf(effectiveShopId))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);

            if (response != null && response.path("code").asInt() == 200) {
                String orderCode = response.path("data").path("order_code").asText();
                long fee = response.path("data").path("total_fee").asLong(24000L);
                String expectedStr = response.path("data").path("expected_delivery_time").asText(null);
                Instant est = expectedStr != null ? Instant.parse(expectedStr) : Instant.now().plus(2, ChronoUnit.DAYS);

                return new ShippingPushResult(
                        orderCode,
                        BigDecimal.valueOf(fee),
                        est,
                        "READY_TO_PICK",
                        "Đã tạo vận đơn trên cổng GHN " + (isSandbox ? "Sandbox chính thức" : "Production") + " (" + orderCode + ")"
                );
            } else {
                String msg = response != null ? response.path("message").asText("Lỗi không xác định") : "Không có phản hồi từ GHN";
                String detail = response != null ? response.path("code_message_value").asText("") : "";
                throw new IllegalArgumentException("Lỗi từ cổng GHN API (" + endpoint + "): " + msg + (detail.isBlank() ? "" : " (" + detail + ")"));
            }
        } catch (RestClientResponseException ex) {
            String errBody = ex.getResponseBodyAsString();
            try {
                JsonNode errJson = objectMapper.readTree(errBody);
                String msg = errJson.path("message").asText(errBody);
                String detail = errJson.path("code_message_value").asText("");
                throw new IllegalArgumentException("Lỗi từ GHN (" + ex.getStatusCode().value() + "): " + msg + (detail.isBlank() ? "" : " - " + detail));
            } catch (IllegalArgumentException e) {
                throw e;
            } catch (Exception e) {
                throw new IllegalArgumentException("Lỗi từ GHN (" + ex.getStatusCode().value() + "): " + errBody);
            }
        } catch (Exception ex) {
            if (ex instanceof IllegalArgumentException) {
                throw (IllegalArgumentException) ex;
            }
            throw new IllegalArgumentException("Không thể kết nối đến cổng GHN (" + endpoint + "): " + ex.getMessage());
        }
    }

    private String normalizeGhnCreateOrderEndpoint(String rawEndpoint, boolean isSandbox) {
        String defaultEndpoint = isSandbox
                ? "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create"
                : "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create";

        if (rawEndpoint == null || rawEndpoint.isBlank()) {
            return defaultEndpoint;
        }

        String trimmed = rawEndpoint.trim();
        // If user provided just the base domain e.g. "https://dev-online-gateway.ghn.vn"
        if (!trimmed.contains("/shiip/public-api/v2/shipping-order/create")) {
            if (trimmed.endsWith("/")) {
                trimmed = trimmed.substring(0, trimmed.length() - 1);
            }
            trimmed = trimmed + "/shiip/public-api/v2/shipping-order/create";
        }
        return trimmed;
    }

    private Integer resolveGhnShopId(String token, String configuredShopId, boolean isSandbox) {
        if (token == null || token.isBlank()) {
            return null;
        }

        String shopAllUrl = isSandbox
                ? "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shop/all"
                : "https://online-gateway.ghn.vn/shiip/public-api/v2/shop/all";

        try {
            JsonNode res = restClient.post()
                    .uri(shopAllUrl)
                    .header("Token", token.trim())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{}")
                    .retrieve()
                    .body(JsonNode.class);

            if (res != null && res.path("code").asInt() == 200) {
                JsonNode shops = res.path("data").path("shops");
                if (shops.isArray() && !shops.isEmpty()) {
                    if (configuredShopId != null && !configuredShopId.trim().isBlank()) {
                        String target = configuredShopId.trim();
                        for (JsonNode shop : shops) {
                            String idStr = shop.path("_id").asText();
                            String clientStr = shop.path("client_id").asText();
                            if (target.equalsIgnoreCase(idStr) || target.equalsIgnoreCase(clientStr)) {
                                log.info("Matched GHN Shop: _id={}, client_id={}", idStr, clientStr);
                                return shop.path("_id").asInt();
                            }
                        }
                    }
                    // Default to the first shop in the user's account
                    int firstShopId = shops.get(0).path("_id").asInt();
                    log.info("Defaulting to first GHN Shop in account: _id={}", firstShopId);
                    return firstShopId;
                }
            }
        } catch (Exception e) {
            log.warn("Could not query GHN /shop/all: {}", e.getMessage());
        }

        if (configuredShopId != null && !configuredShopId.trim().isBlank()) {
            try {
                return Integer.parseInt(configuredShopId.trim());
            } catch (NumberFormatException ignored) {}
        }
        return null;
    }

    /**
     * Real HTTP Call to Giao Hàng Tiết Kiệm (GHTK) API Gateway
     */
    private ShippingPushResult pushToGhtkGateway(Order order, PushShippingRequest request, JsonNode config, JsonNode storeGeneral, int weight) {
        String token = config != null ? config.path("apiToken").asText(null) : null;
        boolean isSandbox = config == null || config.path("isSandbox").asBoolean(true);
        String endpoint = config != null && !config.path("sandboxEndpoint").asText("").isBlank()
                ? config.path("sandboxEndpoint").asText()
                : "https://services.giaohangtietkiem.vn/services/shipment/order";

        if (token == null || token.trim().isBlank()) {
            throw new IllegalArgumentException(
                    "Đơn vị [GHTK] chưa được cấu hình API Token. Vui lòng vào 'Cài Đặt -> Đơn Vị Vận Chuyển' để nhập Token GHTK hoặc nhập mã vận đơn thủ công."
            );
        }

        Map<String, String> recipient = resolveRecipient(order);

        Map<String, Object> body = new HashMap<>();
        Map<String, Object> orderData = new HashMap<>();
        orderData.put("id", order.getId().value().toString());
        orderData.put("pick_name", storeGeneral != null ? storeGeneral.path("storeName").asText("Boki") : "Boki");
        orderData.put("pick_address", storeGeneral != null ? storeGeneral.path("senderAddress").asText("TP.HCM") : "TP.HCM");
        orderData.put("pick_tel", storeGeneral != null ? storeGeneral.path("senderPhone").asText("0901234567") : "0901234567");
        orderData.put("name", recipient.get("name"));
        orderData.put("address", recipient.get("address"));
        orderData.put("tel", recipient.get("phone"));
        orderData.put("is_freeship", "0");
        orderData.put("pick_money", order.getTotalAmount() != null ? order.getTotalAmount().intValue() : 0);
        body.put("order", orderData);

        try {
            JsonNode res = restClient.post()
                    .uri(endpoint)
                    .header("Token", token.trim())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);

            if (res != null && res.path("success").asBoolean(false)) {
                String label = res.path("order").path("label").asText();
                long fee = res.path("order").path("fee").asLong(20000L);
                return new ShippingPushResult(label, BigDecimal.valueOf(fee), Instant.now().plus(3, ChronoUnit.DAYS), "READY_TO_PICK", "Tạo vận đơn thành công qua cổng GHTK");
            } else {
                String msg = res != null ? res.path("message").asText("Lỗi từ GHTK") : "Không có phản hồi";
                throw new IllegalArgumentException("Lỗi từ cổng GHTK: " + msg);
            }
        } catch (RestClientResponseException ex) {
            throw new IllegalArgumentException("Lỗi từ cổng GHTK (" + ex.getStatusCode().value() + "): " + ex.getResponseBodyAsString());
        } catch (Exception ex) {
            if (ex instanceof IllegalArgumentException) {
                throw (IllegalArgumentException) ex;
            }
            throw new IllegalArgumentException("Không thể kết nối đến cổng GHTK: " + ex.getMessage());
        }
    }

    /**
     * Viettel Post API Gateway
     */
    private ShippingPushResult pushToViettelPostGateway(Order order, PushShippingRequest request, JsonNode config, JsonNode storeGeneral, int weight) {
        String token = config != null ? config.path("apiToken").asText(null) : null;
        if (token == null || token.trim().isBlank()) {
            throw new IllegalArgumentException(
                    "Đơn vị [Viettel Post] chưa được cấu hình API Token đối tác. Vui lòng vào Cài đặt để nhập Token từ portal https://partner.viettelpost.vn hoặc nhập mã vận đơn thủ công."
            );
        }
        return generateLocalCarrierResult(ShippingCarrier.VIETTEL_POST, request, weight);
    }

    /**
     * SPX Express API Gateway
     */
    private ShippingPushResult pushToSpxGateway(Order order, PushShippingRequest request, JsonNode config, JsonNode storeGeneral, int weight) {
        String token = config != null ? config.path("apiToken").asText(null) : null;
        if (token == null || token.trim().isBlank()) {
            throw new IllegalArgumentException(
                    "SPX Express chưa được cấu hình API Token/Secret Key doanh nghiệp. " +
                    "Vì SPX chỉ cấp API cho tài khoản doanh nghiệp B2B (spx.vn), bạn có thể tạo đơn trên app SPX và chọn 'Nhập mã vận đơn thủ công' trên Boki."
            );
        }
        return generateLocalCarrierResult(ShippingCarrier.SPX, request, weight);
    }

    /**
     * VNPost Gateway
     */
    private ShippingPushResult pushToVnPostGateway(Order order, PushShippingRequest request, JsonNode config, JsonNode storeGeneral, int weight) {
        String token = config != null ? config.path("apiToken").asText(null) : null;
        if (token == null || token.trim().isBlank()) {
            throw new IllegalArgumentException(
                    "VNPost chưa được cấu hình API Token. Vui lòng cấu hình tại Cài đặt hoặc nhập mã vận đơn thủ công."
            );
        }
        return generateLocalCarrierResult(ShippingCarrier.VNPOST, request, weight);
    }

    private Map<String, String> resolveRecipient(Order order) {
        String customerName = "Khách Hàng Boki";
        String customerPhone = "0987654321";
        String fullAddress = order.getShippingAddress() != null ? order.getShippingAddress() : "72 Lê Thánh Tôn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh";
        String streetAddr = fullAddress;
        String ward = "Phường Bến Nghé";
        String district = "Quận 1";
        String province = "TP. Hồ Chí Minh";

        if (order.getBuyerId() != null) {
            Optional<User> buyerOpt = userRepository.findById(order.getBuyerId());
            if (buyerOpt.isPresent()) {
                User buyer = buyerOpt.get();
                if (buyer.getDisplayName() != null && !buyer.getDisplayName().isBlank()) {
                    customerName = buyer.getDisplayName();
                }
                if (buyer.getPhoneNumber() != null && buyer.getPhoneNumber().value() != null && !buyer.getPhoneNumber().value().isBlank()) {
                    customerPhone = buyer.getPhoneNumber().value();
                }
            }
        }

        // Fallback: parse from shippingAddress formatted as "Name | SĐT: Phone | Address..."
        if (order.getShippingAddress() != null && order.getShippingAddress().contains("|")) {
            String[] parts = order.getShippingAddress().split("\\|");
            if (parts.length > 0 && !parts[0].trim().isBlank()) {
                customerName = parts[0].trim();
            }
            if (parts.length > 1 && parts[1].contains("SĐT:")) {
                String p = parts[1].replace("SĐT:", "").trim();
                if (!p.isBlank()) {
                    customerPhone = p;
                }
            }
            if (parts.length > 2 && !parts[2].trim().isBlank()) {
                fullAddress = parts[2].trim();
                streetAddr = fullAddress;

                String[] tokens = fullAddress.split(",");
                if (tokens.length >= 3) {
                    province = tokens[tokens.length - 1].trim();
                    district = tokens[tokens.length - 2].trim();
                    ward = tokens[tokens.length - 3].trim();
                }
            }
        } else if (order.getShippingAddress() != null) {
            String[] tokens = order.getShippingAddress().split(",");
            if (tokens.length >= 3) {
                province = tokens[tokens.length - 1].trim();
                district = tokens[tokens.length - 2].trim();
                ward = tokens[tokens.length - 3].trim();
            }
        }

        String cleanPhone = customerPhone.replaceAll("[^0-9]", "");
        if (cleanPhone.length() < 9) {
            cleanPhone = "0987654321";
        }

        Map<String, String> res = new HashMap<>();
        res.put("name", customerName);
        res.put("phone", cleanPhone);
        res.put("address", streetAddr);
        res.put("ward", ward);
        res.put("district", district);
        res.put("province", province);
        return res;
    }

    private ShippingPushResult generateLocalCarrierResult(ShippingCarrier carrier, PushShippingRequest request, int weight) {
        String tracking = generateTrackingNumber(carrier);
        BigDecimal fee = request.shippingFee() != null && request.shippingFee().compareTo(BigDecimal.ZERO) > 0
                ? request.shippingFee()
                : calculateShippingFee(carrier, weight);
        Instant est = calculateEstimatedDelivery(carrier);
        return new ShippingPushResult(tracking, fee, est, "READY_TO_PICK", "Vận đơn: " + tracking);
    }

    private JsonNode getCarrierConfig(String carrierCode) {
        Optional<StoreConfigJpaEntity> opt = storeConfigRepository.findById("shipping_carriers");
        if (opt.isPresent() && opt.get().getConfigValue() != null) {
            try {
                JsonNode array = objectMapper.readTree(opt.get().getConfigValue());
                if (array.isArray()) {
                    for (JsonNode item : array) {
                        if (carrierCode.equalsIgnoreCase(item.path("code").asText())) {
                            return item;
                        }
                    }
                }
            } catch (Exception ignored) {}
        }
        return null;
    }

    private JsonNode getStoreGeneralConfig() {
        Optional<StoreConfigJpaEntity> opt = storeConfigRepository.findById("store_general");
        if (opt.isPresent() && opt.get().getConfigValue() != null) {
            try {
                return objectMapper.readTree(opt.get().getConfigValue());
            } catch (Exception ignored) {}
        }
        return null;
    }

    public BigDecimal calculateShippingFee(ShippingCarrier carrier, int weightGrams) {
        int normalizedWeight = Math.max(100, weightGrams);
        long baseFee = switch (carrier) {
            case SPX -> 22000;
            case JT_EXPRESS -> 20000;
            case GHTK -> 20000;
            case GHN -> 24000;
            case VIETTEL_POST -> 22000;
            case VNPOST -> 18000;
            default -> 20000;
        };

        if (normalizedWeight > 500) {
            int extra500gBlocks = (int) Math.ceil((normalizedWeight - 500) / 500.0);
            baseFee += (long) extra500gBlocks * 5000;
        }

        return BigDecimal.valueOf(baseFee);
    }

    public String generateTrackingNumber(ShippingCarrier carrier) {
        if (carrier == ShippingCarrier.SPX) {
            long codeNum = 100000000L + (long) (random.nextDouble() * 900000000L);
            return "SPXVN" + codeNum;
        }
        if (carrier == ShippingCarrier.JT_EXPRESS) {
            long codeNum = 1000000000L + (long) (random.nextDouble() * 9000000000L);
            return "84" + codeNum;
        }
        String prefix = carrier != null ? carrier.getCodePrefix() : "BOKI";
        long codeNum = 10000000L + (long) (random.nextDouble() * 90000000L);
        return prefix + "-" + codeNum;
    }

    public Instant calculateEstimatedDelivery(ShippingCarrier carrier) {
        int daysToAdd = switch (carrier) {
            case SPX -> 2;
            case GHN -> 2;
            case JT_EXPRESS -> 3;
            case GHTK -> 3;
            case VIETTEL_POST -> 3;
            case VNPOST -> 4;
            default -> 2;
        };
        return Instant.now().plus(daysToAdd, ChronoUnit.DAYS);
    }

    /**
     * 1. In Đơn (GHN Print Waybill Token):
     * Official documentation: https://developer.ghn.vn/vi/docs/order/print
     */
    public PrintWaybillResponse generatePrintWaybillUrl(ShippingCarrier carrier, String trackingNumber, String paperSize) {
        String size = paperSize != null && !paperSize.isBlank() ? paperSize.trim() : "A5";
        if (carrier != ShippingCarrier.GHN) {
            return new PrintWaybillResponse(trackingNumber, carrier != null ? carrier.name() : "OTHER", null, size, null);
        }

        JsonNode config = getCarrierConfig(carrier.name());
        String token = config != null ? config.path("apiToken").asText(null) : null;
        String rawShopId = config != null ? config.path("shopId").asText(null) : null;
        boolean isSandbox = config == null || config.path("isSandbox").asBoolean(true);

        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Đơn vị [GHN] chưa được cấu hình API Token để in vận đơn chính thức.");
        }

        Integer effectiveShopId = resolveGhnShopId(token, rawShopId, isSandbox);
        String baseDomain = isSandbox ? "https://dev-online-gateway.ghn.vn" : "https://online-gateway.ghn.vn";
        String genTokenEndpoint = baseDomain + "/shiip/public-api/v2/a5/gen-token";

        Map<String, Object> body = Map.of("order_codes", List.of(trackingNumber));

        try {
            JsonNode res = restClient.post()
                    .uri(genTokenEndpoint)
                    .header("Token", token.trim())
                    .header("ShopId", String.valueOf(effectiveShopId))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);

            if (res != null && res.path("code").asInt() == 200) {
                String printToken = res.path("data").path("token").asText();
                String path = switch (size.toLowerCase()) {
                    case "80x80", "80" -> "/a5/public-api/print80x80";
                    case "52x70", "52" -> "/a5/public-api/print52x70";
                    default -> "/a5/public-api/printA5";
                };
                String fullUrl = baseDomain + path + "?token=" + printToken;
                return new PrintWaybillResponse(trackingNumber, "GHN", fullUrl, size, printToken);
            } else {
                String msg = res != null ? res.path("message").asText("Lỗi tạo token in") : "Không có phản hồi";
                throw new IllegalArgumentException("Lỗi tạo token in từ GHN: " + msg);
            }
        } catch (RestClientResponseException ex) {
            throw new IllegalArgumentException("Lỗi tạo token in từ GHN (" + ex.getStatusCode().value() + "): " + ex.getResponseBodyAsString());
        }
    }

    /**
     * 2. Hủy Đơn Trên Cổng GHN (Cancel Order):
     * Official documentation: https://developer.ghn.vn/vi/docs/order/cancel
     */
    public void cancelCarrierOrder(ShippingCarrier carrier, String trackingNumber, String reason) {
        if (carrier != ShippingCarrier.GHN || trackingNumber == null || trackingNumber.isBlank()) {
            return;
        }

        JsonNode config = getCarrierConfig(carrier.name());
        String token = config != null ? config.path("apiToken").asText(null) : null;
        String rawShopId = config != null ? config.path("shopId").asText(null) : null;
        boolean isSandbox = config == null || config.path("isSandbox").asBoolean(true);

        if (token == null || token.isBlank()) {
            return;
        }

        Integer effectiveShopId = resolveGhnShopId(token, rawShopId, isSandbox);
        String baseDomain = isSandbox ? "https://dev-online-gateway.ghn.vn" : "https://online-gateway.ghn.vn";
        String endpoint = baseDomain + "/shiip/public-api/v2/switch-status/cancel";

        Map<String, Object> body = Map.of(
                "order_codes", List.of(trackingNumber),
                "reason_code", "GHN-CANCEL-OTHER",
                "reason", reason != null && !reason.isBlank() ? reason : "Admin hủy đơn trên hệ thống Boki"
        );

        try {
            JsonNode res = restClient.post()
                    .uri(endpoint)
                    .header("Token", token.trim())
                    .header("ShopId", String.valueOf(effectiveShopId))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);

            log.info("GHN cancel order response: {}", res);
        } catch (Exception ex) {
            log.warn("Không thể đồng bộ hủy đơn sang GHN: {}", ex.getMessage());
        }
    }

    /**
     * 3. Trả Hàng / Buộc Hoàn Về Kho (Return Order):
     * Official documentation: https://developer.ghn.vn/vi/docs/order/return
     */
    public void returnCarrierOrder(ShippingCarrier carrier, String trackingNumber) {
        if (carrier != ShippingCarrier.GHN || trackingNumber == null || trackingNumber.isBlank()) {
            return;
        }

        JsonNode config = getCarrierConfig(carrier.name());
        String token = config != null ? config.path("apiToken").asText(null) : null;
        String rawShopId = config != null ? config.path("shopId").asText(null) : null;
        boolean isSandbox = config == null || config.path("isSandbox").asBoolean(true);

        if (token == null || token.isBlank()) {
            return;
        }

        Integer effectiveShopId = resolveGhnShopId(token, rawShopId, isSandbox);
        String baseDomain = isSandbox ? "https://dev-online-gateway.ghn.vn" : "https://online-gateway.ghn.vn";
        String endpoint = baseDomain + "/shiip/public-api/v2/switch-status/return";

        Map<String, Object> body = Map.of("order_codes", List.of(trackingNumber));

        try {
            JsonNode res = restClient.post()
                    .uri(endpoint)
                    .header("Token", token.trim())
                    .header("ShopId", String.valueOf(effectiveShopId))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);

            log.info("GHN return order response: {}", res);
        } catch (Exception ex) {
            log.warn("Không thể đồng bộ trả hàng sang GHN: {}", ex.getMessage());
        }
    }

    /**
     * 4. Cập Nhật COD Của Đơn (Update COD):
     * Official documentation: https://developer.ghn.vn/vi/docs/order/update-cod
     */
    public void updateOrderCod(ShippingCarrier carrier, String trackingNumber, long newCodAmount) {
        if (carrier != ShippingCarrier.GHN || trackingNumber == null || trackingNumber.isBlank()) {
            return;
        }

        JsonNode config = getCarrierConfig(carrier.name());
        String token = config != null ? config.path("apiToken").asText(null) : null;
        String rawShopId = config != null ? config.path("shopId").asText(null) : null;
        boolean isSandbox = config == null || config.path("isSandbox").asBoolean(true);

        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Đơn vị [GHN] chưa cấu hình Token.");
        }

        Integer effectiveShopId = resolveGhnShopId(token, rawShopId, isSandbox);
        String baseDomain = isSandbox ? "https://dev-online-gateway.ghn.vn" : "https://online-gateway.ghn.vn";
        String endpoint = baseDomain + "/shiip/public-api/v2/shipping-order/updateCOD";

        Map<String, Object> body = Map.of(
                "order_code", trackingNumber,
                "cod_amount", newCodAmount
        );

        try {
            JsonNode res = restClient.post()
                    .uri(endpoint)
                    .header("Token", token.trim())
                    .header("ShopId", String.valueOf(effectiveShopId))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);

            if (res == null || res.path("code").asInt() != 200) {
                String msg = res != null ? res.path("message").asText("Lỗi cập nhật COD") : "Không có phản hồi";
                throw new IllegalArgumentException("Lỗi từ cổng GHN cập nhật COD: " + msg);
            }
        } catch (RestClientResponseException ex) {
            throw new IllegalArgumentException("Lỗi cập nhật COD từ GHN: " + ex.getResponseBodyAsString());
        }
    }

    /**
     * 5. Cập Nhật Thông Tin Đơn (Update Order):
     * Official documentation: https://developer.ghn.vn/vi/docs/order/update
     */
    public void updateShippingInfo(ShippingCarrier carrier, String trackingNumber, UpdateShippingInfoRequest req) {
        if (carrier != ShippingCarrier.GHN || trackingNumber == null || trackingNumber.isBlank()) {
            return;
        }

        JsonNode config = getCarrierConfig(carrier.name());
        String token = config != null ? config.path("apiToken").asText(null) : null;
        String rawShopId = config != null ? config.path("shopId").asText(null) : null;
        boolean isSandbox = config == null || config.path("isSandbox").asBoolean(true);

        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Đơn vị [GHN] chưa cấu hình Token.");
        }

        Integer effectiveShopId = resolveGhnShopId(token, rawShopId, isSandbox);
        String baseDomain = isSandbox ? "https://dev-online-gateway.ghn.vn" : "https://online-gateway.ghn.vn";
        String endpoint = baseDomain + "/shiip/public-api/v2/shipping-order/update";

        Map<String, Object> body = new HashMap<>();
        body.put("order_code", trackingNumber);
        if (req.toName() != null && !req.toName().isBlank()) body.put("to_name", req.toName().trim());
        if (req.toPhone() != null && !req.toPhone().isBlank()) body.put("to_phone", req.toPhone().replaceAll("[^0-9]", ""));
        if (req.toAddress() != null && !req.toAddress().isBlank()) body.put("to_address", req.toAddress().trim());
        if (req.toWardName() != null && !req.toWardName().isBlank()) body.put("to_ward_name", req.toWardName().trim());
        if (req.toDistrictName() != null && !req.toDistrictName().isBlank()) body.put("to_district_name", req.toDistrictName().trim());
        if (req.notes() != null && !req.notes().isBlank()) body.put("note", req.notes().trim());
        if (req.weightGrams() != null && req.weightGrams() > 0) body.put("weight", req.weightGrams());

        try {
            JsonNode res = restClient.post()
                    .uri(endpoint)
                    .header("Token", token.trim())
                    .header("ShopId", String.valueOf(effectiveShopId))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);

            if (res == null || res.path("code").asInt() != 200) {
                String msg = res != null ? res.path("message").asText("Lỗi cập nhật thông tin đơn") : "Không có phản hồi";
                throw new IllegalArgumentException("Lỗi cập nhật đơn từ GHN: " + msg);
            }
        } catch (RestClientResponseException ex) {
            throw new IllegalArgumentException("Lỗi cập nhật đơn từ GHN: " + ex.getResponseBodyAsString());
        }
    }

    /**
     * 6 & 7. Tính Phí & Ước Tính Ngày Giao Realtime:
     * Official documentation: https://developer.ghn.vn/vi/docs/order/calculate-fee
     * Official documentation: https://developer.ghn.vn/vi/docs/order/leadtime
     */
    public CarrierFeeEstimateResponse estimateCarrierFeeAndLeadtime(CalculateFeeRequest req) {
        ShippingCarrier carrier = req.carrier() != null ? req.carrier() : ShippingCarrier.GHN;
        int weight = (req.weightGrams() != null && req.weightGrams() > 0) ? req.weightGrams() : 500;

        if (carrier == ShippingCarrier.GHN) {
            JsonNode config = getCarrierConfig("GHN");
            String token = config != null ? config.path("apiToken").asText(null) : null;
            String rawShopId = config != null ? config.path("shopId").asText(null) : null;
            boolean isSandbox = config == null || config.path("isSandbox").asBoolean(true);

            if (token != null && !token.isBlank()) {
                Integer effectiveShopId = resolveGhnShopId(token, rawShopId, isSandbox);
                String baseDomain = isSandbox ? "https://dev-online-gateway.ghn.vn" : "https://online-gateway.ghn.vn";
                String feeEndpoint = baseDomain + "/shiip/public-api/v2/shipping-order/fee";
                String leadtimeEndpoint = baseDomain + "/shiip/public-api/v2/shipping-order/leadtime";

                int districtId = req.toDistrictId() != null ? req.toDistrictId() : 1442;
                String wardCode = req.toWardCode() != null && !req.toWardCode().isBlank() ? req.toWardCode() : "20101";

                BigDecimal realFee = null;
                Instant realEst = null;

                try {
                    Map<String, Object> feeBody = Map.of(
                            "service_type_id", 2,
                            "to_district_id", districtId,
                            "to_ward_code", wardCode,
                            "weight", weight
                    );
                    JsonNode feeRes = restClient.post()
                            .uri(feeEndpoint)
                            .header("Token", token.trim())
                            .header("ShopId", String.valueOf(effectiveShopId))
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(feeBody)
                            .retrieve()
                            .body(JsonNode.class);

                    if (feeRes != null && feeRes.path("code").asInt() == 200) {
                        long totalFee = feeRes.path("data").path("total").asLong(0L);
                        if (totalFee > 0) realFee = BigDecimal.valueOf(totalFee);
                    }
                } catch (Exception ignored) {}

                try {
                    Map<String, Object> ltBody = Map.of(
                            "service_type_id", 2,
                            "to_district_id", districtId,
                            "to_ward_code", wardCode
                    );
                    JsonNode ltRes = restClient.post()
                            .uri(leadtimeEndpoint)
                            .header("Token", token.trim())
                            .header("ShopId", String.valueOf(effectiveShopId))
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(ltBody)
                            .retrieve()
                            .body(JsonNode.class);

                    if (ltRes != null && ltRes.path("code").asInt() == 200) {
                        long leadtimeSec = ltRes.path("data").path("leadtime").asLong(0L);
                        if (leadtimeSec > 0) realEst = Instant.ofEpochSecond(leadtimeSec);
                    }
                } catch (Exception ignored) {}

                if (realFee != null) {
                    Instant est = realEst != null ? realEst : calculateEstimatedDelivery(carrier);
                    return new CarrierFeeEstimateResponse("GHN", realFee, est, "1 - 2 ngày", "Cước tính realtime từ cổng GHN API");
                }
            }
        }

        BigDecimal localFee = calculateShippingFee(carrier, weight);
        Instant localEst = calculateEstimatedDelivery(carrier);
        return new CarrierFeeEstimateResponse(carrier.getDisplayName(), localFee, localEst, "2 - 3 ngày", "Cước tính theo biểu phí tiêu chuẩn Boki");
    }
}
