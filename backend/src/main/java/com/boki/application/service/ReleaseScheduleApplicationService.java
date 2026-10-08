package com.boki.application.service;

import com.boki.application.dto.schedule.CreateReleaseScheduleRequest;
import com.boki.application.dto.schedule.ReleaseScheduleDto;
import com.boki.application.dto.schedule.UpdateReleaseScheduleRequest;
import com.boki.application.exception.ResourceNotFoundException;
import com.boki.application.mapper.ReleaseScheduleMapper;
import com.boki.domain.model.schedule.ReleaseEditionType;
import com.boki.domain.model.schedule.ReleaseScheduleStatus;
import com.boki.infrastructure.persistence.entity.ReleaseScheduleJpaEntity;
import com.boki.infrastructure.persistence.repository.BookJpaRepository;
import com.boki.infrastructure.persistence.repository.ReleaseScheduleJpaRepository;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReleaseScheduleApplicationService {

    private final ReleaseScheduleJpaRepository releaseScheduleJpaRepository;
    private final BookJpaRepository bookJpaRepository;
    private final ReleaseScheduleMapper releaseScheduleMapper;

    @Transactional(readOnly = true)
    public List<ReleaseScheduleDto> getSchedules(Integer month, Integer year, String publisher, Boolean hasBook) {
        Specification<ReleaseScheduleJpaEntity> spec = (root, query, cb) -> {
            if (query != null && Long.class != query.getResultType()) {
                root.fetch("book", JoinType.LEFT);
            }
            List<Predicate> predicates = new ArrayList<>();

            if (year != null && month != null) {
                YearMonth ym = YearMonth.of(year, month);
                predicates.add(cb.between(root.get("releaseDate"), ym.atDay(1), ym.atEndOfMonth()));
            } else if (year != null) {
                predicates.add(cb.between(root.get("releaseDate"), LocalDate.of(year, 1, 1), LocalDate.of(year, 12, 31)));
            }

            if (publisher != null && !publisher.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("publisher")), publisher.trim().toLowerCase()));
            }

            if (hasBook != null) {
                if (hasBook) {
                    predicates.add(cb.isNotNull(root.get("bookId")));
                } else {
                    predicates.add(cb.isNull(root.get("bookId")));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Sort sort = Sort.by(Sort.Direction.ASC, "releaseDate").and(Sort.by(Sort.Direction.ASC, "title"));
        List<ReleaseScheduleJpaEntity> entities = releaseScheduleJpaRepository.findAll(spec, sort);

        return entities.stream()
                .map(releaseScheduleMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReleaseScheduleDto getScheduleById(UUID id) {
        ReleaseScheduleJpaEntity entity = releaseScheduleJpaRepository.findByIdWithBook(id)
                .orElseThrow(() -> new ResourceNotFoundException("ReleaseSchedule", "id", id));
        return releaseScheduleMapper.toDto(entity);
    }

    @Transactional(readOnly = true)
    public List<String> getPublishers() {
        return releaseScheduleJpaRepository.findDistinctPublishers();
    }

    @Transactional
    public ReleaseScheduleDto createSchedule(CreateReleaseScheduleRequest request) {
        if (request.getBookId() != null) {
            bookJpaRepository.findById(request.getBookId())
                    .orElseThrow(() -> new ResourceNotFoundException("Book", "id", request.getBookId()));
        }

        ReleaseScheduleJpaEntity entity = ReleaseScheduleJpaEntity.builder()
                .title(request.getTitle().trim())
                .originalTitle(request.getOriginalTitle() != null ? request.getOriginalTitle().trim() : null)
                .publisher(request.getPublisher().trim())
                .author(request.getAuthor() != null ? request.getAuthor().trim() : null)
                .releaseDate(request.getReleaseDate())
                .estimatedPrice(request.getEstimatedPrice())
                .editionType(request.getEditionType() != null ? request.getEditionType() : ReleaseEditionType.STANDARD)
                .gifts(request.getGifts())
                .coverUrl(request.getCoverUrl())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : ReleaseScheduleStatus.SCHEDULED)
                .bookId(request.getBookId())
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        ReleaseScheduleJpaEntity saved = releaseScheduleJpaRepository.save(entity);
        return getScheduleById(saved.getId());
    }

    @Transactional
    public ReleaseScheduleDto updateSchedule(UUID id, UpdateReleaseScheduleRequest request) {
        ReleaseScheduleJpaEntity entity = releaseScheduleJpaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ReleaseSchedule", "id", id));

        if (request.getTitle() != null) entity.setTitle(request.getTitle().trim());
        if (request.getOriginalTitle() != null) entity.setOriginalTitle(request.getOriginalTitle().trim());
        if (request.getPublisher() != null) entity.setPublisher(request.getPublisher().trim());
        if (request.getAuthor() != null) entity.setAuthor(request.getAuthor().trim());
        if (request.getReleaseDate() != null) entity.setReleaseDate(request.getReleaseDate());
        if (request.getEstimatedPrice() != null) entity.setEstimatedPrice(request.getEstimatedPrice());
        if (request.getEditionType() != null) entity.setEditionType(request.getEditionType());
        if (request.getGifts() != null) entity.setGifts(request.getGifts());
        if (request.getCoverUrl() != null) entity.setCoverUrl(request.getCoverUrl());
        if (request.getDescription() != null) entity.setDescription(request.getDescription());
        if (request.getStatus() != null) entity.setStatus(request.getStatus());

        if (request.getBookId() != null) {
            bookJpaRepository.findById(request.getBookId())
                    .orElseThrow(() -> new ResourceNotFoundException("Book", "id", request.getBookId()));
            entity.setBookId(request.getBookId());
        }

        entity.setUpdatedAt(OffsetDateTime.now());
        ReleaseScheduleJpaEntity saved = releaseScheduleJpaRepository.save(entity);
        return getScheduleById(saved.getId());
    }

    @Transactional
    public void deleteSchedule(UUID id) {
        if (!releaseScheduleJpaRepository.existsById(id)) {
            throw new ResourceNotFoundException("ReleaseSchedule", "id", id);
        }
        releaseScheduleJpaRepository.deleteById(id);
    }
}
