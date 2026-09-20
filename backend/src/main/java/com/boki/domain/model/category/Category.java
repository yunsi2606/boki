package com.boki.domain.model.category;

/**
 * Category domain model (value object — reference data).
 * <p>
 * Categories are hierarchical reference data managed by admins.
 * They are immutable from the domain perspective.
 */
public class Category {

    private final int id;
    private final String name;
    private final String slug;
    private final String description;
    private final Integer parentId;

    private Category(int id, String name, String slug, String description, Integer parentId) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.parentId = parentId;
    }

    public static Category create(String name, String slug, String description, Integer parentId) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Category name cannot be blank");
        }
        return new Category(0, name.trim(), slug, description != null ? description.trim() : null, parentId);
    }

    /**
     * Reconstitute from persistence. Used by infrastructure mappers only.
     */
    public static Category reconstitute(int id, String name, String slug, String description, Integer parentId) {
        return new Category(id, name, slug, description, parentId);
    }

    // ---- Getters ----

    public int getId() { return id; }
    public String getName() { return name; }
    public String getSlug() { return slug; }
    public String getDescription() { return description; }
    public Integer getParentId() { return parentId; }
}
