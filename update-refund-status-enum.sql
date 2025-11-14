-- Update refund_status enum to match the application code
-- This fixes the "Data truncated for column 'refund_status'" error

ALTER TABLE registrations 
MODIFY COLUMN refund_status ENUM('none', 'pending', 'completed', 'rejected') DEFAULT 'none';
