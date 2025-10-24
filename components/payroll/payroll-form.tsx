"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
// Supabase client removed
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calculator, DollarSign, Calendar, User, AlertCircle, CheckCircle, Clock, Plane } from "lucide-react"
import { getEmployeeLeaveData, calculatePayrollWithLeave, getEmployeeLeaveBalance, type LeaveData } from "@/lib/leave-payroll-integration"

type Employee = {
  id: string
  employee_id: string
  first_name: string
  last_name: string
  job_title: string
}

export function PayrollForm({ employees }: { employees: Employee[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [leaveData, setLeaveData] = useState<LeaveData | null>(null)
  const [leaveBalance, setLeaveBalance] = useState<any>(null)
  const [isLoadingLeave, setIsLoadingLeave] = useState(false)

  const currentDate = new Date()
  const [formData, setFormData] = useState({
    employee_id: "",
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    basic_salary: "",
    allowances: "0",
    deductions: "0",
    overtime_pay: "0",
    transport_allowance: "0",
    nssa_deduction: "0",
    payee_deduction: "0",
    exchange_rate: "0", // ZWL per 1 USD
    days_worked: "26",
    days_absent: "0",
    payment_status: "pending",
    payment_date: "",
    payment_method: "",
    notes: "",
  })

  const [calculatedValues, setCalculatedValues] = useState({
    gross_salary: 0,
    net_salary: 0,
    total_allowances: 0,
    total_deductions: 0,
  })

  // Enhanced calculation logic
  useEffect(() => {
    const basic = Number.parseFloat(formData.basic_salary) || 0
    const allowances = Number.parseFloat(formData.allowances) || 0
    const overtime = Number.parseFloat(formData.overtime_pay) || 0
    const transportAllowance = Number.parseFloat(formData.transport_allowance) || 0
    
    const deductions = Number.parseFloat(formData.deductions) || 0
    const nssaDeduction = Number.parseFloat(formData.nssa_deduction) || 0
    const payeeDeduction = Number.parseFloat(formData.payee_deduction) || 0

    const totalAllowances = allowances + transportAllowance
    const totalDeductions = deductions + nssaDeduction + payeeDeduction
    const gross = basic + totalAllowances + overtime
    const net = gross - totalDeductions

    setCalculatedValues({
      gross_salary: gross,
      net_salary: net,
      total_allowances: totalAllowances,
      total_deductions: totalDeductions,
    })
  }, [
    formData.basic_salary, 
    formData.allowances, 
    formData.transport_allowance,
    formData.deductions, 
    formData.nssa_deduction,
    formData.payee_deduction,
    formData.overtime_pay
  ])

  // Employee selection handler
  const handleEmployeeSelect = async (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId)
    setSelectedEmployee(employee || null)
    setFormData({ ...formData, employee_id: employeeId })
    
    // Fetch leave data for the selected employee
    if (employeeId) {
      await fetchLeaveData(employeeId, formData.month, formData.year)
    }
  }

  // Fetch leave data
  const fetchLeaveData = async (employeeId: string, month: number, year: number) => {
    setIsLoadingLeave(true)
    try {
      const [leaveData, leaveBalance] = await Promise.all([
        getEmployeeLeaveData(employeeId, month, year),
        getEmployeeLeaveBalance(employeeId, year)
      ])
      
      setLeaveData(leaveData)
      setLeaveBalance(leaveBalance)
      
      // Auto-calculate days absent based on unpaid leave
      if (leaveData.unpaid_leave_days > 0) {
        setFormData(prev => ({
          ...prev,
          days_absent: leaveData.unpaid_leave_days.toString(),
          days_worked: (26 - leaveData.unpaid_leave_days).toString()
        }))
      }
    } catch (error) {
      console.error("Error fetching leave data:", error)
    } finally {
      setIsLoadingLeave(false)
    }
  }

  // Handle month/year change
  const handlePeriodChange = (field: 'month' | 'year', value: number) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)
    
    // Refetch leave data if employee is selected
    if (formData.employee_id) {
      fetchLeaveData(
        formData.employee_id, 
        field === 'month' ? value : formData.month,
        field === 'year' ? value : formData.year
      )
    }
  }

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.employee_id) {
      errors.employee_id = "Please select an employee"
    }
    
    if (!formData.basic_salary || Number.parseFloat(formData.basic_salary) <= 0) {
      errors.basic_salary = "Basic salary must be greater than 0"
    }
    
    if (Number.parseInt(formData.days_worked) < 0 || Number.parseInt(formData.days_worked) > 31) {
      errors.days_worked = "Days worked must be between 0 and 31"
    }
    
    if (Number.parseInt(formData.days_absent) < 0) {
      errors.days_absent = "Days absent cannot be negative"
    }

    if (calculatedValues.net_salary < 0) {
      errors.net_salary = "Net salary cannot be negative. Please check deductions."
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const submitData = {
        employee_id: formData.employee_id,
        month: formData.month,
        year: formData.year,
        basic_salary: Number.parseFloat(formData.basic_salary),
        allowances: calculatedValues.total_allowances,
        deductions: calculatedValues.total_deductions,
        overtime_pay: Number.parseFloat(formData.overtime_pay),
        gross_salary: calculatedValues.gross_salary,
        net_salary: calculatedValues.net_salary,
        days_worked: Number.parseInt(formData.days_worked),
        days_absent: Number.parseInt(formData.days_absent),
        payment_status: formData.payment_status,
        payment_date: formData.payment_date || null,
        payment_method: formData.payment_method || null,
        notes: formData.notes || null,
        // explicit components & fx
        exchange_rate: Number.parseFloat(formData.exchange_rate) || 0,
        transport_allowance: Number.parseFloat(formData.transport_allowance) || 0,
        nssa_deduction: Number.parseFloat(formData.nssa_deduction) || 0,
        payee_deduction: Number.parseFloat(formData.payee_deduction) || 0,
      }

      const { error } = await supabase.from("payroll").insert([submitData])

      if (error) throw error

      toast.success("Payroll record created", {
        description: `Payroll for ${selectedEmployee?.first_name} ${selectedEmployee?.last_name} has been created successfully`
      })

      router.push("/payroll")
      router.refresh()
    } catch (error: any) {
      console.error("Error creating payroll:", error)
      setError(error.message || "Failed to create payroll record")
      toast.error("Payroll creation failed", {
        description: error.message || "Failed to create payroll record"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <strong>Error:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      {Object.keys(validationErrors).length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <AlertCircle className="h-4 w-4" />
              <strong>Please fix the following errors:</strong>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-orange-600">
              {Object.values(validationErrors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Employee & Period Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="employee_id">
                  Employee <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.employee_id}
                  onValueChange={handleEmployeeSelect}
                  required
                >
                  <SelectTrigger className={validationErrors.employee_id ? "border-red-300" : ""}>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.employee_id} - {emp.first_name} {emp.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.employee_id && (
                  <p className="text-sm text-red-600">{validationErrors.employee_id}</p>
                )}
              </div>

          <div className="space-y-2">
            <Label htmlFor="month">
              Month <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.month.toString()}
              onValueChange={(value) => setFormData({ ...formData, month: Number.parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ].map((month, index) => (
                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">
              Year <span className="text-red-500">*</span>
            </Label>
            <Input
              id="year"
              type="number"
              required
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: Number.parseInt(e.target.value) })}
            />
          </div>
        </div>
          </CardContent>
        </Card>

        {/* Salary Components */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Salary Components
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="exchange_rate">
              Exchange Rate (ZWL per USD $)
            </Label>
            <Input
              id="exchange_rate"
              type="number"
              step="0.000001"
              value={formData.exchange_rate}
              onChange={(e) => setFormData({ ...formData, exchange_rate: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="basic_salary">
              Basic Salary (USD $) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="basic_salary"
              type="number"
              step="0.01"
              required
              value={formData.basic_salary}
              onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
              placeholder="1000.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="allowances">Allowances (USD $)</Label>
            <Input
              id="allowances"
              type="number"
              step="0.01"
              value={formData.allowances}
              onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
              placeholder="200.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transport_allowance">Transport Allowance (USD $)</Label>
            <Input
              id="transport_allowance"
              type="number"
              step="0.01"
              value={formData.transport_allowance}
              onChange={(e) => setFormData({ ...formData, transport_allowance: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="overtime_pay">Overtime Pay (USD $)</Label>
            <Input
              id="overtime_pay"
              type="number"
              step="0.01"
              value={formData.overtime_pay}
              onChange={(e) => setFormData({ ...formData, overtime_pay: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nssa_deduction">NSSA Deduction (USD $)</Label>
            <Input
              id="nssa_deduction"
              type="number"
              step="0.01"
              value={formData.nssa_deduction}
              onChange={(e) => setFormData({ ...formData, nssa_deduction: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payee_deduction">PAYEE Deduction (USD $)</Label>
            <Input
              id="payee_deduction"
              type="number"
              step="0.01"
              value={formData.payee_deduction}
              onChange={(e) => setFormData({ ...formData, payee_deduction: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deductions">Other Deductions (USD $)</Label>
            <Input
              id="deductions"
              type="number"
              step="0.01"
              value={formData.deductions}
              onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Calculated Values */}
        <div className="grid gap-4 rounded-lg border bg-gray-50 p-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-gray-500">Gross Salary</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">${calculatedValues.gross_salary.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Net Salary</p>
            <p className="mt-1 text-2xl font-bold text-[#a2141e]">${calculatedValues.net_salary.toLocaleString()}</p>
          </div>
        </div>
          </CardContent>
        </Card>

        {/* Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="days_worked">
              Days Worked <span className="text-red-500">*</span>
            </Label>
            <Input
              id="days_worked"
              type="number"
              required
              value={formData.days_worked}
              onChange={(e) => setFormData({ ...formData, days_worked: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="days_absent">Days Absent</Label>
            <Input
              id="days_absent"
              type="number"
              value={formData.days_absent}
              onChange={(e) => setFormData({ ...formData, days_absent: e.target.value })}
            />
          </div>
        </div>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="payment_status">
              Payment Status <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.payment_status}
              onValueChange={(value) => setFormData({ ...formData, payment_status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_date">Payment Date</Label>
            <Input
              id="payment_date"
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes..."
            rows={2}
          />
        </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="bg-[#a2141e] hover:bg-[#8a1119]">
          {isLoading ? "Processing..." : "Process Payroll"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
    </div>
  )
}
