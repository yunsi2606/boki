package com.boki.interfaces.rest;

import com.boki.application.dto.notification.ScheduleSubscriptionRequest;
import com.boki.application.dto.notification.SubscriptionResponse;
import com.boki.application.service.ScheduleEmailSubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/schedule-email")
@RequiredArgsConstructor
public class ScheduleEmailSubscriptionController {

    private final ScheduleEmailSubscriptionService subscriptionService;

    @PostMapping("/subscriptions")
    public ResponseEntity<List<SubscriptionResponse>> subscribe(
            @Valid @RequestBody ScheduleSubscriptionRequest request
    ) {
        return ResponseEntity.ok(subscriptionService.subscribe(request, null));
    }

    @GetMapping("/subscriptions")
    public ResponseEntity<List<SubscriptionResponse>> getSubscriptions(
            @RequestParam("email") String email
    ) {
        return ResponseEntity.ok(subscriptionService.getSubscriptionsByEmail(email));
    }

    @RequestMapping(value = "/unsubscribe", method = {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<Map<String, Object>> unsubscribe(
            @RequestParam("token") String token
    ) {
        boolean success = subscriptionService.unsubscribeByToken(token);
        return ResponseEntity.ok(Map.of(
                "success", success,
                "message", success ? "Đã hủy đăng ký nhận thông báo thành công." : "Token không hợp lệ hoặc đã hết hạn."
        ));
    }
}
