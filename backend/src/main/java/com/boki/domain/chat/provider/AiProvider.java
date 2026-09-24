package com.boki.domain.chat.provider;

public interface AiProvider {
    /**
     * Tạo phản hồi hoặc đề xuất Tool Call từ AI engine.
     */
    AiResponse generate(AiRequest request);

    /**
     * Kiểm tra Provider có sẵn sàng hoạt động (đã cấu hình API key, network ok).
     */
    boolean isAvailable();

    /**
     * Tên nhận diện của Provider (e.g. "MockAiProvider", "GeminiProvider", "OpenAiProvider").
     */
    String getProviderName();
}
