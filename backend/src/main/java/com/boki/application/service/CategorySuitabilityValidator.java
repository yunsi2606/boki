package com.boki.application.service;

import com.boki.application.dto.response.CategoryCheckResultResponse;
import com.boki.application.dto.response.CategoryResponse;
import com.boki.domain.model.category.Category;
import com.boki.infrastructure.util.SlugUtils;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Validates category suitability, naming conventions, and similarity against existing categories.
 */
@Component
public class CategorySuitabilityValidator {

    private static final Pattern VALID_CHARS_PATTERN = Pattern.compile("^[\\p{L}\\p{N}\\s&\\-,/\\+\\(\\)'.]+$");
    private static final Pattern REPEATED_CHARS_PATTERN = Pattern.compile("(.)\\1{3,}");
    private static final Set<String> INAPPROPRIATE_WORDS = Set.of(
            "fuck", "shit", "bitch", "porn", "sex", "xxx", "đm", "dm", "vcl", "vl",
            "dkm", "cặc", "cac", "lồn", "lon", "buồi", "buoi", "địt", "dit", "đụ", "du"
    );

    public CategoryCheckResultResponse validate(String rawName, List<Category> allCategories) {
        if (rawName == null || rawName.trim().isBlank()) {
            return new CategoryCheckResultResponse(false, "Tên danh mục không được để trống.", false, Collections.emptyList());
        }

        String name = rawName.trim();

        if (name.length() < 2) {
            return new CategoryCheckResultResponse(false, "Tên danh mục quá ngắn (tối thiểu 2 ký tự).", false, Collections.emptyList());
        }
        if (name.length() > 50) {
            return new CategoryCheckResultResponse(false, "Tên danh mục quá dài (tối đa 50 ký tự cho thể loại sách).", false, Collections.emptyList());
        }

        if (name.matches("^\\d+$")) {
            return new CategoryCheckResultResponse(false, "Tên danh mục không thể chỉ bao gồm các chữ số.", false, Collections.emptyList());
        }

        if (!VALID_CHARS_PATTERN.matcher(name).matches()) {
            return new CategoryCheckResultResponse(false, "Tên danh mục chứa ký tự đặc biệt không hợp lệ.", false, Collections.emptyList());
        }

        if (REPEATED_CHARS_PATTERN.matcher(name).find()) {
            return new CategoryCheckResultResponse(false, "Tên danh mục chứa các ký tự lặp lại bất thường (có dấu hiệu vô nghĩa/spam).", false, Collections.emptyList());
        }

        String lowerTrim = name.toLowerCase(Locale.ROOT).replaceAll("[\\s\\-_/]+", "");
        if (lowerTrim.matches(".*(asdf|qwer|zxcv|hjkl|jklm|uiop).*") && lowerTrim.length() <= 12) {
            return new CategoryCheckResultResponse(false, "Tên danh mục có dấu hiệu gõ phím vô nghĩa ngẫu nhiên.", false, Collections.emptyList());
        }

        String normalizedInput = SlugUtils.slugify(name).replace("-", " ");
        for (String word : normalizedInput.split("\\s+")) {
            if (INAPPROPRIATE_WORDS.contains(word.toLowerCase(Locale.ROOT))) {
                return new CategoryCheckResultResponse(false, "Tên danh mục chứa từ ngữ không phù hợp với chuẩn mực xuất bản sách.", false, Collections.emptyList());
            }
        }

        String inputSlug = SlugUtils.slugify(name);
        for (Category existing : allCategories) {
            if (existing.getName().trim().equalsIgnoreCase(name) || existing.getSlug().equalsIgnoreCase(inputSlug)) {
                return new CategoryCheckResultResponse(
                        false,
                        "Danh mục '" + existing.getName() + "' đã tồn tại trong hệ thống. Vui lòng chọn danh mục có sẵn thay vì tạo mới.",
                        true,
                        List.of(toResponse(existing))
                );
            }
        }

        List<SimilarCategoryMatch> matches = new ArrayList<>();
        for (Category existing : allCategories) {
            double score = calculateSimilarity(name, existing.getName());
            if (score >= 0.50) {
                matches.add(new SimilarCategoryMatch(existing, score));
            }
        }

        matches.sort((a, b) -> Double.compare(b.score, a.score));
        List<CategoryResponse> similarResponses = matches.stream()
                .limit(4)
                .map(m -> toResponse(m.category))
                .collect(Collectors.toList());

        if (!similarResponses.isEmpty()) {
            return new CategoryCheckResultResponse(
                    true,
                    "Phát hiện " + similarResponses.size() + " danh mục tương tự đã có sẵn. Hãy kiểm tra kỹ xem có thể dùng danh mục có sẵn hay không.",
                    false,
                    similarResponses
            );
        }

        return new CategoryCheckResultResponse(true, "Tên danh mục hợp lệ và phù hợp cho ngành sách.", false, Collections.emptyList());
    }

    private double calculateSimilarity(String s1, String s2) {
        String norm1 = SlugUtils.slugify(s1);
        String norm2 = SlugUtils.slugify(s2);
        if (norm1.equals(norm2)) return 1.0;

        if (norm1.contains(norm2) || norm2.contains(norm1)) {
            double lengthRatio = (double) Math.min(norm1.length(), norm2.length()) / Math.max(norm1.length(), norm2.length());
            return Math.max(0.70, lengthRatio);
        }

        Set<String> words1 = new HashSet<>(Arrays.asList(norm1.split("-")));
        Set<String> words2 = new HashSet<>(Arrays.asList(norm2.split("-")));
        Set<String> union = new HashSet<>(words1);
        union.addAll(words2);
        Set<String> intersection = new HashSet<>(words1);
        intersection.retainAll(words2);

        double jaccard = union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();
        int levDistance = computeLevenshtein(norm1, norm2);
        double levSimilarity = 1.0 - ((double) levDistance / Math.max(norm1.length(), norm2.length()));
        return Math.max(jaccard, levSimilarity);
    }

    private int computeLevenshtein(String a, String b) {
        int[] costs = new int[b.length() + 1];
        for (int j = 0; j <= b.length(); j++) costs[j] = j;
        for (int i = 1; i <= a.length(); i++) {
            costs[0] = i;
            int nw = i - 1;
            for (int j = 1; j <= b.length(); j++) {
                int cj = Math.min(1 + Math.min(costs[j], costs[j - 1]), a.charAt(i - 1) == b.charAt(j - 1) ? nw : nw + 1);
                nw = costs[j];
                costs[j] = cj;
            }
        }
        return costs[b.length()];
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getParentId()
        );
    }

    private static class SimilarCategoryMatch {
        final Category category;
        final double score;

        SimilarCategoryMatch(Category category, double score) {
            this.category = category;
            this.score = score;
        }
    }
}
