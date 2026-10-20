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
    private final ReleaseScheduleSyncService syncService;
    private final ReleaseScheduleBatchService batchService;
    private final ReleaseStoreLinkService storeLinkService;

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

    @Transactional(readOnly = true)
    public ReleaseScheduleDto getScheduleBySlug(String slug) {
        if (slug == null || slug.isBlank()) {
            throw new ResourceNotFoundException("ReleaseSchedule", "slug", slug);
        }
        String trimmed = slug.trim();
        ReleaseScheduleJpaEntity entity = releaseScheduleJpaRepository.findBySlugWithEditions(trimmed)
                .orElseGet(() -> {
                    try {
                        return releaseScheduleJpaRepository.findByIdWithEditions(UUID.fromString(trimmed)).orElse(null);
                    } catch (Exception e) {
                        return null;
                    }
                });
        if (entity == null) {
            throw new ResourceNotFoundException("ReleaseSchedule", "slug", trimmed);
        }
        return releaseScheduleMapper.toDto(entity);
    }

    @Transactional(readOnly = true)
    public ReleaseScheduleDto getScheduleByIdOrSlug(String idOrSlug) {
        if (idOrSlug == null || idOrSlug.isBlank()) {
            throw new ResourceNotFoundException("ReleaseSchedule", "idOrSlug", idOrSlug);
        }
        try {
            return getScheduleById(UUID.fromString(idOrSlug.trim()));
        } catch (IllegalArgumentException e) {
            return getScheduleBySlug(idOrSlug.trim());
        }
    }

    @Transactional(readOnly = true)
    public List<ReleaseScheduleDto> getSeriesVolumes(String seriesSlug) {
        return releaseScheduleJpaRepository.findBySeriesSlugOrderByVolumeNumberAsc(seriesSlug).stream()
                .map(releaseScheduleMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<java.util.Map<String, Object>> getSeriesSummaries() {
        return releaseScheduleJpaRepository.findDistinctSeriesSummaries().stream().map(row -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("seriesName", row[0]);
            map.put("seriesSlug", row[1]);
            map.put("publisher", row[2]);
            map.put("author", row[3]);
            map.put("volumeCount", row[4]);
            map.put("totalVolumes", row[4]);
            map.put("coverUrl", row[5]);
            map.put("sampleCover", row[5]);
            map.put("format", row.length > 6 && row[6] != null ? row[6] : "MANGA");
            map.put("genres", row.length > 7 && row[7] != null ? row[7] : "");
            map.put("seriesStatus", row.length > 8 && row[8] != null ? row[8] : "ONGOING");
            return map;
        }).collect(Collectors.toList());
    }

    @Transactional
    public ReleaseScheduleDto createSchedule(CreateReleaseScheduleRequest req) {
        ReleaseScheduleJpaEntity schedule = ReleaseScheduleJpaEntity.builder()
                .title(req.getTitle().trim())
                .originalTitle(req.getOriginalTitle() != null ? req.getOriginalTitle().trim() : null)
                .publisher(req.getPublisher().trim())
                .author(req.getAuthor() != null ? req.getAuthor().trim() : null)
                .artist(req.getArtist() != null ? req.getArtist().trim() : null)
                .imprint(req.getImprint() != null ? req.getImprint().trim() : null)
                .genres(req.getGenres() != null ? req.getGenres().trim() : null)
                .format(req.getFormat() != null ? req.getFormat().trim() : "MANGA")
                .seriesStatus(req.getSeriesStatus() != null ? req.getSeriesStatus().trim() : "ONGOING")
                .ageRating(req.getAgeRating() != null ? req.getAgeRating().trim() : "13+")
                .specs(req.getSpecs() != null ? req.getSpecs().trim() : null)
                .releaseDate(req.getReleaseDate()).preOrderDate(req.getPreOrderDate())
                .coverUrl(req.getCoverUrl() != null && !req.getCoverUrl().isBlank() ? req.getCoverUrl().trim() : null)
                .description(req.getDescription())
                .status(req.getStatus() != null ? req.getStatus() : ReleaseScheduleStatus.SCHEDULED)
                .createdAt(OffsetDateTime.now()).updatedAt(OffsetDateTime.now()).build();

        List<ReleaseScheduleEditionJpaEntity> editions = new ArrayList<>();
        if (req.getEditions() != null && !req.getEditions().isEmpty()) {
            for (int i = 0; i < req.getEditions().size(); i++) {
                editions.add(releaseScheduleMapper.toEditionEntity(req.getEditions().get(i), schedule, i));
            }
        } else {
            editions.add(ReleaseScheduleEditionJpaEntity.builder()
                    .schedule(schedule).editionName("Bản Phổ Thông")
                    .editionType(ReleaseEditionType.STANDARD).coverUrl(schedule.getCoverUrl()).sortOrder(0).build());
        }
        schedule.setEditions(editions);
        storeLinkService.mapAndSetStoreLinks(schedule, req.getStoreLinks());
        syncService.normalizeScheduleFields(schedule);

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
        if (request.getArtist() != null) entity.setArtist(request.getArtist().trim());
        if (request.getImprint() != null) entity.setImprint(request.getImprint().trim());
        if (request.getGenres() != null) entity.setGenres(request.getGenres().trim());
        if (request.getFormat() != null) entity.setFormat(request.getFormat().trim());
        if (request.getSeriesStatus() != null) entity.setSeriesStatus(request.getSeriesStatus().trim());
        if (request.getAgeRating() != null) entity.setAgeRating(request.getAgeRating().trim());
        if (request.getSpecs() != null) entity.setSpecs(request.getSpecs().trim());
        if (request.getReleaseDate() != null) entity.setReleaseDate(request.getReleaseDate());
        if (request.getPreOrderDate() != null) entity.setPreOrderDate(request.getPreOrderDate());
        if (request.getCoverUrl() != null) entity.setCoverUrl(request.getCoverUrl().trim());
        if (request.getDescription() != null) entity.setDescription(request.getDescription());
        if (request.getStatus() != null) entity.setStatus(request.getStatus());
        syncService.normalizeScheduleFields(entity);

        if (request.getEditions() != null) {
            entity.getEditions().clear();
            for (int i = 0; i < request.getEditions().size(); i++) {
                entity.getEditions().add(releaseScheduleMapper.toEditionEntity(request.getEditions().get(i), entity, i));
            }
        }
        if (request.getStoreLinks() != null) {
            storeLinkService.mapAndSetStoreLinks(entity, request.getStoreLinks());
        }

        entity.setUpdatedAt(OffsetDateTime.now());
        ReleaseScheduleJpaEntity saved = releaseScheduleJpaRepository.save(entity);
        return getScheduleById(saved.getId());
    }

    @Transactional
    public List<ReleaseScheduleDto> batchCreateSchedules(BatchCreateScheduleRequest request) {
        return batchService.batchCreateSchedules(request);
    }


    @Transactional
    public void deleteSchedule(UUID id) {
        if (!releaseScheduleJpaRepository.existsById(id)) throw new ResourceNotFoundException("ReleaseSchedule", "id", id);
        releaseScheduleJpaRepository.deleteById(id);
    }
}
