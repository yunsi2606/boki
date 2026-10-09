package com.boki.application.service;

import com.boki.application.dto.schedule.*;
import com.boki.application.exception.ResourceNotFoundException;
import com.boki.application.mapper.ReleaseScheduleMapper;
import com.boki.domain.model.schedule.ReleaseEditionType;
import com.boki.domain.model.schedule.ReleaseScheduleStatus;
import com.boki.infrastructure.persistence.entity.ReleaseScheduleEditionJpaEntity;
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
                query.distinct(true);
                root.fetch("editions", JoinType.LEFT).fetch("book", JoinType.LEFT);
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

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Sort sort = Sort.by(Sort.Direction.ASC, "releaseDate").and(Sort.by(Sort.Direction.ASC, "title"));
        List<ReleaseScheduleJpaEntity> entities = releaseScheduleJpaRepository.findAll(spec, sort);

        List<ReleaseScheduleDto> dtos = entities.stream()
                .map(releaseScheduleMapper::toDto)
                .collect(Collectors.toList());

        if (hasBook != null) {
            dtos = dtos.stream().filter(s -> {
                boolean hasLinked = s.getEditions().stream().anyMatch(e -> e.getBookId() != null || e.getLinkedBook() != null);
                return hasBook ? hasLinked : !hasLinked;
            }).collect(Collectors.toList());
        }

        return dtos;
    }

    @Transactional(readOnly = true)
    public ReleaseScheduleDto getScheduleById(UUID id) {
        ReleaseScheduleJpaEntity entity = releaseScheduleJpaRepository.findByIdWithEditions(id)
                .orElseThrow(() -> new ResourceNotFoundException("ReleaseSchedule", "id", id));
        return releaseScheduleMapper.toDto(entity);
    }

    @Transactional(readOnly = true)
    public List<String> getPublishers() {
        return releaseScheduleJpaRepository.findDistinctPublishers();
    }

    @Transactional
    public ReleaseScheduleDto createSchedule(CreateReleaseScheduleRequest request) {
        ReleaseScheduleJpaEntity schedule = ReleaseScheduleJpaEntity.builder()
                .title(request.getTitle().trim())
                .originalTitle(request.getOriginalTitle() != null ? request.getOriginalTitle().trim() : null)
                .publisher(request.getPublisher().trim())
                .author(request.getAuthor() != null ? request.getAuthor().trim() : null)
                .releaseDate(request.getReleaseDate())
                .preOrderDate(request.getPreOrderDate())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : ReleaseScheduleStatus.SCHEDULED)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        List<ReleaseScheduleEditionJpaEntity> editions = new ArrayList<>();
        if (request.getEditions() != null && !request.getEditions().isEmpty()) {
            for (int i = 0; i < request.getEditions().size(); i++) {
                ReleaseScheduleEditionRequest edReq = request.getEditions().get(i);
                editions.add(buildEditionEntity(edReq, schedule, i));
            }
        } else {
            editions.add(ReleaseScheduleEditionJpaEntity.builder()
                    .schedule(schedule)
                    .editionName("Bản Phổ Thông")
                    .editionType(ReleaseEditionType.STANDARD)
                    .sortOrder(0)
                    .build());
        }
        schedule.setEditions(editions);

        ReleaseScheduleJpaEntity saved = releaseScheduleJpaRepository.save(schedule);
        return getScheduleById(saved.getId());
    }

    @Transactional
    public ReleaseScheduleDto updateSchedule(UUID id, UpdateReleaseScheduleRequest request) {
        ReleaseScheduleJpaEntity entity = releaseScheduleJpaRepository.findByIdWithEditions(id)
                .orElseThrow(() -> new ResourceNotFoundException("ReleaseSchedule", "id", id));

        if (request.getTitle() != null) entity.setTitle(request.getTitle().trim());
        if (request.getOriginalTitle() != null) entity.setOriginalTitle(request.getOriginalTitle().trim());
        if (request.getPublisher() != null) entity.setPublisher(request.getPublisher().trim());
        if (request.getAuthor() != null) entity.setAuthor(request.getAuthor().trim());
        if (request.getReleaseDate() != null) entity.setReleaseDate(request.getReleaseDate());
        if (request.getPreOrderDate() != null) entity.setPreOrderDate(request.getPreOrderDate());
        if (request.getDescription() != null) entity.setDescription(request.getDescription());
        if (request.getStatus() != null) entity.setStatus(request.getStatus());

        if (request.getEditions() != null) {
            entity.getEditions().clear();
            for (int i = 0; i < request.getEditions().size(); i++) {
                entity.getEditions().add(buildEditionEntity(request.getEditions().get(i), entity, i));
            }
        }

        entity.setUpdatedAt(OffsetDateTime.now());
        ReleaseScheduleJpaEntity saved = releaseScheduleJpaRepository.save(entity);
        return getScheduleById(saved.getId());
    }

    private ReleaseScheduleEditionJpaEntity buildEditionEntity(
            ReleaseScheduleEditionRequest req, ReleaseScheduleJpaEntity parent, int sortOrder) {
        if (req.getBookId() != null) {
            bookJpaRepository.findById(req.getBookId())
                    .orElseThrow(() -> new ResourceNotFoundException("Book", "id", req.getBookId()));
        }

        return ReleaseScheduleEditionJpaEntity.builder()
                .schedule(parent)
                .scheduleId(parent.getId())
                .editionName(req.getEditionName().trim())
                .editionType(req.getEditionType() != null ? req.getEditionType() : ReleaseEditionType.STANDARD)
                .releaseDate(req.getReleaseDate())
                .preOrderDate(req.getPreOrderDate())
                .estimatedPrice(req.getEstimatedPrice())
                .gifts(req.getGifts())
                .coverUrl(req.getCoverUrl())
                .status(req.getStatus() != null ? req.getStatus() : ReleaseScheduleStatus.SCHEDULED)
                .bookId(req.getBookId())
                .sortOrder(req.getSortOrder() != null ? req.getSortOrder() : sortOrder)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
    }

    @Transactional
    public void deleteSchedule(UUID id) {
        if (!releaseScheduleJpaRepository.existsById(id)) {
            throw new ResourceNotFoundException("ReleaseSchedule", "id", id);
        }
        releaseScheduleJpaRepository.deleteById(id);
    }
}
