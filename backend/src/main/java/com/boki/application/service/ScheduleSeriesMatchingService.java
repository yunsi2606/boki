package com.boki.application.service;

import com.boki.application.dto.schedule.OcrMatchStatus;
import com.boki.application.dto.schedule.OcrParsedBookItemDto;
import com.boki.domain.model.schedule.ReleaseEditionType;
import com.boki.infrastructure.persistence.entity.BookJpaEntity;
import com.boki.infrastructure.persistence.entity.ReleaseScheduleJpaEntity;
import com.boki.infrastructure.persistence.repository.BookJpaRepository;
import com.boki.infrastructure.persistence.repository.ReleaseScheduleJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScheduleSeriesMatchingService {

    private final ReleaseScheduleJpaRepository releaseScheduleRepository;
    private final BookJpaRepository bookRepository;

    private static final Pattern VOLUME_PATTERN = Pattern.compile(
            "(?i)(?:-|\\s+)?(tập|vol|volume|box\\s*set|bản\\s*đặc\\s*biệt)\\s*[:#]?\\s*([\\d+\\-~]+(?:\\+[\\d]+)?)");

    private static final Pattern CLEAN_EXTRA_PATTERN = Pattern.compile(
            "(?i)\\s*\\((?:manga\\s*wings\\s*books|light\\s*novel\\s*wings\\s*books|tủ\\s*sách\\s*ghibli|bản\\s*nâng\\s*cấp|deluxe\\s*edition)[^)]*\\)");

    public void enrichItemWithMatchingMetadata(OcrParsedBookItemDto item, String publisher) {
        String cleanTitle = item.getTitle() != null ? item.getTitle().trim() : "";
        String seriesName = extractSeriesName(cleanTitle);
        item.setSeriesTitle(seriesName);

        if (item.getPublisher() == null || item.getPublisher().isBlank()) {
            item.setPublisher(publisher);
        }

        if (item.getEditionType() == null) {
            item.setEditionType(detectEditionType(cleanTitle));
        }

        // 1. Check in past release schedules scoped by publisher
        boolean matchedInSchedules = matchFromPastSchedules(item, seriesName, publisher);
        if (matchedInSchedules) {
            return;
        }

        // 2. Check in existing books inventory
        boolean matchedInBooks = matchFromBooksInventory(item, seriesName);
        if (matchedInBooks) {
            return;
        }

        // 3. Not found -> New Series
        item.setMatchStatus(OcrMatchStatus.NEW_SERIES);
        item.setMatchMessage("Bộ truyện mới (Chưa có dữ liệu tập trước)");
    }

    public String extractSeriesName(String fullTitle) {
        if (fullTitle == null || fullTitle.isBlank()) return "";
        String s = fullTitle.trim();
        s = CLEAN_EXTRA_PATTERN.matcher(s).replaceAll("");

        int tapIndex = s.toLowerCase().indexOf(" - tập");
        if (tapIndex > 0) return s.substring(0, tapIndex).trim();

        int boxIndex = s.toLowerCase().indexOf(" - box set");
        if (boxIndex > 0) return s.substring(0, boxIndex).trim();

        int banDacBietIndex = s.toLowerCase().indexOf(" - bản đặc biệt");
        if (banDacBietIndex > 0) return s.substring(0, banDacBietIndex).trim();

        Matcher m = VOLUME_PATTERN.matcher(s);
        if (m.find() && m.start() > 2) {
            return s.substring(0, m.start()).trim();
        }

        return s;
    }

    private ReleaseEditionType detectEditionType(String title) {
        String lower = title.toLowerCase();
        if (lower.contains("box set") || lower.contains("boxset")) return ReleaseEditionType.BOXSET;
        if (lower.contains("đặc biệt") || lower.contains("special") || lower.contains("deluxe")) return ReleaseEditionType.SPECIAL;
        if (lower.contains("giới hạn") || lower.contains("limited")) return ReleaseEditionType.LIMITED;
        return ReleaseEditionType.STANDARD;
    }

    private boolean matchFromPastSchedules(OcrParsedBookItemDto item, String seriesName, String publisher) {
        if (seriesName == null || seriesName.length() < 2) return false;

        List<ReleaseScheduleJpaEntity> candidates = publisher != null && !publisher.isBlank()
                ? releaseScheduleRepository.findByPublisher(publisher.trim())
                : releaseScheduleRepository.findAll();

        ReleaseScheduleJpaEntity exactMatch = null;
        ReleaseScheduleJpaEntity similarMatch = null;

        String normSeries = normalizeForCompare(seriesName);

        for (ReleaseScheduleJpaEntity cand : candidates) {
            String candSeries = normalizeForCompare(extractSeriesName(cand.getTitle()));
            if (candSeries.equals(normSeries)) {
                exactMatch = cand;
                break;
            } else if (candSeries.contains(normSeries) || normSeries.contains(candSeries)) {
                if (similarMatch == null) similarMatch = cand;
            }
        }

        if (exactMatch != null) {
            item.setAuthor(exactMatch.getAuthor());
            item.setOriginalTitle(exactMatch.getOriginalTitle());
            item.setDescription(exactMatch.getDescription());
            item.setMatchStatus(OcrMatchStatus.EXACT_MATCH);
            item.setMatchMessage("Khớp chính xác: Kế thừa từ bộ đã có (" + exactMatch.getTitle() + ")");
            return true;
        }

        if (similarMatch != null) {
            item.setAuthor(similarMatch.getAuthor());
            item.setOriginalTitle(similarMatch.getOriginalTitle());
            item.setMatchStatus(OcrMatchStatus.SIMILAR_MATCH);
            item.setMatchMessage("Gợi ý khớp tương đồng (" + similarMatch.getTitle() + ")");
            return true;
        }

        return false;
    }

    private boolean matchFromBooksInventory(OcrParsedBookItemDto item, String seriesName) {
        if (seriesName == null || seriesName.length() < 2) return false;

        Page<BookJpaEntity> books = bookRepository.searchActiveBooks(
                BookJpaEntity.BookStatusJpa.ACTIVE, seriesName, PageRequest.of(0, 5));

        if (!books.isEmpty()) {
            BookJpaEntity book = books.getContent().get(0);
            item.setAuthor(book.getAuthor());
            if (book.getPublicationDetails() != null && book.getPublicationDetails().containsKey("original_title")) {
                item.setOriginalTitle(book.getPublicationDetails().get("original_title"));
            }
            item.setMatchedBookId(book.getId());
            item.setMatchStatus(OcrMatchStatus.EXACT_MATCH);
            item.setMatchMessage("Khớp với sách trên sàn Boki: " + book.getTitle());
            return true;
        }
        return false;
    }

    private String normalizeForCompare(String s) {
        if (s == null) return "";
        return s.toLowerCase()
                .replaceAll("[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]", "")
                .trim();
    }
}
