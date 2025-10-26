-- Enhanced System Settings Table for GSS HR System
-- This script creates/updates the system_settings table to support all settings features

-- First, let's create a new system_settings table with proper columns
CREATE TABLE IF NOT EXISTS system_settings_new (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_notifications BOOLEAN DEFAULT true,
    sms_alerts BOOLEAN DEFAULT false,
    dark_mode BOOLEAN DEFAULT false,
    auto_backup BOOLEAN DEFAULT true,
    two_factor_auth BOOLEAN DEFAULT true,
    data_encryption BOOLEAN DEFAULT true,
    system_maintenance BOOLEAN DEFAULT false,
    api_access BOOLEAN DEFAULT true,
    audit_logging BOOLEAN DEFAULT true,
    password_expiry BOOLEAN DEFAULT false,
    company_name VARCHAR(255) DEFAULT 'GSS HR System',
    company_email VARCHAR(255) DEFAULT 'hr@gss.com',
    company_phone VARCHAR(50),
    company_address TEXT,
    working_hours INTEGER DEFAULT 8,
    overtime_rate DECIMAL(3,2) DEFAULT 1.5,
    leave_balance_annual INTEGER DEFAULT 21,
    payroll_frequency VARCHAR(20) DEFAULT 'monthly',
    system_version VARCHAR(20) DEFAULT '2.0',
    max_login_attempts INTEGER DEFAULT 5,
    session_timeout INTEGER DEFAULT 480,
    password_min_length INTEGER DEFAULT 6,
    require_password_change BOOLEAN DEFAULT true,
    maintenance_mode BOOLEAN DEFAULT false,
    backup_frequency VARCHAR(20) DEFAULT 'daily',
    backup_retention_days INTEGER DEFAULT 30,
    email_smtp_host VARCHAR(255),
    email_smtp_port INTEGER DEFAULT 587,
    email_smtp_username VARCHAR(255),
    email_smtp_password VARCHAR(255),
    sms_provider VARCHAR(100),
    sms_api_key VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings if no record exists
INSERT INTO system_settings_new (id) 
SELECT uuid_generate_v4()
WHERE NOT EXISTS (SELECT 1 FROM system_settings_new LIMIT 1);

-- Enable RLS on the new table
ALTER TABLE system_settings_new ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for system settings
CREATE POLICY "Admins can manage system settings" ON system_settings_new
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create policy for authenticated users to read settings
CREATE POLICY "Authenticated users can read system settings" ON system_settings_new
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_settings_updated_at ON system_settings_new(updated_at);

-- Create a function to get system settings
CREATE OR REPLACE FUNCTION get_system_settings()
RETURNS TABLE (
    id UUID,
    email_notifications BOOLEAN,
    sms_alerts BOOLEAN,
    dark_mode BOOLEAN,
    auto_backup BOOLEAN,
    two_factor_auth BOOLEAN,
    data_encryption BOOLEAN,
    system_maintenance BOOLEAN,
    api_access BOOLEAN,
    audit_logging BOOLEAN,
    password_expiry BOOLEAN,
    company_name VARCHAR,
    company_email VARCHAR,
    company_phone VARCHAR,
    company_address TEXT,
    working_hours INTEGER,
    overtime_rate DECIMAL,
    leave_balance_annual INTEGER,
    payroll_frequency VARCHAR,
    system_version VARCHAR,
    max_login_attempts INTEGER,
    session_timeout INTEGER,
    password_min_length INTEGER,
    require_password_change BOOLEAN,
    maintenance_mode BOOLEAN,
    backup_frequency VARCHAR,
    backup_retention_days INTEGER,
    email_smtp_host VARCHAR,
    email_smtp_port INTEGER,
    email_smtp_username VARCHAR,
    email_smtp_password VARCHAR,
    sms_provider VARCHAR,
    sms_api_key VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM system_settings_new LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to update system settings
CREATE OR REPLACE FUNCTION update_system_settings(
    p_email_notifications BOOLEAN DEFAULT NULL,
    p_sms_alerts BOOLEAN DEFAULT NULL,
    p_dark_mode BOOLEAN DEFAULT NULL,
    p_auto_backup BOOLEAN DEFAULT NULL,
    p_two_factor_auth BOOLEAN DEFAULT NULL,
    p_data_encryption BOOLEAN DEFAULT NULL,
    p_system_maintenance BOOLEAN DEFAULT NULL,
    p_api_access BOOLEAN DEFAULT NULL,
    p_audit_logging BOOLEAN DEFAULT NULL,
    p_password_expiry BOOLEAN DEFAULT NULL,
    p_company_name VARCHAR DEFAULT NULL,
    p_company_email VARCHAR DEFAULT NULL,
    p_company_phone VARCHAR DEFAULT NULL,
    p_company_address TEXT DEFAULT NULL,
    p_working_hours INTEGER DEFAULT NULL,
    p_overtime_rate DECIMAL DEFAULT NULL,
    p_leave_balance_annual INTEGER DEFAULT NULL,
    p_payroll_frequency VARCHAR DEFAULT NULL,
    p_system_version VARCHAR DEFAULT NULL,
    p_max_login_attempts INTEGER DEFAULT NULL,
    p_session_timeout INTEGER DEFAULT NULL,
    p_password_min_length INTEGER DEFAULT NULL,
    p_require_password_change BOOLEAN DEFAULT NULL,
    p_maintenance_mode BOOLEAN DEFAULT NULL,
    p_backup_frequency VARCHAR DEFAULT NULL,
    p_backup_retention_days INTEGER DEFAULT NULL,
    p_email_smtp_host VARCHAR DEFAULT NULL,
    p_email_smtp_port INTEGER DEFAULT NULL,
    p_email_smtp_username VARCHAR DEFAULT NULL,
    p_email_smtp_password VARCHAR DEFAULT NULL,
    p_sms_provider VARCHAR DEFAULT NULL,
    p_sms_api_key VARCHAR DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    settings_record RECORD;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;

    -- Get current settings
    SELECT * INTO settings_record FROM system_settings_new LIMIT 1;
    
    -- Update settings with provided values
    UPDATE system_settings_new SET
        email_notifications = COALESCE(p_email_notifications, email_notifications),
        sms_alerts = COALESCE(p_sms_alerts, sms_alerts),
        dark_mode = COALESCE(p_dark_mode, dark_mode),
        auto_backup = COALESCE(p_auto_backup, auto_backup),
        two_factor_auth = COALESCE(p_two_factor_auth, two_factor_auth),
        data_encryption = COALESCE(p_data_encryption, data_encryption),
        system_maintenance = COALESCE(p_system_maintenance, system_maintenance),
        api_access = COALESCE(p_api_access, api_access),
        audit_logging = COALESCE(p_audit_logging, audit_logging),
        password_expiry = COALESCE(p_password_expiry, password_expiry),
        company_name = COALESCE(p_company_name, company_name),
        company_email = COALESCE(p_company_email, company_email),
        company_phone = COALESCE(p_company_phone, company_phone),
        company_address = COALESCE(p_company_address, company_address),
        working_hours = COALESCE(p_working_hours, working_hours),
        overtime_rate = COALESCE(p_overtime_rate, overtime_rate),
        leave_balance_annual = COALESCE(p_leave_balance_annual, leave_balance_annual),
        payroll_frequency = COALESCE(p_payroll_frequency, payroll_frequency),
        system_version = COALESCE(p_system_version, system_version),
        max_login_attempts = COALESCE(p_max_login_attempts, max_login_attempts),
        session_timeout = COALESCE(p_session_timeout, session_timeout),
        password_min_length = COALESCE(p_password_min_length, password_min_length),
        require_password_change = COALESCE(p_require_password_change, require_password_change),
        maintenance_mode = COALESCE(p_maintenance_mode, maintenance_mode),
        backup_frequency = COALESCE(p_backup_frequency, backup_frequency),
        backup_retention_days = COALESCE(p_backup_retention_days, backup_retention_days),
        email_smtp_host = COALESCE(p_email_smtp_host, email_smtp_host),
        email_smtp_port = COALESCE(p_email_smtp_port, email_smtp_port),
        email_smtp_username = COALESCE(p_email_smtp_username, email_smtp_username),
        email_smtp_password = COALESCE(p_email_smtp_password, email_smtp_password),
        sms_provider = COALESCE(p_sms_provider, sms_provider),
        sms_api_key = COALESCE(p_sms_api_key, sms_api_key),
        updated_at = NOW()
    WHERE id = settings_record.id;

    -- Log the settings change
    INSERT INTO system_activity (user_id, action, description, details)
    VALUES (
        auth.uid(),
        'settings_update',
        'System settings updated',
        jsonb_build_object(
            'updated_fields', jsonb_build_object(
                'email_notifications', p_email_notifications,
                'sms_alerts', p_sms_alerts,
                'dark_mode', p_dark_mode,
                'auto_backup', p_auto_backup,
                'two_factor_auth', p_two_factor_auth,
                'data_encryption', p_data_encryption,
                'system_maintenance', p_system_maintenance,
                'api_access', p_api_access,
                'audit_logging', p_audit_logging,
                'password_expiry', p_password_expiry
            )
        )
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT ON system_settings_new TO authenticated;
GRANT ALL ON system_settings_new TO service_role;
GRANT EXECUTE ON FUNCTION get_system_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION update_system_settings TO authenticated;

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_system_settings_updated_at
    BEFORE UPDATE ON system_settings_new
    FOR EACH ROW
    EXECUTE FUNCTION update_system_settings_updated_at();

-- Insert default settings record
INSERT INTO system_settings_new (
    id,
    email_notifications,
    sms_alerts,
    dark_mode,
    auto_backup,
    two_factor_auth,
    data_encryption,
    system_maintenance,
    api_access,
    audit_logging,
    password_expiry,
    company_name,
    company_email,
    company_phone,
    company_address,
    working_hours,
    overtime_rate,
    leave_balance_annual,
    payroll_frequency,
    system_version,
    max_login_attempts,
    session_timeout,
    password_min_length,
    require_password_change,
    maintenance_mode,
    backup_frequency,
    backup_retention_days
) VALUES (
    uuid_generate_v4(),
    true,
    false,
    false,
    true,
    true,
    true,
    false,
    true,
    true,
    false,
    'GSS HR System',
    'hr@gss.com',
    '+263 4 123 456',
    '123 Business Street, Harare, Zimbabwe',
    8,
    1.5,
    21,
    'monthly',
    '2.0',
    5,
    480,
    6,
    true,
    false,
    'daily',
    30
) ON CONFLICT (id) DO NOTHING;
