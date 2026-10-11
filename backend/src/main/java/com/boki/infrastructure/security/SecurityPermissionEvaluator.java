package com.boki.infrastructure.security;

import com.boki.application.service.DynamicRbacApplicationService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component("perm")
public class SecurityPermissionEvaluator {

    private final DynamicRbacApplicationService rbacService;

    public SecurityPermissionEvaluator(DynamicRbacApplicationService rbacService) {
        this.rbacService = rbacService;
    }

    public boolean can(String permissionCode) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        // ROLE_ADMIN bypasses all permission checks
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equalsIgnoreCase("ROLE_ADMIN"));
        if (isAdmin) {
            return true;
        }

        Object principal = auth.getPrincipal();
        if (!(principal instanceof AuthenticatedUser user)) {
            return false;
        }

        Set<String> userPerms = rbacService.getUserPermissionCodes(user.userId());
        return userPerms.contains(permissionCode.trim().toUpperCase());
    }

    public boolean canAny(String... permissionCodes) {
        for (String p : permissionCodes) {
            if (can(p)) {
                return true;
            }
        }
        return false;
    }
}
