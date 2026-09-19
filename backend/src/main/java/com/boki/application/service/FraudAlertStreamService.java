package com.boki.application.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Manages real-time event streaming (SSE) to connected Admin Dashboard clients.
 * Broadcasts voice alerts and visual fraud warnings instantly when suspicious orders are detected.
 */
@Service
public class FraudAlertStreamService {

    private static final Logger log = LoggerFactory.getLogger(FraudAlertStreamService.class);
    private static final int MAX_RECENT_ALERTS = 50;

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    private final List<FraudAlertEvent> recentAlerts = new CopyOnWriteArrayList<>();

    public record FraudAlertEvent(
            UUID orderId,
            String orderCode,
            String customerName,
            String customerPhone,
            boolean isGuest,
            BigDecimal totalAmount,
            int riskScore,
            String riskLevel,
            List<String> riskReasons,
            Instant timestamp,
            String voiceMessage
    ) {}

    public SseEmitter createEmitter() {
        // 30 minutes timeout
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);

        emitters.add(emitter);

        emitter.onCompletion(() -> {
            log.debug("SSE emitter completed");
            emitters.remove(emitter);
        });
        emitter.onTimeout(() -> {
            log.debug("SSE emitter timed out");
            emitter.complete();
            emitters.remove(emitter);
        });
        emitter.onError((ex) -> {
            log.debug("SSE emitter error: {}", ex.getMessage());
            emitter.complete();
            emitters.remove(emitter);
        });

        // Send initial heartbeat
        try {
            emitter.send(SseEmitter.event().name("INIT").data("Connected to Boki Fraud Alert Stream"));
        } catch (Exception e) {
            emitters.remove(emitter);
        }

        return emitter;
    }

    public void broadcastAlert(FraudAlertEvent event) {
        log.info("Broadcasting fraud alert for order #{}: score={}, guest={}",
                event.orderCode(), event.riskScore(), event.isGuest());

        // Cache in recent alerts
        recentAlerts.add(0, event);
        if (recentAlerts.size() > MAX_RECENT_ALERTS) {
            recentAlerts.remove(recentAlerts.size() - 1);
        }

        List<SseEmitter> deadEmitters = new ArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("FRAUD_ALERT")
                        .data(event));
            } catch (Exception ex) {
                deadEmitters.add(emitter);
            }
        }
        emitters.removeAll(deadEmitters);
    }

    public List<FraudAlertEvent> getRecentAlerts() {
        return Collections.unmodifiableList(recentAlerts);
    }
}
