-- Backend Connection Verification Script
-- This script verifies that all backend connections are working properly

-- Check if all required tables exist
SELECT 
  'Tables Check' as test_name,
  CASE 
    WHEN COUNT(*) = 12 THEN 'PASS'
    ELSE 'FAIL'
  END as status,
  COUNT(*) as found_tables,
  12 as expected_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'users', 'departments', 'employees', 'payroll_periods', 
    'payroll_records', 'allowances', 'deductions', 'leave_requests', 
    'leave_balances', 'audit_logs', 'system_settings', 'notifications'
  );

-- Check if all required functions exist
SELECT 
  'Functions Check' as test_name,
  CASE 
    WHEN COUNT(*) >= 5 THEN 'PASS'
    ELSE 'FAIL'
  END as status,
  COUNT(*) as found_functions
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION'
  AND routine_name IN (
    'audit_trigger_function', 'calculate_payroll', 
    'calculate_zimra_tax', 'update_leave_balance', 'send_notification'
  );

-- Check if all required triggers exist
SELECT 
  'Triggers Check' as test_name,
  CASE 
    WHEN COUNT(*) >= 8 THEN 'PASS'
    ELSE 'FAIL'
  END as status,
  COUNT(*) as found_triggers
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND trigger_name IN (
    'audit_users_trigger', 'audit_departments_trigger', 
    'audit_employees_trigger', 'audit_payroll_trigger',
    'audit_leave_trigger', 'update_employee_count_trigger',
    'update_department_stats_trigger', 'notification_trigger'
  );

-- Check if RLS policies are enabled
SELECT 
  'RLS Policies Check' as test_name,
  CASE 
    WHEN COUNT(*) >= 6 THEN 'PASS'
    ELSE 'FAIL'
  END as status,
  COUNT(*) as found_policies
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND row_security = 'YES'
  AND table_name IN ('users', 'departments', 'employees', 'payroll_records', 'leave_requests', 'audit_logs');

-- Check if admin user exists
SELECT 
  'Admin User Check' as test_name,
  CASE 
    WHEN COUNT(*) > 0 THEN 'PASS'
    ELSE 'FAIL'
  END as status,
  COUNT(*) as admin_users
FROM users 
WHERE role = 'admin' AND is_active = true;

-- Check if sample departments exist
SELECT 
  'Sample Data Check' as test_name,
  CASE 
    WHEN COUNT(*) > 0 THEN 'PASS'
    ELSE 'FAIL'
  END as status,
  COUNT(*) as departments
FROM departments 
WHERE is_active = true;

-- Check system settings
SELECT 
  'System Settings Check' as test_name,
  CASE 
    WHEN COUNT(*) > 0 THEN 'PASS'
    ELSE 'FAIL'
  END as status,
  COUNT(*) as settings
FROM system_settings;

-- Overall system health check
SELECT 
  'Overall System Health' as test_name,
  CASE 
    WHEN (
      (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'departments', 'employees')) = 3
      AND (SELECT COUNT(*) FROM users WHERE role = 'admin' AND is_active = true) > 0
      AND (SELECT COUNT(*) FROM departments WHERE is_active = true) > 0
    ) THEN 'HEALTHY'
    ELSE 'NEEDS ATTENTION'
  END as status;


