package com.boki.domain.chat.model;

import java.time.Instant;
import java.util.*;

public class ConversationState {
    private final String sessionId;
    private UUID userId;
    private String userRole; // "BUYER", "ADMIN", "SELLER", "GUEST"
    private String currentPath;
    private PageContext pageContext;
    private String lastIntent;
    private final Map<String, Object> entities = new HashMap<>();
    private final List<ChatTurn> recentMessages = new ArrayList<>();
    private final List<UUID> viewedBooks = new ArrayList<>();
    private final List<UUID> recommendedBooks = new ArrayList<>();
    private final Map<String, Object> cartContext = new HashMap<>();
    private Instant lastActiveAt;

    public ConversationState(String sessionId) {
        this.sessionId = sessionId;
        this.pageContext = PageContext.unknown();
        this.lastActiveAt = Instant.now();
    }

    public record ChatTurn(
            String role, // "user", "assistant", "system"
            String content,
            Instant timestamp,
            List<String> toolsCalled
    ) {}

    public void addTurn(String role, String content, List<String> toolsCalled) {
        recentMessages.add(new ChatTurn(role, content, Instant.now(), toolsCalled != null ? toolsCalled : List.of()));
        // Keep last 10 turns
        if (recentMessages.size() > 10) {
            recentMessages.remove(0);
        }
        this.lastActiveAt = Instant.now();
    }

    public void addRecommendedBooks(List<UUID> bookIds) {
        this.recommendedBooks.clear();
        if (bookIds != null) {
            this.recommendedBooks.addAll(bookIds);
        }
    }

    public void addViewedBook(UUID bookId) {
        if (bookId != null && !viewedBooks.contains(bookId)) {
            viewedBooks.add(bookId);
            if (viewedBooks.size() > 10) {
                viewedBooks.remove(0);
            }
        }
    }

    // Getters & Setters
    public String getSessionId() { return sessionId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }
    public String getCurrentPath() { return currentPath; }
    public void setCurrentPath(String currentPath) { this.currentPath = currentPath; }
    public PageContext getPageContext() { return pageContext; }
    public void setPageContext(PageContext pageContext) { this.pageContext = pageContext; }
    public String getLastIntent() { return lastIntent; }
    public void setLastIntent(String lastIntent) { this.lastIntent = lastIntent; }
    public Map<String, Object> getEntities() { return entities; }
    public List<ChatTurn> getRecentMessages() { return recentMessages; }
    public List<UUID> getViewedBooks() { return viewedBooks; }
    public List<UUID> getRecommendedBooks() { return recommendedBooks; }
    public Map<String, Object> getCartContext() { return cartContext; }
    public Instant getLastActiveAt() { return lastActiveAt; }
    public void setLastActiveAt(Instant lastActiveAt) { this.lastActiveAt = lastActiveAt; }
}
