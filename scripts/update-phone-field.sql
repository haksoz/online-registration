-- Update phone field to support international format (E.164)
-- E.164 format: +[country code][number] (max 15 digits + 1 for +)

ALTER TABLE registrations 
MODIFY COLUMN phone VARCHAR(20) COMMENT 'International phone number in E.164 format';

-- Update existing Turkish phone numbers to E.164 format if needed
-- This is a safe operation that only affects Turkish numbers without country code
UPDATE registrations 
SET phone = CONCAT('+90', REPLACE(REPLACE(REPLACE(phone, ' ', ''), '+90', ''), '0', ''))
WHERE phone NOT LIKE '+%' 
  AND phone IS NOT NULL 
  AND phone != '';
