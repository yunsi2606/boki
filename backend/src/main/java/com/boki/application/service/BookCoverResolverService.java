package com.boki.application.service;

import com.boki.infrastructure.storage.CloudflareR2StorageService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class BookCoverResolverService {

    private static final Logger log = LoggerFactory.getLogger(BookCoverResolverService.class);
    private final CloudflareR2StorageService storageService;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public BookCoverResolverService(CloudflareR2StorageService storageService, ObjectMapper objectMapper) {
        this.storageService = storageService;
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
    }

    public String resolveAndUploadCover(String isbn, String title) {
        String cleanIsbn = isbn != null ? isbn.replaceAll("[^0-9X]", "") : "";
        String imageUrl = null;

        // Source 1: Tiki Open Catalog API by ISBN
        if (!cleanIsbn.isBlank()) {
            imageUrl = fetchFromTiki("https://tiki.vn/api/v2/products?q=" + cleanIsbn);
        }

        // Source 2: OpenLibrary Cover by ISBN
        if (imageUrl == null && !cleanIsbn.isBlank()) {
            imageUrl = checkOpenLibrary(cleanIsbn);
        }

        // Source 3: Tiki Open Catalog API by Title
        if (imageUrl == null && title != null && !title.isBlank()) {
            String encodedTitle = URLEncoder.encode(title.trim(), StandardCharsets.UTF_8);
            imageUrl = fetchFromTiki("https://tiki.vn/api/v2/products?q=" + encodedTitle);
        }

        // Source 4: Google Books API Fallback
        if (imageUrl == null && !cleanIsbn.isBlank()) {
            imageUrl = fetchFromGoogleBooks(cleanIsbn);
        }

        if (imageUrl != null) {
            log.info("Found cover image for [{} / {}]: {}", cleanIsbn, title, imageUrl);
            return storageService.uploadFromUrl(imageUrl);
        }

        return null;
    }

    private String fetchFromTiki(String url) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<String> res = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            if (res.getStatusCode().is2xxSuccessful() && res.getBody() != null) {
                JsonNode root = objectMapper.readTree(res.getBody());
                JsonNode data = root.path("data");
                if (data.isArray() && !data.isEmpty()) {
                    JsonNode firstItem = data.get(0);
                    JsonNode thumb = firstItem.path("thumbnail_url");
                    if (!thumb.isMissingNode() && !thumb.asText().isBlank()) {
                        return thumb.asText();
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Tiki cover lookup failed: {}", e.getMessage());
        }
        return null;
    }

    private String checkOpenLibrary(String isbn) {
        String url = "https://covers.openlibrary.org/b/isbn/" + isbn + "-L.jpg?default=false";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<byte[]> res = restTemplate.exchange(url, HttpMethod.HEAD, entity, byte[].class);
            if (res.getStatusCode().is2xxSuccessful()) {
                return url;
            }
        } catch (Exception ignored) {
            // 404 if cover does not exist on OpenLibrary
        }
        return null;
    }

    private String fetchFromGoogleBooks(String isbn) {
        String url = "https://www.googleapis.com/books/v1/volumes?q=isbn:" + isbn;
        try {
            ResponseEntity<String> res = restTemplate.getForEntity(url, String.class);
            if (res.getStatusCode().is2xxSuccessful() && res.getBody() != null) {
                JsonNode root = objectMapper.readTree(res.getBody());
                JsonNode items = root.path("items");
                if (items.isArray() && !items.isEmpty()) {
                    JsonNode imageLinks = items.get(0).path("volumeInfo").path("imageLinks");
                    JsonNode thumb = imageLinks.path("thumbnail");
                    if (!thumb.isMissingNode() && !thumb.asText().isBlank()) {
                        return thumb.asText().replace("http://", "https://");
                    }
                }
            }
        } catch (Exception ignored) {}
        return null;
    }
}
