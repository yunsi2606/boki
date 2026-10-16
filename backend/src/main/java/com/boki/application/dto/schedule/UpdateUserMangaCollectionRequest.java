package com.boki.application.dto.schedule;

import jakarta.validation.constraints.NotNull;
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
public class UpdateUserMangaCollectionRequest {

    @NotNull
    private UUID scheduleId;

    private UUID editionId;

    @NotNull
    private String status; // OWNED, SEEKING, WISHLIST, DROPPED

    private BigDecimal purchasePrice;
    private String purchasePlace;
    private LocalDate purchasedAt;
    private String readingStatus; // UNREAD, READING, COMPLETED
    private Integer personalRating; // 1-5
    private String notes;
}
