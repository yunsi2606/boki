package com.boki.interfaces.rest;

import com.boki.application.dto.request.UpdateProfileDetailsRequest;
import com.boki.application.dto.request.UpdateShippingAddressRequest;
import com.boki.application.dto.response.CustomerProfileSummaryResponse;
import com.boki.application.dto.response.UserResponse;
import com.boki.application.service.CustomerProfileApplicationService;
import com.boki.infrastructure.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/profile")
public class CustomerProfileController {

    private final CustomerProfileApplicationService customerProfileService;

    public CustomerProfileController(CustomerProfileApplicationService customerProfileService) {
        this.customerProfileService = customerProfileService;
    }

    /**
     * GET /api/users/profile/summary
     * Returns full customer dashboard: user details, ranking time window/roadmap, spending KPIs, and recent orders.
     */
    @GetMapping("/summary")
    public ResponseEntity<CustomerProfileSummaryResponse> getProfileSummary(
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        CustomerProfileSummaryResponse summary = customerProfileService.getProfileSummary(principal.userId());
        return ResponseEntity.ok(summary);
    }

    /**
     * PUT /api/users/profile/address
     * Updates default shipping address in customer profile (used for auto-filling checkout).
     */
    @PutMapping("/address")
    public ResponseEntity<UserResponse> updateShippingAddress(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody UpdateShippingAddressRequest request
    ) {
        UserResponse response = customerProfileService.updateShippingAddress(principal.userId(), request);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/users/profile
     * Updates basic user profile information (display name, avatar, phone).
     */
    @PutMapping
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @RequestBody UpdateProfileDetailsRequest request
    ) {
        UserResponse response = customerProfileService.updateProfileDetails(principal.userId(), request);
        return ResponseEntity.ok(response);
    }
}
