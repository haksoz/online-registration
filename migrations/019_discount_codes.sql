-- Indirim kodu: ana tablo + kurallar (kategori veya tür bazlı)
-- scope: 'category' => sadece category_id dolu, o kategorideki tüm türlere uygulanır
-- scope: 'type' => sadece registration_type_id dolu, tür bazlı ayrı ayrı indirim

CREATE TABLE IF NOT EXISTS discount_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Kullanıcının gireceği kod',
  scope ENUM('category', 'type') NOT NULL COMMENT 'Kategoriye göre mi türe göre mi',
  valid_from DATETIME NULL COMMENT 'Geçerlilik başlangıç',
  valid_until DATETIME NULL COMMENT 'Geçerlilik bitiş',
  usage_limit INT NULL COMMENT 'Maksimum kullanım sayısı, NULL = sınırsız',
  used_count INT NOT NULL DEFAULT 0,
  description VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS discount_code_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  discount_code_id INT NOT NULL,
  category_id INT NULL COMMENT 'Scope=category iken dolu',
  registration_type_id INT NULL COMMENT 'Scope=type iken dolu',
  discount_type ENUM('percent', 'fixed') NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL COMMENT 'Yüzde (0-100) veya sabit TL',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (discount_code_id) REFERENCES discount_codes(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES registration_categories(id) ON DELETE CASCADE,
  FOREIGN KEY (registration_type_id) REFERENCES registration_types(id) ON DELETE CASCADE,
  CONSTRAINT chk_scope CHECK (
    (category_id IS NOT NULL AND registration_type_id IS NULL) OR
    (category_id IS NULL AND registration_type_id IS NOT NULL)
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- registrations: kullanılan indirim kodu
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'registrations' AND COLUMN_NAME = 'discount_code_id');
SET @sql := IF(@exist = 0,
  'ALTER TABLE registrations ADD COLUMN discount_code_id INT NULL AFTER payment_status',
  'SELECT "discount_code_id already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'registrations' AND COLUMN_NAME = 'discount_code_id');
SET @fk_exists := (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'registrations' AND CONSTRAINT_NAME = 'fk_registrations_discount_code');
SET @sql2 := IF(@col_exists > 0 AND @fk_exists = 0,
  'ALTER TABLE registrations ADD CONSTRAINT fk_registrations_discount_code FOREIGN KEY (discount_code_id) REFERENCES discount_codes(id) ON DELETE SET NULL',
  'SELECT "FK skip"');
PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;
