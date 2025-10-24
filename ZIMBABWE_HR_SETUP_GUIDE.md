# 🇿🇼 Zimbabwe HR System - Complete Setup Guide

## 🎯 **System Overview**

This HR system is specifically designed for Zimbabwean companies and is fully compliant with:
- **ZIMRA PAYE** calculations using 2025 USD tax brackets
- **AIDS Levy** (3% of PAYE)
- **NSSA contributions** (4.5% of gross salary)
- **Leave management** with approval workflows
- **Role-based access control** (Admin, Manager, HR, Employee)

## 🏗️ **System Architecture**

### **Database Schema**
- **Users**: Authentication and role management
- **Departments**: Organizational structure
- **Employees**: Core HR data with USD/ZWL accounts
- **Payroll Records**: Monthly payroll with automatic tax calculations
- **Leave Management**: Request and approval workflows
- **Compliance Reporting**: ZIMRA and NSSA reports

### **Key Features**
- ✅ **ZIMRA-compliant tax calculations**
- ✅ **Automatic PAYE, AIDS Levy, NSSA calculations**
- ✅ **Payslip generation (single & bulk)**
- ✅ **Leave management with approval workflows**
- ✅ **Compliance reporting**
- ✅ **Role-based access control**

## 🚀 **Installation & Setup**

### **1. Database Setup**

Run the complete database script in your Supabase SQL Editor:

```sql
-- Copy and paste the entire content of scripts/011_zimbabwe_hr_database.sql
-- This will create all tables, functions, triggers, and sample data
```

### **2. Environment Configuration**

Create `.env.local` with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT Secret
NEXTAUTH_SECRET=your_secure_jwt_secret_here

# Application URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### **3. Install Dependencies**

```bash
npm install sonner @radix-ui/react-dropdown-menu @radix-ui/react-avatar
```

### **4. Start the Application**

```bash
npm run dev
```

## 🔐 **Default Login Credentials**

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | admin@geniussecurity.co.zw | admin123 | Full system access |
| **HR Manager** | hr@geniussecurity.co.zw | hr123 | HR operations |
| **Operations Manager** | manager@geniussecurity.co.zw | manager123 | Department management |

## 📊 **ZIMRA Tax Compliance**

### **2025 USD Tax Brackets**
```
From        To          Rate    Deduct
$0.00       $100.00    0%      0
$100.01     $300.00    20%     20
$300.01     $1,000.00  25%     35
$1,000.01   $2,000.00  30%     85
$2,000.01   $3,000.00  35%     185
$3,000.01+  ∞          40%     335
```

### **Automatic Calculations**
- **PAYE**: Calculated using ZIMRA brackets
- **AIDS Levy**: 3% of PAYE
- **NSSA**: 4.5% of gross salary
- **Net Salary**: Gross - Total Deductions

## 💼 **Payroll Management**

### **Single Payslip Generation**
```bash
POST /api/payslips/generate
{
  "employeeId": "uuid",
  "payrollPeriodId": "uuid",
  "format": "pdf"
}
```

### **Bulk Payslip Generation**
```bash
POST /api/payslips/bulk-generate
{
  "payrollPeriodId": "uuid",
  "departmentId": "uuid", // optional
  "format": "zip"
}
```

### **Payroll Calculation**
```bash
POST /api/payroll/calculate
{
  "employeeId": "uuid",
  "payrollPeriodId": "uuid",
  "components": {
    "basicSalary": 2000,
    "transportAllowance": 200,
    "housingAllowance": 300,
    "otherAllowances": 0,
    "bonuses": 0,
    "overtime": 0
  }
}
```

## 🏖️ **Leave Management**

### **Create Leave Request**
```bash
POST /api/leave/requests
{
  "employeeId": "uuid",
  "type": "annual",
  "startDate": "2025-02-01",
  "endDate": "2025-02-05",
  "reason": "Family vacation"
}
```

### **Approve/Reject Leave**
```bash
POST /api/leave/approve
{
  "requestId": "uuid",
  "action": "approved", // or "rejected"
  "comments": "Approved by manager"
}
```

### **Leave Types**
- **Annual Leave**: 21 days per year
- **Sick Leave**: As per company policy
- **Compassionate Leave**: Bereavement
- **Maternity Leave**: As per labor law
- **Paternity Leave**: As per labor law

## 📈 **Compliance Reporting**

