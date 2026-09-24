package com.boki.domain.chat.tool;

import java.util.List;
import java.util.Map;

public record ToolMetadata(
        String name,
        String description,
        ToolCategory category,
        Map<String, String> parameterDescriptions,
        List<String> requiredParameters
) {
    public enum ToolCategory {
        CLIENT,
        ADMIN
    }

    public static ToolMetadata client(String name, String description, Map<String, String> params, List<String> required) {
        return new ToolMetadata(name, description, ToolCategory.CLIENT, params != null ? params : Map.of(), required != null ? required : List.of());
    }

    public static ToolMetadata admin(String name, String description, Map<String, String> params, List<String> required) {
        return new ToolMetadata(name, description, ToolCategory.ADMIN, params != null ? params : Map.of(), required != null ? required : List.of());
    }
}
