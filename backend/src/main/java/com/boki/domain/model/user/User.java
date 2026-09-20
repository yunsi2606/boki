package com.boki.domain.model.user;

import java.time.Instant;

/**
 * User aggregate root.
 * <p>
 * Encapsulates all user-related business rules:
 * - Email must be valid and unique (enforced at repository level)
 * - Phone verification is required before full system access
 * - Password hash is nullable for OAuth-only users
 */
public class User {

    private UserId id;
    private Email email;
    private String passwordHash;
    private String displayName;
    private PhoneNumber phoneNumber;
    private boolean phoneVerified;
    private String avatarUrl;
    private UserRole role;
    private boolean emailVerified;
    private boolean active;
    private MemberTier memberTier = MemberTier.STANDARD;
    private java.math.BigDecimal totalSpent = java.math.BigDecimal.ZERO;
    private int loyaltyPoints = 0;
    private Instant tierUpgradedAt = Instant.now();
    private Instant tierExpiresAt = Instant.now().plus(365, java.time.temporal.ChronoUnit.DAYS);
    private java.math.BigDecimal cycleSpent = java.math.BigDecimal.ZERO;
    private String shippingFullName;
    private String shippingPhone;
    private String shippingProvince;
    private Integer shippingProvinceCode;
    private String shippingDistrict;
    private Integer shippingDistrictCode;
    private String shippingWard;
    private Integer shippingWardCode;
    private String shippingStreetAddress;
    private String shippingDeliveryNote;
    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;

    private User() {
        // For framework / mapper use
    }


    /**
     * Factory: create a new user via email/password registration.
     */
    public static User register(Email email, String passwordHash, String displayName) {
        User user = new User();
        user.id = UserId.generate();
        user.email = email;
        user.passwordHash = passwordHash;
        user.displayName = displayName;
        user.phoneVerified = false;
        user.emailVerified = false;
        user.role = UserRole.BUYER;
        user.active = true;
        user.createdAt = Instant.now();
        user.updatedAt = Instant.now();
        user.createdBy = email.value();
        return user;
    }

    /**
     * Factory: create a new user from OAuth provider.
     */
    public static User fromOAuth(Email email, String displayName, String avatarUrl) {
        User user = new User();
        user.id = UserId.generate();
        user.email = email;
        user.passwordHash = null;
        user.displayName = displayName;
        user.avatarUrl = avatarUrl;
        user.phoneVerified = false;
        user.emailVerified = true;
        user.role = UserRole.BUYER;
        user.active = true;
        user.createdAt = Instant.now();
        user.updatedAt = Instant.now();
        user.createdBy = "oauth";
        return user;
    }

    /**
     * Reconstitute from persistence. Used by infrastructure mappers only.
     */
    public static User reconstitute(
            UserId id, Email email, String passwordHash, String displayName,
            PhoneNumber phoneNumber, boolean phoneVerified, String avatarUrl,
            UserRole role, boolean emailVerified, boolean active,
            MemberTier memberTier, java.math.BigDecimal totalSpent, Integer loyaltyPoints,
            Instant tierUpgradedAt, Instant tierExpiresAt, java.math.BigDecimal cycleSpent,
            String shippingFullName, String shippingPhone,
            String shippingProvince, Integer shippingProvinceCode,
            String shippingDistrict, Integer shippingDistrictCode,
            String shippingWard, Integer shippingWardCode,
            String shippingStreetAddress, String shippingDeliveryNote,
            Instant createdAt, Instant updatedAt, String createdBy
    ) {
        User user = new User();
        user.id = id;
        user.email = email;
        user.passwordHash = passwordHash;
        user.displayName = displayName;
        user.phoneNumber = phoneNumber;
        user.phoneVerified = phoneVerified;
        user.avatarUrl = avatarUrl;
        user.role = role;
        user.emailVerified = emailVerified;
        user.active = active;
        user.memberTier = memberTier != null ? memberTier : MemberTier.STANDARD;
        user.totalSpent = totalSpent != null ? totalSpent : java.math.BigDecimal.ZERO;
        user.loyaltyPoints = loyaltyPoints != null ? loyaltyPoints : 0;
        user.tierUpgradedAt = tierUpgradedAt != null ? tierUpgradedAt : Instant.now();
        user.tierExpiresAt = tierExpiresAt != null ? tierExpiresAt : Instant.now().plus(365, java.time.temporal.ChronoUnit.DAYS);
        user.cycleSpent = cycleSpent != null ? cycleSpent : (totalSpent != null ? totalSpent : java.math.BigDecimal.ZERO);
        user.shippingFullName = shippingFullName;
        user.shippingPhone = shippingPhone;
        user.shippingProvince = shippingProvince;
        user.shippingProvinceCode = shippingProvinceCode;
        user.shippingDistrict = shippingDistrict;
        user.shippingDistrictCode = shippingDistrictCode;
        user.shippingWard = shippingWard;
        user.shippingWardCode = shippingWardCode;
        user.shippingStreetAddress = shippingStreetAddress;
        user.shippingDeliveryNote = shippingDeliveryNote;
        user.createdAt = createdAt;
        user.updatedAt = updatedAt;
        user.createdBy = createdBy;
        return user;
    }

