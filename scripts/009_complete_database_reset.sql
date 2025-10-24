-- Complete Database Reset Script
-- This script performs a complete database cleanup and fresh setup
-- WARNING: This will delete ALL data and recreate everything from scratch

-- ===========================================
-- STEP 1: VERIFY CURRENT STATE
-- ===========================================

SELECT 'Starting complete database reset...' as status;

-- Show current state before cleanup
SELECT 
    'BEFORE CLEANUP' as phase,
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as tables,
    (SELECT COUNT(*) FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND proname NOT LIKE 'pg_%') as functions,
    (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public') as triggers,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as policies;



-- ===========================================
-- STEP 3: VERIFY CLEANUP COMPLETED
-- ===========================================

SELECT 'Cleanup completed, verifying...' as status;

-- Verify cleanup was successful
SELECT 
    'AFTER CLEANUP' as phase,
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as tables,
    (SELECT COUNT(*) FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND proname NOT LIKE 'pg_%') as functions,
    (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public') as triggers,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as policies;

-- ===========================================
-- STEP 4: CREATE FRESH DATABASE SCHEMA
-- ===========================================

SELECT 'Creating fresh database schema...' as status;

-- Create the complete HR system schema
\i scripts/001_create_complete_hr_system.sql

-- ===========================================
-- STEP 5: CREATE ADMIN USERS
-- ===========================================

SELECT 'Creating admin users...' as status;

-- Create the first admin user
\i scripts/004_create_admin_user.sql

-- Create sample manager and HR users
\i scripts/005_create_manager_user.sql
\i scripts/006_create_hr_user.sql

-- ===========================================
-- STEP 6: ADD SAMPLE DATA
-- ===========================================

SELECT 'Adding sample data...' as status;

-- Add sample data
\i scripts/003_seed_sample_data.sql

-- ===========================================
-- STEP 7: VERIFY FINAL STATE
-- ===========================================

SELECT 'Verifying final setup...' as status;

-- Show final state
SELECT 
    'FINAL STATE' as phase,
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as tables,
    (SELECT COUNT(*) FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND proname NOT LIKE 'pg_%') as functions,
    (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public') as triggers,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as policies;

-- Show created tables
SELECT 
    'Created Tables:' as info,
    tablename as table_name
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Show created functions
SELECT 
    'Created Functions:' as info,
    proname as function_name
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname NOT LIKE 'pg_%'
ORDER BY proname;

-- Show created users
SELECT 
    'Created Users:' as info,
    email,
    role,
    status
FROM user_profiles
ORDER BY role DESC, email;

-- Show departments
SELECT 
    'Created Departments:' as info,
    name as department_name
FROM departments
ORDER BY name;

-- Show system settings
SELECT 
    'System Settings:' as info,
    setting_key,
    setting_value
FROM system_settings
ORDER BY setting_key;

-- ===========================================
-- STEP 8: LOGIN CREDENTIALS
-- ===========================================

SELECT '=== LOGIN CREDENTIALS ===' as info;

SELECT 
    'User' as type,
    email,
    CASE 
        WHEN email = 'admin@gss.com' THEN 'admin123'
        WHEN email = 'manager@gss.com' THEN 'manager123'
        WHEN email = 'hr@gss.com' THEN 'hr123'
        ELSE 'Check with administrator'
    END as default_password,
    role,
    'CHANGE PASSWORD AFTER FIRST LOGIN!' as security_note
FROM user_profiles
ORDER BY role DESC;

-- ===========================================
-- STEP 9: COMPLETION MESSAGE
-- ===========================================

SELECT 
    '=== DATABASE RESET COMPLETED SUCCESSFULLY ===' as status,
    'All old data has been removed and fresh system created.' as message,
    'You can now start using the GSS HR System.' as next_step,
    'Remember to change all default passwords!' as security_reminder;
