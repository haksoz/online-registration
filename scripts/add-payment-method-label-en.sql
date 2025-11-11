-- Add method_label_en column to payment_methods table

ALTER TABLE payment_methods 
ADD COLUMN method_label_en VARCHAR(100) DEFAULT NULL COMMENT 'English label' AFTER method_label;

-- Set default English labels
UPDATE payment_methods SET method_label_en = 'Online Payment' WHERE method_name = 'online';
UPDATE payment_methods SET method_label_en = 'Bank Transfer' WHERE method_name = 'bank_transfer';
