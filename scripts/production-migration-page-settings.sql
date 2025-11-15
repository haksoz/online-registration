-- Production Migration: Update page_settings table
-- Add new fields and remove old ones

-- Add new fields
INSERT INTO page_settings (setting_key, setting_value, description) VALUES
('show_header', 'true', 'Sayfa başlığını header''da göster'),
('show_subtitle', 'true', 'Sayfa alt başlığını header''da göster'),
('header_title_font_size_mobile', '28', 'Başlık font boyutu (mobil - px)'),
('header_subtitle_font_size_mobile', '16', 'Alt başlık font boyutu (mobil - px)'),
('header_title_color', '#ffffff', 'Başlık rengi'),
('header_subtitle_color', '#ffffff', 'Alt başlık rengi')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Remove old fields (optional - can keep for backward compatibility)
-- DELETE FROM page_settings WHERE setting_key IN ('organization_name', 'organization_name_en', 'homepage_url', 'currency_type');

-- Verify
SELECT setting_key, setting_value, description 
FROM page_settings 
WHERE setting_key IN ('show_header', 'show_subtitle', 'header_title_font_size_mobile', 'header_subtitle_font_size_mobile', 'header_title_color', 'header_subtitle_color')
ORDER BY setting_key;

SELECT 'Migration completed successfully!' as status;
