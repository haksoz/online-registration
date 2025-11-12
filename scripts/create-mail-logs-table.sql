-- Mail logları tablosu
CREATE TABLE IF NOT EXISTS mail_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  subject VARCHAR(500) NOT NULL,
  mail_type VARCHAR(50) NOT NULL COMMENT 'user_confirmation, admin_notification, test, custom',
  status VARCHAR(20) NOT NULL COMMENT 'sent, failed',
  error_message TEXT,
  registration_id INT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_recipient (recipient_email),
  INDEX idx_status (status),
  INDEX idx_type (mail_type),
  INDEX idx_sent_at (sent_at),
  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE SET NULL
);
