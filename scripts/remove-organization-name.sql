-- Remove organization_name fields from page_settings
-- These fields are no longer used, form_title is used instead in email subjects

DELETE FROM page_settings 
WHERE setting_key IN ('organization_name', 'organization_name_en');

SELECT 'organization_name fields removed from page_settings' as status;
