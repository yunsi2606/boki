-- V049: Add image_urls to giveaway_campaigns for real product photo gallery
ALTER TABLE giveaway_campaigns ADD COLUMN IF NOT EXISTS image_urls TEXT;