    // ---- Business Methods ----

    public void updateShippingAddress(
            String fullName, String phone,
            String province, Integer provinceCode,
            String district, Integer districtCode,
            String ward, Integer wardCode,
            String streetAddress, String deliveryNote
    ) {
        this.shippingFullName = fullName != null ? fullName.trim() : null;
        this.shippingPhone = phone != null ? phone.trim() : null;
        this.shippingProvince = province != null ? province.trim() : null;
        this.shippingProvinceCode = provinceCode;
        this.shippingDistrict = district != null ? district.trim() : null;
        this.shippingDistrictCode = districtCode;
        this.shippingWard = ward != null ? ward.trim() : null;
        this.shippingWardCode = wardCode;
        this.shippingStreetAddress = streetAddress != null ? streetAddress.trim() : null;
        this.shippingDeliveryNote = deliveryNote != null ? deliveryNote.trim() : null;
        this.updatedAt = Instant.now();
    }

    public void updateProfileDetails(String displayName, String avatarUrl, PhoneNumber phoneNumber) {
        if (displayName != null && !displayName.isBlank()) {
            this.displayName = displayName.trim();
        }
        if (avatarUrl != null) {
            this.avatarUrl = avatarUrl.isBlank() ? null : avatarUrl.trim();
        }
        if (phoneNumber != null) {
            this.phoneNumber = phoneNumber;
        }
        this.updatedAt = Instant.now();
    }

    public void verifyPhone(PhoneNumber phone) {
        this.phoneNumber = phone;
        this.phoneVerified = true;
        this.updatedAt = Instant.now();
    }

    public void verifyEmail() {
        this.emailVerified = true;
        this.updatedAt = Instant.now();
    }

    public void deactivate() {
        this.active = false;
        this.updatedAt = Instant.now();
    }

    public void upgradeToSeller() {
        this.role = UserRole.SELLER;
        this.updatedAt = Instant.now();
    }

    public void updateProfile(String displayName, String avatarUrl) {
        if (displayName != null && !displayName.isBlank()) {
            this.displayName = displayName.trim();
        }
        if (avatarUrl != null) {
            this.avatarUrl = avatarUrl.isBlank() ? null : avatarUrl.trim();
        }
        this.updatedAt = Instant.now();
    }

    public void changePassword(String newPasswordHash) {
        if (newPasswordHash == null || newPasswordHash.isBlank()) {
            throw new IllegalArgumentException("Password hash cannot be empty");
        }
        this.passwordHash = newPasswordHash;
        this.updatedAt = Instant.now();
    }

    public boolean isPhoneVerified() {
        return phoneVerified;
    }

    public boolean canAccessBusinessFeatures() {
        return active && phoneVerified;
    }

    // ---- Getters (no setters — state changes through business methods only) ----

    public UserId getId() { return id; }
    public Email getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getDisplayName() { return displayName; }
    public PhoneNumber getPhoneNumber() { return phoneNumber; }
    public boolean getPhoneVerified() { return phoneVerified; }
    public String getAvatarUrl() { return avatarUrl; }
    public UserRole getRole() { return role; }
    public boolean isEmailVerified() { return emailVerified; }
    public boolean isActive() { return active; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public String getCreatedBy() { return createdBy; }
    public MemberTier getMemberTier() { return memberTier; }
    public java.math.BigDecimal getTotalSpent() { return totalSpent; }
    public int getLoyaltyPoints() { return loyaltyPoints; }
    public Instant getTierUpgradedAt() { return tierUpgradedAt; }
    public Instant getTierExpiresAt() { return tierExpiresAt; }
    public java.math.BigDecimal getCycleSpent() { return cycleSpent; }
    public String getShippingFullName() { return shippingFullName; }
    public String getShippingPhone() { return shippingPhone; }
    public String getShippingProvince() { return shippingProvince; }
    public Integer getShippingProvinceCode() { return shippingProvinceCode; }
    public String getShippingDistrict() { return shippingDistrict; }
    public Integer getShippingDistrictCode() { return shippingDistrictCode; }
    public String getShippingWard() { return shippingWard; }
    public Integer getShippingWardCode() { return shippingWardCode; }
    public String getShippingStreetAddress() { return shippingStreetAddress; }
    public String getShippingDeliveryNote() { return shippingDeliveryNote; }
}
