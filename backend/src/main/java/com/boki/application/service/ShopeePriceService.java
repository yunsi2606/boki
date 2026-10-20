package com.boki.application.service;

import com.boki.application.dto.schedule.ShopeePriceResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShopeePriceService {

    private static final String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            + "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    private static final Pattern PRODUCT_URL_PATTERN = Pattern.compile("(?:i\\.|product/|item/|shop/\\d+/item/)(\\d+)(?:/|\\.)(\\d+)");
    private static final Pattern QUERY_PARAM_PATTERN = Pattern.compile("itemid=(\\d+).*?shopid=(\\d+)|shopid=(\\d+).*?itemid=(\\d+)");

    private final ObjectMapper objectMapper;

    public ShopeePriceResponse checkPrice(String inputUrl) {
        if (inputUrl == null || inputUrl.isBlank()) {
            return ShopeePriceResponse.builder().success(false).message("URL không được để trống").build();
        }

        try {
            String resolvedUrl = resolveRedirects(inputUrl.trim());
            Long[] ids = extractShopAndItemId(resolvedUrl);
            if (ids == null) {
                return ShopeePriceResponse.builder().success(false).productUrl(resolvedUrl)
                        .message("Không thể nhận diện Shop ID và Item ID từ liên kết Shopee").build();
            }

            Long shopId = ids[0];
            Long itemId = ids[1];
            return fetchShopeeItemData(shopId, itemId, resolvedUrl);
        } catch (Exception e) {
            log.warn("Lỗi kiểm tra giá Shopee từ url {}: {}", inputUrl, e.getMessage());
            return ShopeePriceResponse.builder().success(false).productUrl(inputUrl)
                    .message("Không thể lấy giá tự động: " + e.getMessage()).build();
        }
    }

    private String resolveRedirects(String urlStr) {
        String currentUrl = urlStr;
        int hops = 0;
        while (hops < 5) {
            try {
                URL url = URI.create(currentUrl).toURL();
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setInstanceFollowRedirects(false);
                conn.setConnectTimeout(4000);
                conn.setReadTimeout(4000);
                conn.setRequestProperty("User-Agent", USER_AGENT);
                conn.connect();

                int responseCode = conn.getResponseCode();
                if (responseCode == HttpURLConnection.HTTP_MOVED_PERM
                        || responseCode == HttpURLConnection.HTTP_MOVED_TEMP
                        || responseCode == 307 || responseCode == 308) {
                    String location = conn.getHeaderField("Location");
                    if (location != null && !location.isBlank()) {
                        currentUrl = location.startsWith("http") ? location : URI.create(currentUrl).resolve(location).toString();
                        hops++;
                        continue;
                    }
                }
                break;
            } catch (Exception e) {
                break;
            }
        }
        return currentUrl;
    }

    private Long[] extractShopAndItemId(String url) {
        Matcher m = PRODUCT_URL_PATTERN.matcher(url);
        if (m.find()) {
            try {
                return new Long[]{Long.parseLong(m.group(1)), Long.parseLong(m.group(2))};
            } catch (NumberFormatException ignored) {}
        }

        Matcher qm = QUERY_PARAM_PATTERN.matcher(url);
        if (qm.find()) {
            try {
                if (qm.group(1) != null && qm.group(2) != null) {
                    return new Long[]{Long.parseLong(qm.group(2)), Long.parseLong(qm.group(1))};
                } else if (qm.group(3) != null && qm.group(4) != null) {
                    return new Long[]{Long.parseLong(qm.group(3)), Long.parseLong(qm.group(4))};
                }
            } catch (NumberFormatException ignored) {}
        }
        return null;
    }

    private ShopeePriceResponse fetchShopeeItemData(Long shopId, Long itemId, String originalUrl) {
        String apiUrl = String.format("https://shopee.vn/api/v4/item/get?itemid=%d&shopid=%d", itemId, shopId);
        try {
            URL url = URI.create(apiUrl).toURL();
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);
            conn.setRequestProperty("User-Agent", USER_AGENT);
            conn.setRequestProperty("Accept", "application/json");
            conn.setRequestProperty("Referer", "https://shopee.vn/");
            conn.setRequestProperty("x-api-source", "pc");

            if (conn.getResponseCode() != 200) {
                return ShopeePriceResponse.builder().success(false).shopId(shopId).itemId(itemId)
                        .productUrl(originalUrl).message("Shopee trả về mã phản hồi " + conn.getResponseCode()
                                + ". Bạn có thể điền giá bán thủ công.").build();
            }

            try (InputStream is = conn.getInputStream()) {
                JsonNode root = objectMapper.readTree(is);
                JsonNode data = root.path("data");
                if (data.isMissingNode() || data.isNull()) {
                    return ShopeePriceResponse.builder().success(false).shopId(shopId).itemId(itemId)
                            .productUrl(originalUrl).message("Không tìm thấy thông tin sản phẩm trên Shopee").build();
                }

                String name = data.path("name").asText(null);
                long rawPrice = data.path("price").asLong(0);
                if (rawPrice == 0) rawPrice = data.path("price_min").asLong(0);
                long rawOriginalPrice = data.path("price_before_discount").asLong(0);
                int historicalSold = data.path("historical_sold").asInt(0);

                BigDecimal price = rawPrice > 0 ? BigDecimal.valueOf(rawPrice)
                        .divide(BigDecimal.valueOf(100000), 0, RoundingMode.HALF_UP) : null;
                BigDecimal priceBefore = rawOriginalPrice > 0 ? BigDecimal.valueOf(rawOriginalPrice)
                        .divide(BigDecimal.valueOf(100000), 0, RoundingMode.HALF_UP) : null;

                return ShopeePriceResponse.builder()
                        .success(true)
                        .shopId(shopId)
                        .itemId(itemId)
                        .productName(name)
                        .price(price)
                        .priceBeforeDiscount(priceBefore)
                        .historicalSold(historicalSold)
                        .productUrl(originalUrl)
                        .build();
            }
        } catch (Exception e) {
            log.warn("Không thể fetch dữ liệu Shopee item {}/{}: {}", itemId, shopId, e.getMessage());
            return ShopeePriceResponse.builder().success(false).shopId(shopId).itemId(itemId)
                    .productUrl(originalUrl).message("Lỗi kết nối Shopee: " + e.getMessage()).build();
        }
    }
}
