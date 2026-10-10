package com.boki.application.dto.schedule;

import com.boki.domain.model.schedule.ReleaseEditionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OcrParsedBookItemDto {
    private String tempId;
    private LocalDate releaseDate;
    private String rawText;
    private String title;
    private String seriesTitle;
    private String volume;
    private String publisher;
    private BigDecimal estimatedPrice;
    private ReleaseEditionType editionType;
    private String editionName;
    private String gifts;
    private String author;
    private String originalTitle;
    private String coverUrl;
    private String description;
    private OcrMatchStatus matchStatus;
    private String matchMessage;
    private UUID matchedBookId;
    @Builder.Default
    private boolean selected = true;
}
