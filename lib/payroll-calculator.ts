import { createClient } from '@/lib/supabase/server'
import { ZimraTaxCalculator, PayrollComponents } from '@/lib/tax/zimra-calculator'

export interface PayrollCalculationRequest {
  employeeId: string
  month: number
  year: number
  basicSalary: number
  allowances: number
  overtimePay: number
  transportAllowance?: number
  housingAllowance?: number
  otherAllowances?: number
  bonuses?: number
  daysWorked: number
  daysAbsent: number
}

export interface PayrollCalculationResult {
  employeeId: string
  month: number
  year: number
  grossSalary: number
  netSalary: number
  paye: number
  aidsLevy: number
  nssa: number
  totalDeductions: number
  daysWorked: number
  daysAbsent: number
  breakdown: {
    basicSalary: number
    allowances: number
    overtimePay: number
    transportAllowance: number
    housingAllowance: number
    otherAllowances: number
    bonuses: number
    grossTotal: number
    payeBreakdown: string
    aidsLevyBreakdown: string
    nssaBreakdown: string
  }
}

export class PayrollCalculatorService {
  /**
   * Calculate payroll for a single employee
   */
  static async calculateEmployeePayroll(request: PayrollCalculationRequest): Promise<PayrollCalculationResult> {
    // Validate inputs
    if (request.basicSalary <= 0) {
      throw new Error('Basic salary must be greater than 0')
    }
    if (request.daysWorked < 0 || request.daysWorked > 31) {
      throw new Error('Days worked must be between 0 and 31')
    }
    if (request.daysAbsent < 0) {
      throw new Error('Days absent cannot be negative')
    }

    // Create payroll components
    const components: PayrollComponents = {
      basicSalary: request.basicSalary,
      transportAllowance: request.transportAllowance || 0,
      housingAllowance: request.housingAllowance || 0,
      otherAllowances: request.otherAllowances || 0,
      bonuses: request.bonuses || 0,
      overtime: request.overtimePay
    }

    // Calculate Zimbabwe tax
    const taxResult = ZimraTaxCalculator.calculateZimbabweTax(components)

    // Validate calculation
    const validation = ZimraTaxCalculator.validateTaxCalculation(taxResult)
    if (!validation.isValid) {
      throw new Error(`Tax calculation validation failed: ${validation.errors.join(', ')}`)
    }

    return {
      employeeId: request.employeeId,
      month: request.month,
      year: request.year,
      grossSalary: taxResult.grossSalary,
      netSalary: taxResult.netSalary,
      paye: taxResult.paye,
      aidsLevy: taxResult.aidsLevy,
      nssa: taxResult.nssa,
      totalDeductions: taxResult.totalDeductions,
      daysWorked: request.daysWorked,
      daysAbsent: request.daysAbsent,
      breakdown: taxResult.breakdown
    }
  }

