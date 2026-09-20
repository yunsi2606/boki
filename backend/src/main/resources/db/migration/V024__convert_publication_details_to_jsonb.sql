-- ============================================
-- V024: Convert fixed publication columns to dynamic JSONB Map Object
-- ============================================

-- Step 1: Add new JSONB column for flexible publication specifications
ALTER TABLE books ADD COLUMN IF NOT EXISTS publication_details JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Step 2: Safely copy existing publication data into the new publication_details JSONB column
UPDATE books
SET publication_details = jsonb_strip_nulls(jsonb_build_object(
    'Nhà xuất bản', publisher,
    'Công ty phát hành', supplier,
    'Năm xuất bản', CASE WHEN publication_year IS NOT NULL THEN publication_year::text END,
    'Ngôn ngữ', language,
    'Hình thức bìa', format,
    'Số trang', CASE WHEN number_of_pages IS NOT NULL THEN (number_of_pages::text || ' trang') END,
    'Trọng lượng', CASE WHEN weight_grams IS NOT NULL THEN (weight_grams::text || ' g') END,
    'Kích thước', dimensions,
    'Dịch giả', translator
))
WHERE publisher IS NOT NULL
   OR supplier IS NOT NULL
   OR publication_year IS NOT NULL
   OR language IS NOT NULL
   OR format IS NOT NULL
   OR number_of_pages IS NOT NULL
   OR weight_grams IS NOT NULL
   OR dimensions IS NOT NULL
   OR translator IS NOT NULL;

-- Step 3: Safely drop the 9 old rigid columns now that data has been transferred
ALTER TABLE books
    DROP COLUMN IF EXISTS publisher,
    DROP COLUMN IF EXISTS supplier,
    DROP COLUMN IF EXISTS publication_year,
    DROP COLUMN IF EXISTS language,
    DROP COLUMN IF EXISTS format,
    DROP COLUMN IF EXISTS number_of_pages,
    DROP COLUMN IF EXISTS weight_grams,
    DROP COLUMN IF EXISTS dimensions,
    DROP COLUMN IF EXISTS translator;
