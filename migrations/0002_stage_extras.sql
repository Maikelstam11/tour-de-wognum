-- Stage extras: new editable fields + image URLs
ALTER TYPE stage_type ADD VALUE IF NOT EXISTS 'rest_day';

ALTER TABLE stages ADD COLUMN IF NOT EXISTS expected_scenario TEXT;
ALTER TABLE stages ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE stages ADD COLUMN IF NOT EXISTS route_image_url TEXT;
ALTER TABLE stages ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Frankrijk';
