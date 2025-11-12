-- Step 4: Add organization name to page_settings
INSERT INTO page_settings (setting_key, setting_value, description) VALUES
('organization_name', '', 'Organizasyon adı (Türkçe)'),
('organization_name_en', '', 'Organization name (English)')
ON DUPLICATE KEY UPDATE description = VALUES(description);

SELECT 'page_settings updated!' as status;
SELECT setting_key, description FROM page_settings WHERE setting_key IN ('organization_name', 'organization_name_en');
