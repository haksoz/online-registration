-- Add account_name_en column to bank_accounts table

ALTER TABLE bank_accounts 
ADD COLUMN account_name_en VARCHAR(100) DEFAULT NULL COMMENT 'English account name' AFTER account_name;

-- Copy existing account names as default English names
UPDATE bank_accounts SET account_name_en = account_name WHERE account_name_en IS NULL;
