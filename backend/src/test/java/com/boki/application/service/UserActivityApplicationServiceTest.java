package com.boki.application.service;

import com.boki.application.dto.response.UserActivityResponse;
import com.boki.infrastructure.persistence.entity.UserActivityJpaEntity;
import com.boki.infrastructure.persistence.repository.UserActivityJpaRepository;
import com.boki.infrastructure.persistence.repository.UserJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserActivityApplicationServiceTest {

    @Mock
    private UserActivityJpaRepository activityRepository;

    @Mock
    private UserJpaRepository userRepository;

    private UserActivityApplicationService service;

    @BeforeEach
    void setUp() {
        service = new UserActivityApplicationService(activityRepository, userRepository);
    }

    @Test
    @DisplayName("Should successfully search activities using Specification with all null filters")
    void testSearchActivitiesWithNullFilters() {
        UserActivityJpaEntity entity = new UserActivityJpaEntity();
        entity.setId(UUID.randomUUID());
        entity.setSessionId("sess-123");
        entity.setEventType("PAGE_VIEW");
        entity.setEventCategory("NAVIGATION");
        entity.setPagePath("/books");
        entity.setCreatedAt(Instant.now());

        Page<UserActivityJpaEntity> mockPage = new PageImpl<>(List.of(entity));
        when(activityRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(mockPage);

        Page<UserActivityResponse> result = service.searchActivities(
                null, null, null, null, null, null, null, PageRequest.of(0, 20)
        );

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("PAGE_VIEW", result.getContent().get(0).eventType());
        verify(activityRepository, times(1)).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    @DisplayName("Should successfully search activities using Specification with populated filters")
    void testSearchActivitiesWithPopulatedFilters() {
        UserActivityJpaEntity entity = new UserActivityJpaEntity();
        entity.setId(UUID.randomUUID());
        entity.setSessionId("sess-456");
        entity.setEventType("VIEW_BOOK");
        entity.setEventCategory("ENGAGEMENT");
        entity.setTargetName("Tam Ly Hoc Ve Tien");
        entity.setCreatedAt(Instant.now());

        Page<UserActivityJpaEntity> mockPage = new PageImpl<>(List.of(entity));
        when(activityRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(mockPage);

        Page<UserActivityResponse> result = service.searchActivities(
                "VIEW_BOOK",
                "ENGAGEMENT",
                "sess-456",
                UUID.randomUUID(),
                "Tam Ly",
                Instant.now().minusSeconds(3600),
                Instant.now(),
                PageRequest.of(0, 20)
        );

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("VIEW_BOOK", result.getContent().get(0).eventType());
        verify(activityRepository, times(1)).findAll(any(Specification.class), any(Pageable.class));
    }
}
