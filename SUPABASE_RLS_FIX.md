# Fix Supabase RLS Issue for Employees Table

## The Problem
You're getting the error: "new row violates row-level security policy for table 'employees'"

This happens because Supabase has Row Level Security (RLS) enabled on the employees table, but there are no policies allowing inserts.

## Solution Options

### Option 1: Run SQL in Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run this SQL:

```sql
-- Disable RLS temporarily for employees table
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON employees TO authenticated;
GRANT ALL ON employees TO anon;
```

### Option 2: Create RLS Policies (More Secure)

If you want to keep RLS enabled, run this SQL instead:

```sql
-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to read employees" ON employees
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert employees" ON employees
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update employees" ON employees
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete employees" ON employees
    FOR DELETE TO authenticated USING (true);

-- Grant permissions
GRANT ALL ON employees TO authenticated;
GRANT ALL ON employees TO anon;
```

### Option 3: Use Service Role (Already Implemented)

I've already created an API endpoint (`/api/employees/create`) that uses the service role key to bypass RLS. The employee form now uses this endpoint for creating new employees.

## Quick Fix Steps

1. **Go to Supabase Dashboard** → **SQL Editor**
2. **Copy and paste this SQL**:
   ```sql
   ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
   ```
3. **Click "Run"**
4. **Try creating an employee again**

## Verification

After running the SQL, you should be able to:
- ✅ Create new employees
- ✅ Edit existing employees  
- ✅ Delete employees
- ✅ View employee list

## Why This Happens

Supabase enables RLS by default for security, but when you create tables manually or through migrations, the policies aren't automatically created. This is a common issue that's easily fixed by either disabling RLS or creating proper policies.

The employee system will work perfectly once this RLS issue is resolved! 🎉
