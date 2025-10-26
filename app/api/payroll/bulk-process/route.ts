import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthService } from '@/lib/auth'
import { PayrollCalculatorService, PayrollCalculationRequest } from '@/lib/payroll-calculator'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authToken = request.cookies.get('auth-token')?.value
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authResult = AuthService.verifyToken(authToken)
    if (!authResult.valid || !authResult.user || !['admin', 'hr'].includes(authResult.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      month, 
      year, 
      departmentId,
      employeeIds,
      paymentStatus = 'pending',
      saveToDatabase = true
    } = body

    // Validate required fields
    if (!month || !year) {
      return NextResponse.json({ 
        error: 'Missing required fields: month, year' 
      }, { status: 400 })
    }

    const supabase = await createClient()

    // Get employees to process
    let employeesQuery = supabase
      .from('employees')
      .select(`
        id,
        employee_id,
        first_name,
        last_name,
        basic_salary,
        allowances,
        transport_allowance,
        housing_allowance,
        employment_status
      `)
      .eq('employment_status', 'active')

    // Filter by department if specified
    if (departmentId) {
      employeesQuery = employeesQuery.eq('department_id', departmentId)
    }

    // Filter by specific employee IDs if provided
    if (employeeIds && employeeIds.length > 0) {
      employeesQuery = employeesQuery.in('id', employeeIds)
    }

    const { data: employees, error: employeesError } = await employeesQuery

    if (employeesError) {
      console.error('Error fetching employees:', employeesError)
      return NextResponse.json({ 
        error: 'Failed to fetch employees',
        details: employeesError.message 
      }, { status: 500 })
    }

    if (!employees || employees.length === 0) {
      return NextResponse.json({ 
        error: 'No employees found for processing' 
      }, { status: 404 })
    }

    // Create calculation requests for all employees
    const calculationRequests: PayrollCalculationRequest[] = employees.map(employee => ({
      employeeId: employee.id,
      month: parseInt(month),
      year: parseInt(year),
      basicSalary: employee.basic_salary || 0,
      allowances: employee.allowances || 0,
      transportAllowance: employee.transport_allowance || 0,
      housingAllowance: employee.housing_allowance || 0,
      otherAllowances: 0,
      bonuses: 0,
      overtimePay: 0,
      daysWorked: 26,
      daysAbsent: 0
    }))

    // Calculate payroll for all employees
    const calculationResults = await PayrollCalculatorService.calculateBulkPayroll(calculationRequests)

    const savedRecords = []
    const errors = []

    // Save to database if requested
    if (saveToDatabase) {
      for (const result of calculationResults) {
        try {
          const saveResult = await PayrollCalculatorService.savePayrollCalculation(
            result,
            paymentStatus,
            authResult.user.id
          )

          if (saveResult.success) {
            // Get the saved record with employee details
            const { data: savedRecordData } = await supabase
              .from('payroll')
              .select(`
                *,
                employees (
                  id,
                  employee_id,
                  first_name,
                  last_name,
                  email,
                  job_title
                )
              `)
              .eq('id', saveResult.id)
              .single()

            savedRecords.push(savedRecordData)
          } else {
            errors.push({
              employeeId: result.employeeId,
              error: saveResult.error
            })
          }
        } catch (error) {
          errors.push({
            employeeId: result.employeeId,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
    }

    // Calculate summary statistics
    const totalGrossSalary = calculationResults.reduce((sum, result) => sum + result.grossSalary, 0)
    const totalNetSalary = calculationResults.reduce((sum, result) => sum + result.netSalary, 0)
    const totalPAYE = calculationResults.reduce((sum, result) => sum + result.paye, 0)
    const totalAidsLevy = calculationResults.reduce((sum, result) => sum + result.aidsLevy, 0)
    const totalNSSA = calculationResults.reduce((sum, result) => sum + result.nssa, 0)

    return NextResponse.json({
      success: true,
      summary: {
        totalEmployees: calculationResults.length,
        totalGrossSalary,
        totalNetSalary,
        totalPAYE,
        totalAidsLevy,
        totalNSSA,
        averageSalary: calculationResults.length > 0 ? totalNetSalary / calculationResults.length : 0
      },
      calculations: calculationResults,
      savedRecords,
      errors,
      message: `Bulk payroll processed for ${calculationResults.length} employees`
    })

  } catch (error) {
    console.error('Bulk payroll processing error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
