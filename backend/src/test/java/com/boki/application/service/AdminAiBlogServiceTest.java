package com.boki.application.service;

import com.boki.application.dto.request.AiGenerateBlogRequest;
import com.boki.application.dto.response.AiGenerateBlogResponse;
import com.boki.domain.model.book.*;
import com.boki.domain.model.user.UserId;
import com.boki.domain.port.out.BookRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminAiBlogServiceTest {

    @Mock
    private BookRepository bookRepository;

    private AdminAiBlogService service;

    @BeforeEach
    void setUp() {
        service = new AdminAiBlogService(bookRepository, new ObjectMapper());
    }

    @Test
    @DisplayName("Should generate FULL_ARTICLE with built-in smart engine fallback")
    void testGenerateFullArticle() {
        AiGenerateBlogRequest request = new AiGenerateBlogRequest(
                "FULL_ARTICLE",
                "Tâm lý học về tiền",
                null,
                "Đánh giá sách",
                "INSPIRING",
                "MEDIUM",
                "BOOK_LOVERS",
                null,
                null,
                null
        );

        AiGenerateBlogResponse response = service.generateBlogContent(request);

        assertNotNull(response);
        assertNotNull(response.title());
        assertFalse(response.title().isBlank());
        assertNotNull(response.content());
        assertTrue(response.content().contains("<h2>"));
        assertTrue(response.content().contains("<p>"));
        assertNotNull(response.tags());
        assertFalse(response.tags().isEmpty());
        assertEquals("Boki Smart Engine (Nội bộ)", response.providerName());
    }

    @Test
    @DisplayName("Should generate OUTLINE when requested")
    void testGenerateOutline() {
        AiGenerateBlogRequest request = new AiGenerateBlogRequest(
                "OUTLINE",
                "Thói quen nguyên tử",
                null,
                "Góc đọc",
                "ANALYTICAL",
                "SHORT",
                "GENERAL",
                null,
                null,
                null
        );

        AiGenerateBlogResponse response = service.generateBlogContent(request);

        assertNotNull(response);
        assertTrue(response.title().contains("Dàn ý"));
        assertNotNull(response.outline());
        assertFalse(response.outline().isEmpty());
    }

    @Test
    @DisplayName("Should enrich article when reference book is provided")
    void testGenerateWithBookContext() {
        UUID bookUuid = UUID.randomUUID();
        Book mockBook = Book.create(
                UserId.of(UUID.randomUUID()),
                "Đắc Nhân Tâm",
                "Dale Carnegie",
                Price.of(BigDecimal.valueOf(86000)),
                BookCondition.NEW,
                10,
                List.of("https://example.com/cover.jpg")
        );

        when(bookRepository.findById(any(BookId.class))).thenReturn(Optional.of(mockBook));

        AiGenerateBlogRequest request = new AiGenerateBlogRequest(
                "FULL_ARTICLE",
                null,
                bookUuid,
                "Đánh giá sách",
                "PROFESSIONAL",
                "DETAILED",
                "BOOK_LOVERS",
                null,
                null,
                null
        );

        AiGenerateBlogResponse response = service.generateBlogContent(request);

        assertNotNull(response);
        assertTrue(response.title().contains("Đắc Nhân Tâm"));
        assertTrue(response.content().contains("Dale Carnegie"));
    }
}
