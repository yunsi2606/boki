package com.boki.domain.model.order;

public enum ShippingCarrier {
    SPX("SPX Express", "SPX"),
    JT_EXPRESS("J&T Express", "JNT"),
    GHN("Giao Hàng Nhanh", "GHN"),
    GHTK("Giao Hàng Tiết Kiệm", "GHTK"),
    VIETTEL_POST("Viettel Post", "VTP"),
    VNPOST("VNPost Bưu Điện", "VNP"),
    OTHER("Đơn Vị Khác / Tự Giao", "BOKI");

    private final String displayName;
    private final String codePrefix;

    ShippingCarrier(String displayName, String codePrefix) {
        this.displayName = displayName;
        this.codePrefix = codePrefix;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getCodePrefix() {
        return codePrefix;
    }

    public static ShippingCarrier fromDisplayName(String name) {
        if (name == null || name.isBlank()) return OTHER;
        for (ShippingCarrier c : values()) {
            if (c.name().equalsIgnoreCase(name) || c.displayName.equalsIgnoreCase(name) || name.toUpperCase().contains(c.name())) {
                return c;
            }
        }
        return OTHER;
    }
}
