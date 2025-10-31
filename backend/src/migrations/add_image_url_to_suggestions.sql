-- Add image_url field to suggestions table for easier image access
ALTER TABLE suggestions ADD COLUMN image_url VARCHAR(500) AFTER description;

