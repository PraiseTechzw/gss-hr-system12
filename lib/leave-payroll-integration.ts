// Integration utilities for leave management and payroll calculations

// Supabase client removed

export type LeaveData = {
  approved_leave_days: number
  unpaid_leave_days: number
  sick_leave_days: number
  casual_leave_days: number
}

export async function getEmployeeLeaveData(
  employeeId: string, 
  month: number, 
  year: number
): Promise<LeaveData> {
  const supabase = createClient()
  
  // Get the start and end dates for the month
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0) // Last day of the month
  
  const { data: leaveRequests, error } = await supabase
    .from("leave_requests")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("status", "approved")
    .gte("start_date", startDate.toISOString().split('T')[0])
    .lte("end_date", endDate.toISOString().split('T')[0])

  if (error) {
    console.error("Error fetching leave data:", error)
    return {
      approved_leave_days: 0,
      unpaid_leave_days: 0,
      sick_leave_days: 0,
      casual_leave_days: 0
    }
  }

  // Calculate leave days by type
  let unpaidLeaveDays = 0
  let sickLeaveDays = 0
  let casualLeaveDays = 0
  let totalApprovedDays = 0

  leaveRequests?.forEach(leave => {
    const leaveDays = calculateLeaveDaysInMonth(
      leave.start_date, 
      leave.end_date, 
      startDate, 
      endDate
    )
    
    totalApprovedDays += leaveDays
    
    switch (leave.leave_type) {
      case 'unpaid':
        unpaidLeaveDays += leaveDays
        break
      case 'sick':
        sickLeaveDays += leaveDays
        break
      case 'casual':
        casualLeaveDays += leaveDays
        break
    }
  })

  return {
    approved_leave_days: totalApprovedDays,
    unpaid_leave_days: unpaidLeaveDays,
    sick_leave_days: sickLeaveDays,
    casual_leave_days: casualLeaveDays
  }
}

function calculateLeaveDaysInMonth(
  leaveStart: string, 
  leaveEnd: string, 
  monthStart: Date, 
  monthEnd: Date
): number {
  const start = new Date(Math.max(new Date(leaveStart).getTime(), monthStart.getTime()))
  const end = new Date(Math.min(new Date(leaveEnd).getTime(), monthEnd.getTime()))
  
  if (start > end) return 0
  
  const diffTime = end.getTime() - start.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}

export function calculatePayrollWithLeave(
  basicSalary: number,
  allowances: number,
  overtimePay: number,
  deductions: number,
  daysInMonth: number,
  daysWorked: number,
  leaveData: LeaveData
) {
  // Calculate working days (excluding weekends)
  const workingDaysInMonth = Math.floor(daysInMonth * (5/7)) // Approximate working days
  
  // Adjust salary based on unpaid leave
  const unpaidLeaveDays = leaveData.unpaid_leave_days
  const salaryDeductionForUnpaidLeave = (basicSalary / workingDaysInMonth) * unpaidLeaveDays
  
  // Adjusted basic salary
  const adjustedBasicSalary = basicSalary - salaryDeductionForUnpaidLeave
  
  // Calculate gross salary
  const grossSalary = adjustedBasicSalary + allowances + overtimePay
  
  // Add leave-related deductions
  const totalDeductions = deductions + salaryDeductionForUnpaidLeave
  
  // Calculate net salary
  const netSalary = grossSalary - totalDeductions
  
  return {
    adjusted_basic_salary: adjustedBasicSalary,
    gross_salary: grossSalary,
    net_salary: netSalary,
    unpaid_leave_deduction: salaryDeductionForUnpaidLeave,
    total_deductions: totalDeductions,
    effective_working_days: workingDaysInMonth - unpaidLeaveDays
  }
}

export async function getEmployeeLeaveBalance(employeeId: string, year: number) {
  const supabase = createClient()
  
  // Get all approved leave for the year
  const { data: leaveRequests } = await supabase
    .from("leave_requests")
    .select("leave_type, total_days")
    .eq("employee_id", employeeId)
    .eq("status", "approved")
    .gte("start_date", `${year}-01-01`)
    .lte("end_date", `${year}-12-31`)

  // Calculate leave balances (assuming standard entitlements)
  const entitlements = {
    casual: 12, // 12 days casual leave per year
    sick: 10,   // 10 days sick leave per year
    earned: 21  // 21 days earned leave per year
  }

  const used = {
    casual: 0,
    sick: 0,
    earned: 0
  }

  leaveRequests?.forEach(leave => {
    if (leave.leave_type in used) {
      used[leave.leave_type as keyof typeof used] += leave.total_days
    }
  })

  return {
    casual: {
      entitled: entitlements.casual,
      used: used.casual,
      balance: entitlements.casual - used.casual
    },
    sick: {
      entitled: entitlements.sick,
      used: used.sick,
      balance: entitlements.sick - used.sick
    },
    earned: {
      entitled: entitlements.earned,
      used: used.earned,
      balance: entitlements.earned - used.earned
    }
  }
}
