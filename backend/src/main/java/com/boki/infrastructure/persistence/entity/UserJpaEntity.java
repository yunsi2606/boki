package com.boki.infrastructure.persistence.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
public class UserJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "phone_verified", nullable = false)
    private boolean phoneVerified;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @org.hibernate.annotations.JdbcType(org.hibernate.dialect.PostgreSQLEnumJdbcType.class)
    @Column(nullable = false, columnDefinition = "user_role")
    private UserRoleJpa role;

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "member_tier", length = 30)
    private String memberTier = "STANDARD";

    @Column(name = "total_spent", precision = 14, scale = 2)
    private java.math.BigDecimal totalSpent = java.math.BigDecimal.ZERO;

    @Column(name = "loyalty_points")
    private Integer loyaltyPoints = 0;

    @Column(name = "tier_upgraded_at")
    private Instant tierUpgradedAt = Instant.now();

    @Column(name = "tier_expires_at")
    private Instant tierExpiresAt = Instant.now().plus(365, java.time.temporal.ChronoUnit.DAYS);

    @Column(name = "cycle_spent", precision = 14, scale = 2)
    private java.math.BigDecimal cycleSpent = java.math.BigDecimal.ZERO;

    @Column(name = "shipping_full_name", length = 150)
    private String shippingFullName;

    @Column(name = "shipping_phone", length = 20)
    private String shippingPhone;

    @Column(name = "shipping_province", length = 100)
    private String shippingProvince;

    @Column(name = "shipping_province_code")
    private Integer shippingProvinceCode;

    @Column(name = "shipping_district", length = 100)
    private String shippingDistrict;

    @Column(name = "shipping_district_code")
    private Integer shippingDistrictCode;

    @Column(name = "shipping_ward", length = 100)
    private String shippingWard;

    @Column(name = "shipping_ward_code")
    private Integer shippingWardCode;

    @Column(name = "shipping_street_address", length = 255)
    private String shippingStreetAddress;

    @Column(name = "shipping_delivery_note", length = 500)
    private String shippingDeliveryNote;

    public enum UserRoleJpa {
        BUYER, SELLER, ADMIN
    }


    // --- Getters & Setters ---

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public boolean isPhoneVerified() { return phoneVerified; }
    public void setPhoneVerified(boolean phoneVerified) { this.phoneVerified = phoneVerified; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public UserRoleJpa getRole() { return role; }
    public void setRole(UserRoleJpa role) { this.role = role; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getMemberTier() { return memberTier; }
    public void setMemberTier(String memberTier) { this.memberTier = memberTier; }

    public java.math.BigDecimal getTotalSpent() { return totalSpent; }
    public void setTotalSpent(java.math.BigDecimal totalSpent) { this.totalSpent = totalSpent; }

    public Integer getLoyaltyPoints() { return loyaltyPoints; }
    public void setLoyaltyPoints(Integer loyaltyPoints) { this.loyaltyPoints = loyaltyPoints; }

    public Instant getTierUpgradedAt() { return tierUpgradedAt; }
    public void setTierUpgradedAt(Instant tierUpgradedAt) { this.tierUpgradedAt = tierUpgradedAt; }

    public Instant getTierExpiresAt() { return tierExpiresAt; }
    public void setTierExpiresAt(Instant tierExpiresAt) { this.tierExpiresAt = tierExpiresAt; }

    public java.math.BigDecimal getCycleSpent() { return cycleSpent; }
    public void setCycleSpent(java.math.BigDecimal cycleSpent) { this.cycleSpent = cycleSpent; }

    public String getShippingFullName() { return shippingFullName; }
    public void setShippingFullName(String shippingFullName) { this.shippingFullName = shippingFullName; }

    public String getShippingPhone() { return shippingPhone; }
    public void setShippingPhone(String shippingPhone) { this.shippingPhone = shippingPhone; }

    public String getShippingProvince() { return shippingProvince; }
    public void setShippingProvince(String shippingProvince) { this.shippingProvince = shippingProvince; }

    public Integer getShippingProvinceCode() { return shippingProvinceCode; }
    public void setShippingProvinceCode(Integer shippingProvinceCode) { this.shippingProvinceCode = shippingProvinceCode; }

    public String getShippingDistrict() { return shippingDistrict; }
    public void setShippingDistrict(String shippingDistrict) { this.shippingDistrict = shippingDistrict; }

    public Integer getShippingDistrictCode() { return shippingDistrictCode; }
    public void setShippingDistrictCode(Integer shippingDistrictCode) { this.shippingDistrictCode = shippingDistrictCode; }

    public String getShippingWard() { return shippingWard; }
    public void setShippingWard(String shippingWard) { this.shippingWard = shippingWard; }

    public Integer getShippingWardCode() { return shippingWardCode; }
    public void setShippingWardCode(Integer shippingWardCode) { this.shippingWardCode = shippingWardCode; }

    public String getShippingStreetAddress() { return shippingStreetAddress; }
    public void setShippingStreetAddress(String shippingStreetAddress) { this.shippingStreetAddress = shippingStreetAddress; }

    public String getShippingDeliveryNote() { return shippingDeliveryNote; }
    public void setShippingDeliveryNote(String shippingDeliveryNote) { this.shippingDeliveryNote = shippingDeliveryNote; }
}