  /**
   * Calculate payroll for multiple employees
   */
  static async calculateBulkPayroll(requests: PayrollCalculationRequest[]): Promise<PayrollCalculationResult[]> {
    const results: PayrollCalculationResult[] = []
    const errors: string[] = []

    for (const request of requests) {
      try {
        const result = await this.calculateEmployeePayroll(request)
        results.push(result)
      } catch (error) {
        errors.push(`Employee ${request.employeeId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    if (errors.length > 0) {
      console.warn('Some payroll calculations failed:', errors)
    }

    return results
  }

  /**
   * Get employee salary information from database
   */
  static async getEmployeeSalaryInfo(employeeId: string): Promise<{
    basicSalary: number
    allowances: number
    transportAllowance: number
    housingAllowance: number
  } | null> {
    try {
      const supabase = await createClient()
      
      const { data: employee, error } = await supabase
        .from('employees')
        .select('basic_salary, allowances, transport_allowance, housing_allowance')
        .eq('id', employeeId)
        .single()

      if (error) {
        console.error('Error fetching employee salary info:', error)
        return null
      }

      return {
        basicSalary: employee.basic_salary || 0,
        allowances: employee.allowances || 0,
        transportAllowance: employee.transport_allowance || 0,
        housingAllowance: employee.housing_allowance || 0
      }
    } catch (error) {
      console.error('Error fetching employee salary info:', error)
      return null
    }
  }

  /**
   * Calculate payroll with employee data from database
   */
  static async calculatePayrollWithEmployeeData(
    employeeId: string,
    month: number,
    year: number,
    additionalComponents: {
      overtimePay?: number
      bonuses?: number
      otherAllowances?: number
      daysWorked?: number
      daysAbsent?: number
    } = {}
  ): Promise<PayrollCalculationResult | null> {
    try {
      // Get employee salary information
      const salaryInfo = await this.getEmployeeSalaryInfo(employeeId)
      if (!salaryInfo) {
        throw new Error('Employee salary information not found')
      }

      // Create calculation request
      const request: PayrollCalculationRequest = {
        employeeId,
        month,
        year,
        basicSalary: salaryInfo.basicSalary,
        allowances: salaryInfo.allowances,
        transportAllowance: salaryInfo.transportAllowance,
        housingAllowance: salaryInfo.housingAllowance,
        otherAllowances: additionalComponents.otherAllowances || 0,
        bonuses: additionalComponents.bonuses || 0,
        overtimePay: additionalComponents.overtimePay || 0,
        daysWorked: additionalComponents.daysWorked || 26,
        daysAbsent: additionalComponents.daysAbsent || 0
      }

      return await this.calculateEmployeePayroll(request)
    } catch (error) {
      console.error('Error calculating payroll with employee data:', error)
      return null
    }
  }

  /**
   * Save payroll calculation to database
   */
  static async savePayrollCalculation(
    result: PayrollCalculationResult,
    paymentStatus: string = 'pending',
    createdBy: string
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const supabase = await createClient()

      const { data, error } = await supabase
        .from('payroll')
        .insert({
          employee_id: result.employeeId,
          month: result.month,
          year: result.year,
          basic_salary: result.breakdown.basicSalary,
          allowances: result.breakdown.allowances,
          overtime_pay: result.breakdown.overtimePay,
          gross_salary: result.grossSalary,
          net_salary: result.netSalary,
          paye: result.paye,
          aids_levy: result.aidsLevy,
          nssa: result.nssa,
          total_deductions: result.totalDeductions,
          days_worked: result.daysWorked,
          days_absent: result.daysAbsent,
          payment_status: paymentStatus,
          created_by: createdBy,
          // Additional breakdown fields
          transport_allowance: result.breakdown.transportAllowance,
          housing_allowance: result.breakdown.housingAllowance,
          other_allowances: result.breakdown.otherAllowances,
          bonuses: result.breakdown.bonuses
        })
        .select('id')
        .single()

      if (error) {
        console.error('Error saving payroll calculation:', error)
        return { success: false, error: error.message }
      }

      return { success: true, id: data.id }
    } catch (error) {
      console.error('Error saving payroll calculation:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Get payroll calculation history for an employee
   */
  static async getEmployeePayrollHistory(
    employeeId: string,
    limit: number = 12
  ): Promise<PayrollCalculationResult[]> {
    try {
      const supabase = await createClient()

      const { data: payrollRecords, error } = await supabase
        .from('payroll')
        .select('*')
        .eq('employee_id', employeeId)
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching payroll history:', error)
        return []
      }

      return payrollRecords?.map(record => ({
        employeeId: record.employee_id,
        month: record.month,
        year: record.year,
        grossSalary: record.gross_salary,
        netSalary: record.net_salary,
        paye: record.paye,
        aidsLevy: record.aids_levy,
        nssa: record.nssa,
        totalDeductions: record.total_deductions,
        daysWorked: record.days_worked,
        daysAbsent: record.days_absent,
        breakdown: {
          basicSalary: record.basic_salary,
          allowances: record.allowances,
          overtimePay: record.overtime_pay,
          transportAllowance: record.transport_allowance || 0,
          housingAllowance: record.housing_allowance || 0,
          otherAllowances: record.other_allowances || 0,
          bonuses: record.bonuses || 0,
          grossTotal: record.gross_salary,
          payeBreakdown: `${record.paye} (calculated)`,
          aidsLevyBreakdown: `${record.aids_levy} (3% of PAYE)`,
          nssaBreakdown: `${record.nssa} (4.5% of gross salary)`
        }
      })) || []
    } catch (error) {
      console.error('Error fetching payroll history:', error)
      return []
    }
  }
}
