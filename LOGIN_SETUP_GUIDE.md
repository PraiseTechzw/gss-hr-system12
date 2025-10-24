# Login Setup Guide

## 🚀 Quick Start - Get Login Working

### Step 1: Set Up Environment Variables
Create a `.env.local` file in your project root with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT Secret (generate a secure random string)
NEXTAUTH_SECRET=your_secure_jwt_secret_here

# Application URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Step 2: Set Up Supabase Database
1. **Go to your Supabase project dashboard**
2. **Open the SQL Editor**
3. **Run the complete database setup script:**

```sql
-- Copy and paste the entire content of scripts/010_complete_hr_database.sql
-- This will create all tables, functions, triggers, policies, and default users
```

### Step 3: Default Login Credentials
After running the database script, you can log in with these credentials:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | admin@gss.com | admin123 | Full system access |
| **Manager** | manager@gss.com | manager123 | Management access |
| **HR Staff** | hr@gss.com | hr123 | Basic HR operations |

### Step 4: Start the Application
```bash
# The development server should already be running
# If not, run:
npm run dev
```

### Step 5: Test Login
1. **Open your browser** and go to `http://localhost:3000`
2. **You'll be redirected** to the login page
3. **Use any of the default credentials** above to log in
4. **You'll be redirected** to the dashboard after successful login

## 🔧 Troubleshooting

### If Login Fails:
1. **Check environment variables** are set correctly
2. **Verify database setup** was completed successfully
3. **Check browser console** for any error messages
4. **Ensure Supabase project** is active and accessible

### If Database Setup Fails:
1. **Check Supabase connection** in your project dashboard
2. **Verify you have the correct** service role key
3. **Make sure your Supabase project** is not paused
4. **Check the SQL editor** for any error messages

### If You Get Redirected to Login:
1. **Check if the database** has the user_profiles table
2. **Verify the default users** were created
3. **Check the middleware** is working correctly

## 📋 What Happens After Login

### Admin User (admin@gss.com):
- ✅ Full system access
- ✅ User management
- ✅ System settings
- ✅ All reports and analytics

### Manager User (manager@gss.com):
- ✅ Employee management
- ✅ Attendance tracking
- ✅ Leave management
- ✅ Payroll processing
- ❌ No user management

### HR Staff User (hr@gss.com):
- ✅ Employee records
- ✅ Attendance entry
- ✅ Leave processing
- ✅ Basic reports
- ❌ No payroll access

## 🎯 Next Steps

1. **Change default passwords** immediately after first login
2. **Create additional users** through the admin panel
3. **Set up departments** and assign users
4. **Configure system settings** for your organization
5. **Add employee data** to start using the system

## 🔐 Security Notes

- **Change all default passwords** after first login
- **Use strong passwords** for production
- **Regularly update** your Supabase credentials
- **Monitor user activity** through the system logs

---

**Ready to test?** Go to `http://localhost:3000` and try logging in with `admin@gss.com` / `admin123`!



