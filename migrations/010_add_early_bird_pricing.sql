-- Migration: Add early bird pricing support
-- Date: 2024-01-XX
-- Description: Adds early bird pricing fields to registration_types and settings

-- 1. Add early bird price fields to registration_types
ALTER TABLE registration_types
ADD COLUMN early_bird_fee_try DECIMAL(10,2) DEFAULT NULL COMMENT 'Erken kayıt ücreti (TL)',
ADD COLUMN early_bird_fee_usd DECIMAL(10,2) DEFAULT NULL COMMENT 'Erken kayıt ücreti (USD)',
ADD COLUMN early_bird_fee_eur DECIMAL(10,2) DEFAULT NULL COMMENT 'Erken kayıt ücreti (EUR)';

-- 2. Add early bird deadline to form_settings
ALTER TABLE form_settings
ADD COLUMN early_bird_deadline DATE DEFAULT NULL COMMENT 'Erken kayıt bitiş tarihi',
ADD COLUMN early_bird_enabled TINYINT(1) DEFAULT 0 COMMENT 'Erken kayıt aktif mi?';

-- 3. Add vat_rate column (skip if already exists)
-- ALTER TABLE registration_types
-- ADD COLUMN vat_rate DECIMAL(5,4) DEFAULT 0.2000 COMMENT 'KDV oranı (varsayılan %20)';

-- 4. Update existing records to have early bird prices (optional - can be set via admin panel)
-- UPDATE registration_types SET early_bird_fee_try = fee_try * 0.85 WHERE early_bird_fee_try IS NULL;
-- UPDATE registration_types SET early_bird_fee_usd = fee_usd * 0.85 WHERE early_bird_fee_usd IS NULL;
-- UPDATE registration_types SET early_bird_fee_eur = fee_eur * 0.85 WHERE early_bird_fee_eur IS NULL;

-- 5. Add index for better query performance
CREATE INDEX idx_form_settings_early_bird ON form_settings(early_bird_enabled, early_bird_deadline);
