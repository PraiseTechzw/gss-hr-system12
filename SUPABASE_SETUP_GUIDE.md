# GSS HR System - Supabase Setup Guide

## Overview

This guide will help you set up the GSS HR System with Supabase as the database backend, using a custom authentication system where administrators create user accounts.

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- Git (for cloning the repository)

## Step 1: Install Dependencies

```bash
# Install all required dependencies
npm install

# Or if using pnpm
pnpm install
```

## Step 2: Set Up Supabase Project

1. **Create a new Supabase project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and API keys

2. **Get your Supabase credentials:**
   - Project URL: `https://your-project-id.supabase.co`
   - Anon Key: Found in Settings > API
   - Service Role Key: Found in Settings > API (keep this secret!)

## Step 3: Environment Configuration

Create a `.env.local` file in your project root:

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

## Step 4: Database Setup

1. **Open your Supabase SQL Editor**

2. **Run the setup scripts in order:**

```sql
-- 1. Clean existing data (if any)
\i scripts/000_drop_all_tables.sql

-- 2. Create the complete database schema
\i scripts/001_create_complete_hr_system.sql

-- 3. Create the first admin user
\i scripts/004_create_admin_user.sql

-- 4. Create sample users (optional)
\i scripts/005_create_manager_user.sql
\i scripts/006_create_hr_user.sql

-- 5. Add sample data (optional)
\i scripts/003_seed_sample_data.sql
```

**OR run the complete setup script:**

```sql
\i scripts/007_setup_complete_system.sql
```

## Step 5: Start the Application

```bash
# Start the development server
npm run dev

# Or with pnpm
pnpm dev
```

The application will be available at `http://localhost:3000`

## Step 6: First Login

### Default Login Credentials

After running the setup scripts, you can log in with these default credentials:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Admin | admin@gss.com | admin123 | Full system access |
| Manager | manager@gss.com | manager123 | Management access |
| HR Staff | hr@gss.com | hr123 | Basic HR operations |

**⚠️ IMPORTANT: Change these passwords immediately after first login!**

## Step 7: System Configuration

### Admin Tasks

1. **Change Default Passwords:**
   - Log in as admin
   - Go to Admin Settings
   - Update all user passwords

2. **Configure System Settings:**
   - Company information
   - Payroll settings
   - Leave policies
   - Attendance policies

3. **Create Additional Users:**
   - Navigate to Admin > User Management
   - Create new users with appropriate roles
   - Assign departments and positions

### Manager Tasks

1. **Set Up Departments:**
   - Create additional departments as needed
   - Assign managers to departments

2. **Configure HR Policies:**
   - Set up leave policies
   - Configure attendance rules
   - Define payroll parameters

## System Features

### Role-Based Access Control

- **Admin**: Full system access, user management, system settings
- **Manager**: HR management, employee oversight, reports
- **HR Staff**: Basic HR operations, limited access

### Core Functionality

- **User Management**: Create and manage HR staff accounts
- **Employee Management**: Full employee lifecycle management
- **Attendance Tracking**: Time and attendance management
- **Leave Management**: Leave request and approval system
- **Payroll Management**: Comprehensive payroll processing
- **Deployment Tracking**: Employee deployment and location tracking
- **Reporting**: Comprehensive reporting system
- **Notifications**: Real-time notifications system

## Security Features

- **Custom Authentication**: No reliance on Supabase Auth
- **JWT Tokens**: Secure session management
- **Password Hashing**: bcrypt encryption
- **Row Level Security**: Database-level access control
- **Role-Based Permissions**: Granular access control
- **Activity Logging**: Complete audit trail

## Troubleshooting

### Common Issues

1. **Database Connection Errors:**
   - Verify your Supabase credentials
   - Check if the database schema was created correctly
   - Ensure RLS policies are enabled

2. **Authentication Issues:**
   - Clear browser cookies
   - Check JWT secret configuration
   - Verify user exists in database

3. **Permission Errors:**
   - Ensure user has correct role
   - Check RLS policies
   - Verify middleware configuration

### Debug Endpoints

Visit these URLs to debug issues:

- `http://localhost:3000/api/auth/me` - Check current user
- `http://localhost:3000/api/debug-connection` - Test database connection
- `http://localhost:3000/api/debug-data` - Check data availability

## Database Schema

The system includes these main tables:

- `user_profiles` - System users (HR staff)
- `departments` - Company departments
- `employees` - Employee records
- `attendance` - Employee attendance tracking
- `leave_requests` - Employee leave requests
- `payroll` - Employee payroll records
- `deployments` - Employee deployment tracking
- `system_settings` - System configuration
- `system_activity` - Activity logging
- `notifications` - User notifications

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/create-user` - Create new user (admin only)

### Data Management
- `GET /api/users` - Get all users (admin only)
- `GET /api/departments` - Get all departments
- `GET /api/employees` - Get all employees
- `GET /api/attendance` - Get attendance records
- `GET /api/leave-requests` - Get leave requests
- `GET /api/payroll` - Get payroll records

## Support

For technical support or questions about the system:

1. Check the troubleshooting section above
2. Review the database logs in Supabase
3. Check the application console for errors
4. Contact the system administrator

## Version Information

- **System Version**: 2.0
- **Database Schema**: Complete HR System
- **Authentication**: Custom JWT-based
- **Framework**: Next.js 14
- **Database**: Supabase (PostgreSQL)
- **UI**: Tailwind CSS + Radix UI

---

**Note**: This system is designed for internal HR management. Ensure proper security measures are in place before deploying to production.



