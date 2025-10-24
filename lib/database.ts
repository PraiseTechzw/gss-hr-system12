import { neon } from "@neondatabase/serverless"

// Create a SQL client using Neon serverless driver
const sql = neon(process.env.POSTGRES_URL!)

export { sql }

// Helper function to execute queries with error handling
export async function executeQuery<T = any>(
  query: string,
  params: any[] = [],
): Promise<{ data: T[] | null; error: Error | null }> {
  try {
    const data = await sql(query, params)
    return { data: data as T[], error: null }
  } catch (error) {
    console.error("Database query error:", error)
    return { data: null, error: error as Error }
  }
}

// User profile queries
export async function getUserProfile(userId: string) {
  const query = `
    SELECT id, email, first_name, last_name, full_name, phone, role, 
           department_id, position, status, last_login, created_at
    FROM user_profiles
    WHERE id = $1
  `
  return executeQuery(query, [userId])
}

export async function getAllUsers() {
  const query = `
    SELECT id, email, first_name, last_name, full_name, phone, role, 
           department_id, position, status, last_login, created_at
    FROM user_profiles
    ORDER BY created_at DESC
  `
  return executeQuery(query)
}

// Employee queries
export async function getAllEmployees() {
  const query = `
    SELECT e.*, d.name as department_name
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    ORDER BY e.created_at DESC
  `
  return executeQuery(query)
}

export async function getEmployeeById(id: string) {
  const query = `
    SELECT e.*, d.name as department_name
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE e.id = $1
  `
  return executeQuery(query, [id])
}

// Leave requests queries
export async function getAllLeaveRequests() {
  const query = `
    SELECT lr.*, 
           e.employee_id, e.first_name, e.last_name, e.email, e.position
    FROM leave_requests lr
    LEFT JOIN employees e ON lr.employee_id = e.id
    ORDER BY lr.created_at DESC
  `
  return executeQuery(query)
}

export async function getPendingLeaveRequests() {
  const query = `
    SELECT lr.*, 
           e.employee_id, e.first_name, e.last_name, e.email, e.position
    FROM leave_requests lr
    LEFT JOIN employees e ON lr.employee_id = e.id
    WHERE lr.status = 'pending'
    ORDER BY lr.created_at DESC
  `
  return executeQuery(query)
}

// Attendance queries
export async function getAllAttendance() {
  const query = `
    SELECT a.*, 
           e.employee_id, e.first_name, e.last_name, e.position
    FROM attendance a
    LEFT JOIN employees e ON a.employee_id = e.id
    ORDER BY a.date DESC
    LIMIT 100
  `
  return executeQuery(query)
}

// Payroll queries
export async function getAllPayroll() {
  const query = `
    SELECT p.*, 
           e.employee_id, e.first_name, e.last_name, e.email, e.position
    FROM payroll p
    LEFT JOIN employees e ON p.employee_id = e.id
    ORDER BY p.pay_period_start DESC
  `
  return executeQuery(query)
}

// Deployment queries
export async function getAllDeployments() {
  const query = `
    SELECT d.*, 
           e.employee_id, e.first_name, e.last_name, e.email, e.position
    FROM deployments d
    LEFT JOIN employees e ON d.employee_id = e.id
    ORDER BY d.created_at DESC
  `
  return executeQuery(query)
}

// Department queries
export async function getAllDepartments() {
  const query = `
    SELECT d.*, 
           m.first_name as manager_first_name, 
           m.last_name as manager_last_name
    FROM departments d
    LEFT JOIN employees m ON d.manager_id = m.id
    ORDER BY d.name
  `
  return executeQuery(query)
}

// Statistics queries
export async function getDashboardStats() {
  try {
    const [employees, deployments, attendance] = await Promise.all([
      sql`SELECT COUNT(*) as total, 
                 COUNT(CASE WHEN status = 'active' THEN 1 END) as active
          FROM employees`,
      sql`SELECT COUNT(*) as total,
                 COUNT(CASE WHEN status = 'active' THEN 1 END) as active
          FROM deployments`,
      sql`SELECT COUNT(*) as present
          FROM attendance
          WHERE date >= CURRENT_DATE - INTERVAL '30 days'
            AND status = 'present'`,
    ])

    return {
      totalEmployees: Number(employees[0]?.total || 0),
      activeEmployees: Number(employees[0]?.active || 0),
      totalDeployments: Number(deployments[0]?.total || 0),
      activeDeployments: Number(deployments[0]?.active || 0),
      presentDays: Number(attendance[0]?.present || 0),
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      totalEmployees: 0,
      activeEmployees: 0,
      totalDeployments: 0,
      activeDeployments: 0,
      presentDays: 0,
    }
  }
}

export async function getPayrollStats() {
  try {
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    const [current, previous] = await Promise.all([
      sql`SELECT COALESCE(SUM(net_salary), 0) as total
          FROM payroll
          WHERE EXTRACT(MONTH FROM pay_period_start) = ${currentMonth}
            AND EXTRACT(YEAR FROM pay_period_start) = ${currentYear}`,
      sql`SELECT COALESCE(SUM(net_salary), 0) as total
          FROM payroll
          WHERE EXTRACT(MONTH FROM pay_period_start) = ${currentMonth - 1}
            AND EXTRACT(YEAR FROM pay_period_start) = ${currentYear}`,
    ])

    const currentTotal = Number(current[0]?.total || 0)
    const previousTotal = Number(previous[0]?.total || 0)
    const growth = previousTotal > 0 ? (((currentTotal - previousTotal) / previousTotal) * 100).toFixed(1) : "0"

    return {
      totalPayroll: currentTotal,
      monthlyGrowth: `${growth}%`,
    }
  } catch (error) {
    console.error("Error fetching payroll stats:", error)
    return {
      totalPayroll: 0,
      monthlyGrowth: "0%",
    }
  }
}

export async function getAttendanceStats() {
  try {
    const [stats] = await sql`
      SELECT 
        COUNT(*) as total_days,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_days
      FROM attendance
      WHERE date >= CURRENT_DATE - INTERVAL '30 days'
    `

    const totalDays = Number(stats?.total_days || 0)
    const presentDays = Number(stats?.present_days || 0)
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

    return {
      attendanceRate,
      presentDays,
      totalDays,
    }
  } catch (error) {
    console.error("Error fetching attendance stats:", error)
    return {
      attendanceRate: 0,
      presentDays: 0,
      totalDays: 0,
    }
  }
}
