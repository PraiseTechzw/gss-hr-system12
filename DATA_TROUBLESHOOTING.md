# Data Loading Troubleshooting Guide

## Quick Diagnosis Steps

### 1. Check Environment Variables
First, verify your Supabase environment variables are correctly set:

```bash
# Check if these are set in your .env.local file
NEXT_PUBLIC_SUPABASE_URL_NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_URL_NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Test API Endpoints
Visit these debug endpoints in your browser:

- **Connection Test**: `http://localhost:3000/api/debug-connection`
- **Data Test**: `http://localhost:3000/api/debug-data`

These will show you exactly what's happening with your database connection and data.

### 3. Check Database Content
Run the verification script in your Supabase SQL editor:

```sql
\i scripts/009_verify_data_connection.sql
```

## Common Issues and Solutions

### Issue 1: Environment Variables Not Set
**Symptoms**: App crashes on startup, console shows "Missing Supabase environment variables"

**Solution**:
1. Create `.env.local` file in your project root
2. Add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL_NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_URL_NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```
3. Restart your development server

### Issue 2: Database Schema Not Created
**Symptoms**: API endpoints return empty data or errors

**Solution**:
1. Run the complete schema script:
```sql
\i scripts/000_complete_hr_system.sql
```
2. Create admin user:
```sql
\i scripts/001_create_admin_user.sql
```
3. Add sample data:
```sql
\i scripts/002_seed_sample_data.sql
```

### Issue 3: RLS Policies Blocking Access
**Symptoms**: Data exists in database but app shows empty results

**Solution**:
1. Check if RLS is enabled: `scripts/009_verify_data_connection.sql`
2. Verify user has proper permissions
3. Check if user exists in `user_profiles` table

### Issue 4: No Sample Data
**Symptoms**: Tables exist but are empty

**Solution**:
1. Run the sample data script:
```sql
\i scripts/002_seed_sample_data.sql
```
2. Or manually add some test data

### Issue 5: User Profile Missing
**Symptoms**: User can log in but sees no data

**Solution**:
1. Check if user exists in `user_profiles` table
2. Run the auto-profile creation script:
```sql
\i scripts/007_add_auto_profile_creation.sql
```

## Step-by-Step Debugging

### Step 1: Verify Connection
1. Visit `http://localhost:3000/api/debug-connection`
2. Check if `success: true`
3. Verify environment variables are "Set"
4. Check if user is authenticated

### Step 2: Check Database Content
1. Visit `http://localhost:3000/api/debug-data`
2. Look at the `rawQueries` section
3. Check if tables have data (count > 0)
4. Look for any error messages

### Step 3: Verify Schema
1. Run `scripts/009_verify_data_connection.sql` in Supabase
2. Check if all tables exist
3. Verify RLS policies are correct
4. Check user permissions

### Step 4: Test Data Functions
1. Visit `http://localhost:3000/api/debug-data`
2. Check `dashboardStats`, `payrollStats`, `attendanceStats`
3. Look for any errors in the function results

## Manual Data Creation

If you need to create test data manually:

### Create Departments
```sql
INSERT INTO public.departments (name, description) VALUES
('Human Resources', 'HR Department'),
('IT', 'Information Technology'),
('Finance', 'Finance Department');
```

### Create Sample Employees
```sql
INSERT INTO public.employees (
    employee_id, first_name, last_name, full_name, email, 
    position, hire_date, status, employment_status
) VALUES
('EMP001', 'John', 'Doe', 'John Doe', 'john@company.com', 
 'Developer', '2024-01-01', 'active', 'active'),
('EMP002', 'Jane', 'Smith', 'Jane Smith', 'jane@company.com', 
 'Manager', '2024-01-01', 'active', 'active');
```

### Create User Profile
```sql
INSERT INTO public.user_profiles (
    id, email, first_name, last_name, full_name, 
    role, department, position, is_active
) VALUES (
    'your-user-id-here', 'your-email@company.com', 
    'Your', 'Name', 'Your Name', 'admin', 
    'Administration', 'System Admin', true
);
```

## Browser Console Debugging

### Check for Errors
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for any red error messages
4. Check Network tab for failed requests

### Common Console Errors
- **"Missing Supabase environment variables"** → Check .env.local
- **"Failed to fetch"** → Check network connection
- **"Permission denied"** → Check RLS policies
- **"Table doesn't exist"** → Run schema creation script

## Server-Side Debugging

### Check Server Logs
1. Look at your terminal where you run `npm run dev`
2. Look for any error messages
3. Check if Supabase connection is successful

### Common Server Errors
- **Environment variables not loaded** → Restart server
- **Database connection failed** → Check Supabase URL/key
- **RLS policy violation** → Check user permissions

## Quick Fixes

### Reset Everything
1. Drop all tables: `scripts/000_complete_hr_system.sql`
2. Create fresh schema: `scripts/000_complete_hr_system.sql`
3. Create admin user: `scripts/001_create_admin_user.sql`
4. Add sample data: `scripts/002_seed_sample_data.sql`
5. Restart your development server

### Check User Authentication
1. Make sure you're logged in
2. Check if your user exists in `user_profiles` table
3. Verify your role has proper permissions

### Verify Data Flow
1. Check if API endpoints return data
2. Verify dashboard components receive data
3. Look for any JavaScript errors in console

## Still Having Issues?

If you're still not seeing data:

1. **Check the debug endpoints** - They will tell you exactly what's wrong
2. **Run the verification script** - It will show you database status
3. **Check browser console** - Look for JavaScript errors
4. **Verify your Supabase project** - Make sure it's active and accessible
5. **Check your internet connection** - Supabase requires internet access

## Getting Help

If you need further assistance:

1. Share the output from `/api/debug-connection`
2. Share the output from `/api/debug-data`
3. Share any error messages from browser console
4. Share the results from `scripts/009_verify_data_connection.sql`

This information will help identify the exact issue and provide a targeted solution.
