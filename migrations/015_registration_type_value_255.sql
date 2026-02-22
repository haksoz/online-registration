-- Teknik ID (value) uzunluğunu label ile aynı yap: 255 karakter

ALTER TABLE registration_types
MODIFY COLUMN value VARCHAR(255) NOT NULL COMMENT 'Teknik ID (slug)';
