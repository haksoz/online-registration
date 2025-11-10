-- Create missing tables for Railway

-- Create registration_logs table
CREATE TABLE IF NOT EXISTS registration_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registration_id INT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer VARCHAR(500),
  browser_name VARCHAR(100),
  browser_version VARCHAR(50),
  os_name VARCHAR(100),
  os_version VARCHAR(50),
  device_type VARCHAR(50),
  device_vendor VARCHAR(100),
  device_model VARCHAR(100),
  screen_resolution VARCHAR(20),
  language VARCHAR(10),
  timezone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  table_name VARCHAR(100) NOT NULL,
  record_id INT,
  action ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
  old_values JSON,
  new_values JSON,
  changed_fields JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create pos_transactions table
CREATE TABLE IF NOT EXISTS pos_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registration_id INT,
  transaction_id VARCHAR(100) UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'TRY',
  status ENUM('pending', 'success', 'failed', 'cancelled') DEFAULT 'pending',
  payment_method VARCHAR(50),
  card_mask VARCHAR(20),
  bank_name VARCHAR(100),
  response_code VARCHAR(10),
  response_message TEXT,
  auth_code VARCHAR(20),
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (registration_id) REFERENCES registrations(id)
);

-- Create online_payments table
CREATE TABLE IF NOT EXISTS online_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registration_id INT NOT NULL,
  payment_provider VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(100) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'TRY',
  status ENUM('pending', 'success', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
  payment_method VARCHAR(50),
  card_mask VARCHAR(20),
  card_type VARCHAR(20),
  bank_name VARCHAR(100),
  installment_count INT DEFAULT 1,
  commission_rate DECIMAL(5,4) DEFAULT 0,
  commission_amount DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2),
  auth_code VARCHAR(20),
  reference_number VARCHAR(100),
  order_id VARCHAR(100),
  conversation_id VARCHAR(100),
  payment_id VARCHAR(100),
  fraud_status VARCHAR(20),
  response_code VARCHAR(10),
  response_message TEXT,
  error_code VARCHAR(10),
  error_message TEXT,
  raw_response JSON,
  callback_received_at TIMESTAMP NULL,
  processed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE
);

-- Create exchange_rates table
CREATE TABLE IF NOT EXISTS exchange_rates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  currency_code VARCHAR(3) NOT NULL,
  rate_to_try DECIMAL(10,4) NOT NULL,
  source VARCHAR(50) DEFAULT 'TCMB',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes will be created automatically by MySQL for foreign keys and unique constraints