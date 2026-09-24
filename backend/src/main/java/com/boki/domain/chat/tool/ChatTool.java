package com.boki.domain.chat.tool;

import java.util.Map;

public interface ChatTool {
    /**
     * Tên định danh duy nhất của Tool (e.g. "searchBooks", "getOrder", "getRevenue").
     */
    String getName();

    /**
     * Metadata mô tả chức năng, danh mục và tham số của Tool phục vụ Tool Selection / LLM.
     */
    ToolMetadata getMetadata();

    /**
     * Mức quyền tối thiểu cần có để thực thi Tool.
     */
    ToolPermission getRequiredPermission();

    /**
     * Thực thi nghiệp vụ lấy dữ liệu từ Database / Business Services.
     */
    ToolResult execute(ToolExecutionContext context, Map<String, Object> params);
}