### **ZIMRA Report**
```bash
GET /api/reports/compliance?type=zimra&month=1&year=2025&format=pdf
```

### **NSSA Report**
```bash
GET /api/reports/compliance?type=nssa&month=1&year=2025&format=pdf
```

### **Summary Report**
```bash
GET /api/reports/compliance?type=summary&month=1&year=2025&format=pdf
```

## 👥 **User Roles & Permissions**

### **Admin**
- ✅ Full system access
- ✅ User management
- ✅ Department management
- ✅ Payroll processing
- ✅ Leave approval
- ✅ Compliance reporting

### **HR Manager**
- ✅ Employee management
- ✅ Payroll processing
- ✅ Leave approval
- ✅ Compliance reporting
- ❌ User management

### **Manager**
- ✅ Department employee management
- ✅ Leave approval (department only)
- ✅ View department payroll
- ❌ System administration

### **Employee**
- ✅ View own payslips
- ✅ Create leave requests
- ✅ View own leave balance
- ❌ Administrative functions

## 🏢 **Department Structure**

### **Sample Departments**
- **Operations**: Security operations and field work
- **Administration**: Administrative and support functions
- **Finance**: Financial management and accounting
- **Human Resources**: HR management and employee relations

### **Department Management**
- Assign managers to departments
- Track department-specific payroll
- Generate department reports
- Manage department leave requests

## 📋 **Payslip Format**

### **Standard Payslip Layout**
```
GENIUS SECURITY (PVT) LTD
------------------------------------------
Employee Number: 000001
Employee Name: Ray Moyo
Department: Operations
Position: Operative
Bank: POHBS BANK
ID No: 09-67754-T-09
Employment Type: Contract

EARNINGS                   DEDUCTIONS
------------------------------------------
Basic              1800.00     NSSA           45.00
Transport Allow.    100.00     PAYE          455.00
                               AIDS Levy      13.65
------------------------------------------
GROSS:             1900.00     TOTAL DED:    513.65
NET PAID:          USD 1386.35

LEAVE SUMMARY
Annual Leave: 7 days remaining
```

## 🔧 **API Endpoints**

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/create-user` - Create new user (Admin only)

### **Payroll**
- `POST /api/payroll/calculate` - Calculate payroll
- `GET /api/payroll/calculate` - Get payroll records
- `POST /api/payslips/generate` - Generate single payslip
- `POST /api/payslips/bulk-generate` - Generate bulk payslips

### **Leave Management**
- `POST /api/leave/requests` - Create leave request
- `GET /api/leave/requests` - Get leave requests
- `POST /api/leave/approve` - Approve/reject leave

### **Reporting**
- `GET /api/reports/compliance` - Generate compliance reports

## 🎯 **Testing the System**

### **1. Login Test**
1. Go to `http://localhost:3000`
2. Login with `admin@geniussecurity.co.zw` / `admin123`
3. Verify dashboard access

### **2. Payroll Test**
1. Navigate to Payroll section
2. Create a new payroll period
3. Generate payslips for employees
4. Verify ZIMRA calculations

### **3. Leave Management Test**
1. Create a leave request
2. Approve/reject the request
3. Verify leave balance updates

### **4. Compliance Reporting Test**
1. Generate ZIMRA report
2. Generate NSSA report
3. Verify tax calculations

## 🚨 **Important Notes**

### **ZIMRA Compliance**
- Tax calculations are based on 2025 USD brackets
- AIDS Levy is 3% of PAYE
- NSSA is 4.5% of gross salary
- All calculations are automatically applied

### **Data Security**
- All data is encrypted in transit and at rest
- Role-based access control
- Audit logging for all actions
- Secure authentication with JWT tokens

### **Backup & Recovery**
- Regular database backups recommended
- Export payroll data for external storage
- Maintain compliance records for 7 years

## 📞 **Support & Maintenance**

### **System Monitoring**
- Check audit logs for system activity
- Monitor payroll calculations for accuracy
- Verify compliance reports before submission

### **Updates & Maintenance**
- Regular tax bracket updates as per ZIMRA
- System updates for new features
- Security patches and improvements

---

**🎉 Your Zimbabwean HR system is now ready for production use!**

**Next Steps:**
1. **Test all functionality** with sample data
2. **Configure company settings** and branding
3. **Train users** on the system
4. **Set up regular backups**
5. **Go live** with your HR system!

**For support or questions, contact your system administrator.**



