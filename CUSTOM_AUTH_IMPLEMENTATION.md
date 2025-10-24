# Custom Authentication Implementation

## Overview

The GSS HR System now uses a custom authentication system built on top of Supabase, where administrators create and manage user accounts. This eliminates the need for Supabase Auth and provides complete control over user management.

## Key Features

### 🔐 Custom Authentication System
- **JWT-based sessions** with secure token management
- **Password hashing** using bcrypt for security
- **Role-based access control** with three levels: Admin, Manager, HR
- **Session management** with HTTP-only cookies
- **No external auth dependencies** - completely self-contained

### 👥 Admin-Controlled User Management
- **Admin-only user creation** - only administrators can create new accounts
- **Role assignment** during user creation
- **Department assignment** for organizational structure
- **User status management** (active/inactive)
- **Activity logging** for all user actions

### 🛡️ Security Features
- **Row Level Security (RLS)** policies for data protection
- **Middleware protection** for route access control
- **Permission checking** at API and component levels
- **Audit logging** for all system activities
- **Secure password requirements**

## Implementation Details

### Authentication Flow

1. **User Login:**
   - User enters email/password
   - System validates credentials against database
   - JWT token generated and stored in HTTP-only cookie
   - User redirected to dashboard

2. **Session Management:**
   - Middleware checks JWT token on each request
   - Token validation and user role verification
   - Automatic redirects for unauthorized access

3. **User Creation (Admin Only):**
   - Admin creates new user with role assignment
   - Password hashed and stored securely
   - User receives notification of account creation
   - Activity logged for audit trail

### Database Schema

The system uses a custom `user_profiles` table instead of Supabase Auth:

```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role user_role NOT NULL DEFAULT 'hr',
    department_id UUID REFERENCES departments(id),
    position VARCHAR(100),
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    last_login TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### API Endpoints

#### Authentication Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/create-user` - Create new user (admin only)

#### Data Endpoints
- `GET /api/users` - Get all users (admin only)
- `GET /api/departments` - Get departments
- `GET /api/employees` - Get employees
- `GET /api/attendance` - Get attendance records
- `GET /api/leave-requests` - Get leave requests
- `GET /api/payroll` - Get payroll records

### Components

#### Authentication Components
- `LoginForm` - User login interface
- `CreateUserForm` - Admin user creation form
- `UserManagement` - User listing and management

#### Admin Components
- `AdminUsersPage` - Complete user management interface
- `CreateUserForm` - User creation with role assignment
- `UserTable` - User listing with role indicators

## Role-Based Access Control

### Admin (Full Access)
- ✅ User management (create, edit, delete users)
- ✅ System settings configuration
- ✅ All employee management
- ✅ Payroll processing
- ✅ Department management
- ✅ System reports and analytics
- ✅ Admin dashboard access

### Manager (Management Access)
- ✅ Employee oversight
- ✅ Attendance management
- ✅ Leave request approval
- ✅ Payroll processing for assigned employees
- ✅ Department reports
- ✅ Deployment tracking
- ❌ No user management
- ❌ No system settings

### HR Staff (Operational Access)
- ✅ Employee records (view/update)
- ✅ Attendance entry
- ✅ Leave request processing
- ✅ Basic reports
- ✅ Deployment support
- ❌ No payroll access
- ❌ No management functions
- ❌ No system access

## Security Implementation

### Password Security
- **bcrypt hashing** with salt rounds
- **Minimum password length** requirements
- **Password change enforcement** on first login
- **Secure password storage** in database

### Session Security
- **JWT tokens** with expiration
- **HTTP-only cookies** for token storage
- **Secure cookie settings** in production
- **Automatic session cleanup** on logout

### Data Security
- **Row Level Security (RLS)** policies
- **Role-based data access** controls
- **Audit logging** for all actions
- **Input validation** and sanitization

## Setup Instructions

### 1. Environment Configuration
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_SECRET=your_jwt_secret
```

### 2. Database Setup
```sql
-- Run the complete setup script
\i scripts/007_setup_complete_system.sql
```

### 3. Default Login Credentials
- **Admin**: admin@gss.com / admin123
- **Manager**: manager@gss.com / manager123
- **HR Staff**: hr@gss.com / hr123

**⚠️ Change these passwords immediately after first login!**

## Benefits of Custom Authentication

### 1. Complete Control
- No dependency on external auth services
- Full control over user management
- Custom business logic implementation
- No vendor lock-in

### 2. Enhanced Security
- Custom security policies
- Granular permission control
- Audit trail for all actions
- Secure session management

### 3. Business Logic Integration
- Role-based access control
- Department-based permissions
- Custom user workflows
- Integrated notifications

### 4. Cost Efficiency
- No external auth service costs
- Reduced API calls
- Simplified architecture
- Better performance

## Migration from Supabase Auth

If migrating from Supabase Auth:

1. **Export existing users** from Supabase Auth
2. **Run migration script** to create user profiles
3. **Update authentication** to use custom system
4. **Test all functionality** with new auth system
5. **Disable Supabase Auth** in project settings

## Troubleshooting

### Common Issues

1. **Login Failures:**
   - Check user exists in `user_profiles` table
   - Verify password hash is correct
   - Check user status is 'active'

2. **Permission Errors:**
   - Verify user role in database
   - Check RLS policies
   - Ensure middleware is working

3. **Session Issues:**
   - Clear browser cookies
   - Check JWT secret configuration
   - Verify token expiration

### Debug Tools

- `GET /api/auth/me` - Check current user
- `GET /api/debug-connection` - Test database
- Browser dev tools for cookie inspection
- Supabase logs for database queries

## Future Enhancements

### Planned Features
- **Two-factor authentication** (2FA)
- **Password reset** functionality
- **Account lockout** after failed attempts
- **Session management** improvements
- **Audit report** generation

### Security Improvements
- **Rate limiting** for login attempts
- **IP-based restrictions**
- **Advanced password policies**
- **Session timeout** configuration

---

This custom authentication system provides a robust, secure, and flexible foundation for the GSS HR System while maintaining complete control over user management and security policies.



