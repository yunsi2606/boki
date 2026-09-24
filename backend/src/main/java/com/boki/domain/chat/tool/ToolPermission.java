package com.boki.domain.chat.tool;

public enum ToolPermission {
    PUBLIC,             // Khách vãng lai và mọi người dùng đều gọi được
    BUYER_ONLY,         // Cần đăng nhập (bất kể role gì)
    SELLER_OR_ADMIN,    // Cần quyền SELLER hoặc ADMIN
    ADMIN_ONLY          // Chỉ duy nhất ADMIN
}
