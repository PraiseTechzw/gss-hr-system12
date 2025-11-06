# GSS HR & Payroll Management System

## System Overview

This is a comprehensive HR and Payroll Management System designed for HR departments with a clear role hierarchy:

### User Roles

1. **Admin** - Full system access, user management, system settings
2. **Manager** - HR management, employee oversight, reports
3. **User** - HR staff, basic operations, limited access

## Database Schema

### Core Tables

1. **user_profiles** - System users (HR staff)
2. **departments** - Company departments
3. **employees** - Employee records
4. **attendance** - Employee attendance tracking
5. **leave_requests** - Employee leave requests
6. **payroll** - Employee payroll records
7. **deployments** - Employee deployment tracking
8. **system_settings** - System configuration
9. **system_activity** - Activity logging
10. **notifications** - User notifications

## Installation Steps

### 1. Drop Existing Tables
\`\`\`sql
-- Run this first to clean the database
\i scripts/000_drop_all_tables.sql
\`\`\`

### 2. Create New Schema
\`\`\`sql
-- Create the complete HR system schema
\i scripts/001_create_complete_hr_system.sql
\`\`\`

### 3. Create First Admin User
\`\`\`sql
-- Replace YOUR_USER_ID_HERE with your actual user ID from Supabase Auth
-- Replace your-email@example.com with your actual email
\i scripts/002_create_first_admin.sql
\`\`\`

### 4. Seed Sample Data (Optional)
\`\`\`sql
-- Create sample data for testing
\i scripts/003_seed_sample_data.sql
\`\`\`

## Key Features

### Role-Based Access Control
- **Admin**: Full system access, user management, system settings
- **Manager**: HR management, employee oversight, reports
- **User**: Basic HR operations, limited access

### Core Functionality
- **User Management**: Create and manage HR staff accounts
- **Employee Management**: Full employee lifecycle management
- **Attendance Tracking**: Time and attendance management
- **Leave Management**: Leave request and approval system
- **Payroll Management**: Comprehensive payroll processing
- **Deployment Tracking**: Employee deployment and location tracking
- **Reporting**: Comprehensive reporting system
- **Notifications**: Real-time notifications system

### Security Features
- Row Level Security (RLS) policies
- Role-based access control
- Activity logging
- Secure authentication

## System Architecture

### Database Design
- **Normalized schema** with proper foreign key relationships
- **Indexed tables** for optimal performance
- **RLS policies** for data security
- **Triggers** for automatic timestamp updates
- **Helper functions** for role checking

### Access Control
- **Admin**: Can manage all users, system settings, and data
- **Manager**: Can manage employees, attendance, leave requests, deployments
- **User**: Can view data and perform basic operations

### Data Flow
1. **Admin** creates HR staff accounts
2. **Managers** manage employees and operations
3. **Users** perform daily HR tasks
4. **System** logs all activities and sends notifications

## Getting Started

### For Administrators
1. Run the installation scripts in order
2. Create your admin account
3. Set up departments
4. Create manager accounts
5. Configure system settings

### For Managers
1. Log in with your manager account
2. Set up employee records
3. Configure attendance policies
4. Set up leave policies
5. Create user accounts for HR staff

### For Users
1. Log in with your user account
2. View employee information
3. Process attendance records
4. Handle leave requests
5. Generate reports

## System Settings

The system includes configurable settings for:
- Company information
- Payroll settings
- Leave policies
- Attendance policies
- Notification preferences
- System preferences

## Support

For technical support or questions about the system, please contact the system administrator.

## Version History

- **v1.0** - Initial release with complete HR system
- **v1.1** - Added role-based access control
- **v1.2** - Enhanced security and RLS policies
- **v1.3** - Added comprehensive reporting
- **v1.4** - Added notification system
- **v1.5** - Added deployment tracking
- **v1.6** - Enhanced user management
- **v1.7** - Added system activity logging
- **v1.8** - Added comprehensive sample data
- **v1.9** - Enhanced security and performance
- **v2.0** - Complete system redesign with HR focus
