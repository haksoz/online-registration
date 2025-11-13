-- Step 5: Add risk_score column to registration_logs
ALTER TABLE registration_logs 
ADD COLUMN risk_score TINYINT DEFAULT 0 COMMENT 'Risk score (0-100)';

-- Add index for better performance
ALTER TABLE registration_logs 
ADD INDEX idx_risk_score (risk_score);

SELECT 'risk_score column added!' as status;
SELECT COUNT(*) as registration_logs_count FROM registration_logs;
