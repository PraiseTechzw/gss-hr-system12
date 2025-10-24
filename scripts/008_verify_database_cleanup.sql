-- Database Cleanup Verification Script
-- This script shows what objects currently exist in the database
-- Run this BEFORE running the cleanup script to see what will be removed

-- ===========================================
-- CURRENT DATABASE STATE VERIFICATION
-- ===========================================

SELECT '=== DATABASE CLEANUP VERIFICATION ===' as info;

-- Show all tables
SELECT 
    'Tables' as object_type,
    COUNT(*) as count,
    STRING_AGG(tablename, ', ') as names
FROM pg_tables 
WHERE schemaname = 'public';

-- Show all functions
SELECT 
    'Functions' as object_type,
    COUNT(*) as count,
    STRING_AGG(proname, ', ') as names
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname NOT LIKE 'pg_%'
AND proname NOT LIKE 'sql_%';

-- Show all triggers
SELECT 
    'Triggers' as object_type,
    COUNT(*) as count,
    STRING_AGG(trigger_name, ', ') as names
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Show all policies
SELECT 
    'Policies' as object_type,
    COUNT(*) as count,
    STRING_AGG(policyname, ', ') as names
FROM pg_policies 
WHERE schemaname = 'public';

-- Show all custom types
SELECT 
    'Custom Types' as object_type,
    COUNT(*) as count,
    STRING_AGG(typname, ', ') as names
FROM pg_type 
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND typtype = 'e';

-- Show all sequences
SELECT 
    'Sequences' as object_type,
    COUNT(*) as count,
    STRING_AGG(sequencename, ', ') as names
FROM pg_sequences 
WHERE schemaname = 'public';

-- Show all views
SELECT 
    'Views' as object_type,
    COUNT(*) as count,
    STRING_AGG(viewname, ', ') as names
FROM pg_views 
WHERE schemaname = 'public';

-- Show all indexes
SELECT 
    'Indexes' as object_type,
    COUNT(*) as count,
    STRING_AGG(indexname, ', ') as names
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname NOT LIKE 'pg_%';

-- Show all extensions
SELECT 
    'Extensions' as object_type,
    COUNT(*) as count,
    STRING_AGG(extname, ', ') as names
FROM pg_extension;

-- ===========================================
-- DETAILED OBJECT INFORMATION
-- ===========================================

-- Detailed table information
SELECT 
    'TABLE DETAILS' as section,
    tablename as name,
    'Table' as type,
    'N/A' as description
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Detailed function information
SELECT 
    'FUNCTION DETAILS' as section,
    proname as name,
    'Function' as type,
    pg_get_function_identity_arguments(oid) as description
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname NOT LIKE 'pg_%'
AND proname NOT LIKE 'sql_%'
ORDER BY proname;

-- Detailed trigger information
SELECT 
    'TRIGGER DETAILS' as section,
    trigger_name as name,
    'Trigger' as type,
    event_object_table || ' (' || action_timing || ' ' || event_manipulation || ')' as description
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY trigger_name;

-- Detailed policy information
SELECT 
    'POLICY DETAILS' as section,
    policyname as name,
    'Policy' as type,
    tablename || ' (' || permissive || ' ' || roles || ')' as description
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY policyname;

-- ===========================================
-- SUMMARY
-- ===========================================

SELECT '=== CLEANUP SUMMARY ===' as info;

SELECT 
    'Total objects to be removed:' as summary,
    (
        (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') +
        (SELECT COUNT(*) FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND proname NOT LIKE 'pg_%' AND proname NOT LIKE 'sql_%') +
        (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public') +
        (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') +
        (SELECT COUNT(*) FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e') +
        (SELECT COUNT(*) FROM pg_sequences WHERE schemaname = 'public') +
        (SELECT COUNT(*) FROM pg_views WHERE schemaname = 'public') +
        (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname NOT LIKE 'pg_%')
    ) as total_count;

-- ===========================================
-- WARNING MESSAGE
-- ===========================================

SELECT 
    'WARNING: This will permanently delete all the above objects and data!' as warning,
    'Make sure you have backups if needed.' as backup_note,
    'Run scripts/000_drop_all_tables.sql to proceed with cleanup.' as next_step;



