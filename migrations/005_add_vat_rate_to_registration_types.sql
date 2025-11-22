-- Migration: Add vat_rate to registration_types
-- Date: 2024-11-23

-- Add vat_rate column
ALTER TABLE registration_types 
ADD COLUMN IF NOT EXISTS vat_rate DECIMAL(5,4) DEFAULT 0.2000 COMMENT 'KDV oranı (0.20 = %20)' AFTER fee_eur;

-- Update existing records
UPDATE registration_types SET vat_rate = 0.2000 WHERE vat_rate IS NULL OR vat_rate = 0;
