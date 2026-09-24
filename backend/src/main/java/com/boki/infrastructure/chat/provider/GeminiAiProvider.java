package com.boki.infrastructure.chat.provider;

import com.boki.domain.chat.provider.AiProvider;
import com.boki.domain.chat.provider.AiRequest;
import com.boki.domain.chat.provider.AiResponse;
import com.boki.domain.chat.tool.ToolMetadata;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.*;

@Component
public class GeminiAiProvider implements AiProvider {

    private static final Logger log = LoggerFactory.getLogger(GeminiAiProvider.class);

    @Value("${boki.ai.gemini.api-key:}")
    private String apiKey;

    @Value("${boki.ai.gemini.model:gemini-1.5-flash}")
    private String modelName;

    private final RestClient restClient;

    public GeminiAiProvider() {
        this.restClient = RestClient.builder().build();
    }

    @Override
    public String getProviderName() {
        return "GeminiProvider";
    }

    @Override
    public boolean isAvailable() {
        return apiKey != null && !apiKey.isBlank();
    }

    @Override
    public AiResponse generate(AiRequest request) {
        if (!isAvailable()) {
            return AiResponse.direct("Gemini API Key chưa được cấu hình.", getProviderName());
        }

        try {
            String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", modelName, apiKey);

            // Xây dựng JSON payload cho Gemini REST API
            Map<String, Object> body = new LinkedHashMap<>();
            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> userContent = new LinkedHashMap<>();
            userContent.put("role", "user");
            userContent.put("parts", List.of(Map.of("text", request.userMessage())));
            contents.add(userContent);
            body.put("contents", contents);

            // Cung cấp Tool declarations
            if (request.availableTools() != null && !request.availableTools().isEmpty()) {
                List<Map<String, Object>> functionDecls = new ArrayList<>();
                for (ToolMetadata tool : request.availableTools()) {
                    Map<String, Object> func = new LinkedHashMap<>();
                    func.put("name", tool.name());
                    func.put("description", tool.description());
                    functionDecls.add(func);
                }
                body.put("tools", List.of(Map.of("functionDeclarations", functionDecls)));
            }

            Map response = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("candidates")) {
                List candidates = (List) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Map first = (Map) candidates.get(0);
                    Map content = (Map) first.get("content");
                    if (content != null && content.containsKey("parts")) {
                        List parts = (List) content.get("parts");
                        for (Object pObj : parts) {
                            Map part = (Map) pObj;
                            if (part.containsKey("functionCall")) {
                                Map fc = (Map) part.get("functionCall");
                                String toolName = (String) fc.get("name");
                                Map<String, Object> args = (Map<String, Object>) fc.get("args");
                                return AiResponse.withTool(toolName, args, "Gemini đề xuất thực thi công cụ " + toolName, getProviderName());
                            } else if (part.containsKey("text")) {
                                return AiResponse.direct((String) part.get("text"), getProviderName());
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi gọi Gemini API: {}", e.getMessage());
        }

        return AiResponse.direct("", getProviderName());
    }
}
