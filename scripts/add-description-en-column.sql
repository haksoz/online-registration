-- Add description_en column to registration_types table

ALTER TABLE registration_types 
ADD COLUMN description_en TEXT DEFAULT NULL COMMENT 'English description' AFTER description;

-- Copy existing descriptions as default English descriptions
UPDATE registration_types SET description_en = description WHERE description_en IS NULL AND description IS NOT NULL;
