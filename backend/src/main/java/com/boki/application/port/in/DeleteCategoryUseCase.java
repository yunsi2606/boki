package com.boki.application.port.in;

/**
 * Use case for deleting a category.
 * Only removes category references from associated books and deletes the category record.
 * Associated books are NEVER deleted.
 */
public interface DeleteCategoryUseCase {
    void deleteCategory(int id);
}
