# GSS HR System - Role-Based Access Control

## 🎯 **System Roles Overview**

The GSS HR & Payroll Management System implements a three-tier role-based access control system:

### **1. ADMIN (System Administrator)**
**Full System Access & Control**

**Permissions:**
- ✅ **User Management** - Create, edit, delete all users
- ✅ **System Settings** - Configure company settings, system preferences
- ✅ **Employee Management** - Full CRUD operations on all employees
- ✅ **Payroll Management** - Process, approve, and manage all payroll
- ✅ **Department Management** - Create and manage departments
- ✅ **Reports** - Access to all reports and analytics
- ✅ **Admin Dashboard** - System overview and admin controls
- ✅ **Data Management** - Import/export data, system maintenance

**Navigation Access:**
- Dashboard
- Employees (Full Access)
- Deployments (Full Access)
- Leave & Attendance (Full Access)
- Payroll (Full Access)
- Reports (Full Access)
- Settings (Full Access)
- **Admin Only:**
  - Admin Dashboard
  - User Management
  - Create User
  - Admin Settings
  - Admin Reports

### **2. MANAGER (HR Manager)**
**Management & Oversight**

**Permissions:**
- ✅ **Employee Oversight** - Manage assigned employees
- ✅ **Attendance Management** - Approve/reject attendance records
- ✅ **Leave Management** - Approve/reject leave requests
- ✅ **Payroll Processing** - Process payroll for assigned employees
- ✅ **Reports** - Department and team reports
- ✅ **Deployment Tracking** - Manage employee deployments
- ❌ **No User Management** - Cannot create admin users
- ❌ **No System Settings** - Cannot change system configuration

**Navigation Access:**
- Dashboard
- Employees (Management Access)
- Deployments (Management Access)
- Leave & Attendance (Management Access)
- Payroll (Management Access)
- Reports (Management Access)
- Settings (Limited Access)

### **3. HR (HR Staff)**
**Operational & Administrative**

**Permissions:**
- ✅ **Employee Records** - View and update employee information
- ✅ **Attendance Entry** - Record and manage attendance
- ✅ **Leave Processing** - Process leave requests
- ✅ **Basic Reports** - Generate standard reports
- ✅ **Deployment Support** - Support deployment activities
- ❌ **No Payroll Access** - Cannot access payroll information
- ❌ **No Management Functions** - Cannot approve/manage others
- ❌ **No System Access** - Limited to assigned tasks

**Navigation Access:**
- Dashboard
- Employees (View/Update Access)
- Deployments (Support Access)
- Leave & Attendance (Processing Access)
- Reports (Basic Access)
- ❌ **No Access to:**
  - Payroll
  - Settings
  - Admin Functions

## 🔐 **Security Implementation**

### **Database Level Security**
- **Row Level Security (RLS)** - Data access controlled by user role
- **Role-based Policies** - Each table has role-specific access policies
- **Audit Logging** - All actions logged with user identification

### **Application Level Security**
- **Middleware Protection** - Routes protected by role verification
- **Component-level Access** - UI elements hidden based on role
- **API Security** - Backend endpoints validate user permissions

### **Navigation Security**
- **Dynamic Sidebar** - Only shows accessible navigation items
- **Role Indicators** - Visual indicators show user role level
- **Admin Badges** - Special indicators for admin-only functions

## 📊 **Role Hierarchy**

```
ADMIN (System Administrator)
├── Full System Access
├── User Management
├── System Configuration
└── All Reports & Analytics

MANAGER (HR Manager)
├── Employee Management
├── Payroll Processing
├── Department Reports
└── Limited System Access

HR (HR Staff)
├── Employee Records
├── Attendance Management
├── Leave Processing
└── Basic Reports
```

## 🚀 **Implementation Details**

### **Database Schema**
```sql
-- User roles are stored in user_profiles table
role text NOT NULL DEFAULT 'hr' CHECK (role IN ('admin', 'manager', 'hr'))
```

### **Frontend Implementation**
- **Sidebar Navigation** - Role-based filtering
- **Component Access** - Conditional rendering based on role
- **Route Protection** - Middleware validates access

### **Backend Implementation**
- **RLS Policies** - Database-level access control
- **API Endpoints** - Role-based data access
- **Audit Logging** - Track all user actions

## 🔧 **Configuration**

### **Environment Variables**
```env
# Supabase configuration for role-based access
NEXT_PUBLIC_SUPABASE_URL_NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_URL_NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### **Database Setup**
1. Run `scripts/000_complete_hr_system.sql` - Creates complete schema
2. Run `scripts/001_create_admin_user.sql` - Creates first admin
3. Run `scripts/002_seed_sample_data.sql` - Adds sample data

## 📋 **User Creation Process**

### **Admin Creates Users**
1. **Admin** logs in with full access
2. Navigates to **User Management**
3. Creates new users with appropriate roles:
   - **Manager** - For HR management positions
   - **HR** - For HR staff positions
4. Users receive email notifications
5. Users can log in with assigned permissions

### **Role Assignment**
- **Admin** assigns roles during user creation
- Roles cannot be changed by non-admin users
- Role changes are logged in system activity

## 🎨 **UI/UX Features**

### **Role Indicators**
- **Admin** - Red shield icon, "Administrator" badge
- **Manager** - Purple shield icon, "Manager" badge  
- **HR** - Blue shield icon, "HR Staff" badge

### **Navigation Features**
- **Collapsible Sidebar** - Space-efficient design
- **Search Functionality** - Quick navigation access
- **Favorites System** - Bookmark frequently used pages
- **Recent Pages** - Quick access to recently visited pages

### **Admin Features**
- **Admin Badges** - Special indicators for admin-only functions
- **Red Color Scheme** - Visual distinction for admin sections
- **Enhanced Permissions** - Additional management capabilities

## 🔄 **System Workflow**

### **Typical User Journey**
1. **Admin** creates system and initial users
2. **Managers** are assigned to oversee departments
3. **HR Staff** are assigned to handle daily operations
4. **Role-based access** ensures appropriate permissions
5. **Audit logging** tracks all system activities

### **Data Flow**
- **HR Staff** → Enter employee data, attendance, leave requests
- **Managers** → Review, approve, and manage team data
- **Admin** → Oversee system, manage users, configure settings

This role-based system ensures proper access control while maintaining operational efficiency for the GSS HR & Payroll Management System.


