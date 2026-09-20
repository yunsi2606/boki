-- ============================================
-- V023: Synchronize books stock_quantity with book_variants sum
-- ============================================

-- Update stock_quantity of books that have variants to be the exact sum of variants' stock_quantity
UPDATE books b
SET stock_quantity = COALESCE(sub.total_stock, 0),
    updated_at = CURRENT_TIMESTAMP
FROM (
    SELECT book_id, SUM(stock_quantity) AS total_stock
    FROM book_variants
    GROUP BY book_id
) sub
WHERE b.id = sub.book_id;

-- Update status to SOLD if stock is 0 and not pre-order
UPDATE books
SET status = 'SOLD',
    updated_at = CURRENT_TIMESTAMP
WHERE id IN (
    SELECT DISTINCT book_id FROM book_variants
)
AND stock_quantity = 0
AND is_pre_order = FALSE
AND status = 'ACTIVE';

-- Update status to ACTIVE if stock is > 0 and previously marked SOLD
UPDATE books
SET status = 'ACTIVE',
    updated_at = CURRENT_TIMESTAMP
WHERE id IN (
    SELECT DISTINCT book_id FROM book_variants
)
AND stock_quantity > 0
AND status = 'SOLD';
