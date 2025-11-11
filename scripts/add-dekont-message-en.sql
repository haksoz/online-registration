-- Add dekont_message_en column to payment_settings table

ALTER TABLE payment_settings 
ADD COLUMN dekont_message_en TEXT DEFAULT NULL COMMENT 'English receipt message' AFTER dekont_message;

-- Set default English message
UPDATE payment_settings 
SET dekont_message_en = 'Please send your receipt to {email}.' 
WHERE dekont_message_en IS NULL;
