-- Add gender, company and department fields to registrations table

ALTER TABLE registrations 
ADD COLUMN gender ENUM('male', 'female', 'other', 'prefer_not_to_say') AFTER last_name,
ADD COLUMN department VARCHAR(100) AFTER company;

-- Update existing records with default values if needed
UPDATE registrations SET gender = 'prefer_not_to_say' WHERE gender IS NULL;
