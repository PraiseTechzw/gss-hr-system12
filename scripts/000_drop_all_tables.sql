-- Complete Database Cleanup Script
-- This script removes EVERYTHING from the database for a fresh start
-- WARNING: This will delete ALL data, tables, functions, triggers, policies, etc.

-- ===========================================
-- STEP 1: Drop all RLS policies first
-- ===========================================

-- Drop all policies on all tables
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Get all policies and drop them
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I CASCADE', 
                      r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- ===========================================
-- STEP 2: Drop all triggers
-- ===========================================

-- Drop all triggers
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT trigger_name, event_object_table, event_object_schema
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public'
    ) LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I.%I CASCADE', 
                      r.trigger_name, r.event_object_schema, r.event_object_table);
    END LOOP;
END $$;

-- ===========================================
-- STEP 3: Drop all functions and procedures
-- ===========================================

-- Drop all custom functions
DROP FUNCTION IF EXISTS ensure_user_profile_exists(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS get_user_role(uuid) CASCADE;
DROP FUNCTION IF EXISTS check_user_permission(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS log_system_activity(uuid, text, text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop any other custom functions that might exist
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT routine_name, routine_type
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name NOT LIKE 'pg_%'
        AND routine_name NOT LIKE 'sql_%'
    ) LOOP
        EXECUTE format('DROP %s IF EXISTS %I CASCADE', 
                      CASE WHEN r.routine_type = 'FUNCTION' THEN 'FUNCTION' ELSE 'PROCEDURE' END,
                      r.routine_name);
    END LOOP;
END $$;

-- ===========================================
-- STEP 4: Drop all tables and their dependencies
-- ===========================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS system_activity CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS payroll CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS deployments CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop any remaining tables
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', r.tablename);
    END LOOP;
END $$;

-- ===========================================
-- STEP 5: Drop all views
-- ===========================================

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP VIEW IF EXISTS %I CASCADE', r.viewname);
    END LOOP;
END $$;

-- ===========================================
-- STEP 6: Drop all sequences
-- ===========================================

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT sequencename 
        FROM pg_sequences 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP SEQUENCE IF EXISTS %I CASCADE', r.sequencename);
    END LOOP;
END $$;

-- ===========================================
-- STEP 7: Drop all custom types
-- ===========================================

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS employee_status CASCADE;
DROP TYPE IF EXISTS attendance_status CASCADE;
DROP TYPE IF EXISTS leave_status CASCADE;
DROP TYPE IF EXISTS deployment_status CASCADE;

-- Drop any other custom types
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT typname 
        FROM pg_type 
        WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND typtype = 'e'  -- enum types
    ) LOOP
        EXECUTE format('DROP TYPE IF EXISTS %I CASCADE', r.typname);
    END LOOP;
END $$;

-- ===========================================
-- STEP 8: Drop all indexes (except system ones)
-- ===========================================

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public'
        AND indexname NOT LIKE 'pg_%'
    ) LOOP
        EXECUTE format('DROP INDEX IF EXISTS %I CASCADE', r.indexname);
    END LOOP;
END $$;

-- ===========================================
-- STEP 9: Drop all extensions (optional)
-- ===========================================

-- Uncomment the line below if you want to remove the uuid-ossp extension
-- DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

-- ===========================================
-- STEP 10: Clean up any remaining objects
-- ===========================================

-- Drop any remaining functions, procedures, or other objects
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Drop any remaining functions
    FOR r IN (
        SELECT proname, oid
        FROM pg_proc 
        WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND proname NOT LIKE 'pg_%'
        AND proname NOT LIKE 'sql_%'
    ) LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS %I CASCADE', r.oid);
    END LOOP;
END $$;

-- ===========================================
-- STEP 11: Reset sequences and clean up
-- ===========================================

-- Reset any remaining sequences
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT sequencename 
        FROM pg_sequences 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP SEQUENCE IF EXISTS %I CASCADE', r.sequencename);
    END LOOP;
END $$;

-- ===========================================
-- VERIFICATION: Show what's left (should be empty)
-- ===========================================

-- Display remaining objects (should be empty after cleanup)
SELECT 
    'Tables' as object_type,
    COUNT(*) as count
FROM pg_tables 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'Functions' as object_type,
    COUNT(*) as count
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname NOT LIKE 'pg_%'

UNION ALL

SELECT 
    'Types' as object_type,
    COUNT(*) as count
FROM pg_type 
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND typtype = 'e'

UNION ALL

SELECT 
    'Sequences' as object_type,
    COUNT(*) as count
FROM pg_sequences 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'Views' as object_type,
    COUNT(*) as count
FROM pg_views 
WHERE schemaname = 'public';

-- ===========================================
-- COMPLETION MESSAGE
-- ===========================================

SELECT 'Database cleanup completed successfully!' as status,
       'All tables, functions, triggers, policies, and data have been removed.' as message,
       'You can now run the setup scripts to create a fresh database.' as next_step;
