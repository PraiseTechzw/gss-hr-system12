"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
// Supabase client removed
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"

type EmployeeFormData = {
  employee_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  gender: string
  address: string
  city: string
  state: string
  postal_code: string
  hire_date: string
  employment_status: string
  job_title: string
  department: string
  bank_name: string
  account_number: string
  ifsc_code: string
  nostro_account_number?: string
  zwl_account_number?: string
  branch_code?: string
  pan_number: string
  aadhar_number: string
  emergency_contact_name: string
  emergency_contact_phone: string
  emergency_contact_relationship: string
}

export function EmployeeForm({ employee }: { employee?: EmployeeFormData & { id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const zimbabweBanks = [
    "CBZ Bank",
    "Stanbic Bank Zimbabwe",
    "FBC Bank",
    "NMB Bank",
    "ZB Bank",
    "BancABC Zimbabwe",
    "Steward Bank",
    "First Capital Bank",
    "Ecobank Zimbabwe",
    "Nedbank Zimbabwe",
    "POSB (People's Own Savings Bank)",
    "CABS",
  ]

  const [formData, setFormData] = useState<EmployeeFormData>({
    employee_id: employee?.employee_id || "",
    first_name: employee?.first_name || "",
    last_name: employee?.last_name || "",
    email: employee?.email || "",
    phone: employee?.phone || "",
    date_of_birth: employee?.date_of_birth || "",
    gender: employee?.gender || "",
    address: employee?.address || "",
    city: employee?.city || "",
    state: employee?.state || "",
    postal_code: employee?.postal_code || "",
    hire_date: employee?.hire_date || new Date().toISOString().split("T")[0],
    employment_status: employee?.employment_status || "active",
    job_title: employee?.job_title || "",
    department: employee?.department || "",
    bank_name: employee?.bank_name || "",
    account_number: employee?.account_number || "",
    ifsc_code: employee?.ifsc_code || "",
    nostro_account_number: (employee as any)?.nostro_account_number || "",
    zwl_account_number: (employee as any)?.zwl_account_number || "",
    branch_code: (employee as any)?.branch_code || (employee as any)?.ifsc_code || "",
    pan_number: employee?.pan_number || "",
    aadhar_number: employee?.aadhar_number || "",
    emergency_contact_name: employee?.emergency_contact_name || "",
    emergency_contact_phone: employee?.emergency_contact_phone || "",
    emergency_contact_relationship: employee?.emergency_contact_relationship || "",
  })

  const normalizeZimbabwePhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "")
    if (digits.startsWith("263")) return "+" + digits
    if (digits.startsWith("0")) return "+263" + digits.slice(1)
    if (digits.length >= 9) return "+263" + digits
    return raw
  }

  const generateEmployeeId = async () => {
    try {
      // If editing, do not change an existing employee_id automatically
      if (employee?.id) {
        toast.info("Employee ID unchanged for edits")
        return
      }

      // First try to get the next ID from existing employees
      const { data: existingEmployees, error: fetchError } = await supabase
        .from("employees")
        .select("employee_id")
        .like("employee_id", "EMP%")
        .order("employee_id", { ascending: false })
        .limit(1)

      if (fetchError) throw fetchError

      let nextId: string
      if (existingEmployees && existingEmployees.length > 0) {
        // Extract number from last employee ID and increment
        const lastId = existingEmployees[0].employee_id
        const match = lastId.match(/EMP(\d+)/)
        if (match) {
          const nextNum = parseInt(match[1]) + 1
          nextId = `EMP${nextNum.toString().padStart(4, '0')}`
        } else {
          nextId = `EMP0001`
        }
      } else {
        nextId = `EMP0001`
      }

      setFormData((prev) => ({ ...prev, employee_id: nextId }))
      toast.success("Employee ID generated", { description: nextId })
    } catch (e: any) {
      // Fallback: timestamp-based ID to avoid blocking user
      const fallback = `EMP${Date.now().toString().slice(-6)}`
      setFormData((prev) => ({ ...prev, employee_id: fallback }))
      toast.error("ID generator unavailable", { description: e?.message || "Using fallback ID" })
    }
  }

  // Zimbabwe National ID helpers (format: PP-MMMMMM L SS)
  const parseNationalId = (value: string) => {
    const match = value?.toUpperCase().match(/^(\d{2})-(\d+)\s+([A-Z])\s+(\d{2})$/)
    return {
      prefix: match?.[1] || "12",
      middle: match?.[2] || "",
      letter: match?.[3] || "A",
      suffix: match?.[4] || "12",
    }
  }

  const [nationalIdParts, setNationalIdParts] = useState(() => parseNationalId(formData.pan_number))

  const updateNationalId = (parts: { prefix?: string; middle?: string; letter?: string; suffix?: string }) => {
    const next = {
      prefix: parts.prefix ?? nationalIdParts.prefix,
      middle: (parts.middle ?? nationalIdParts.middle).replace(/\D/g, ""),
      letter: (parts.letter ?? nationalIdParts.letter).toUpperCase().slice(0, 1),
      suffix: (parts.suffix ?? nationalIdParts.suffix).replace(/\D/g, "").slice(0, 2),
    }
    setNationalIdParts(next)
    const formatted = `${next.prefix}-${next.middle} ${next.letter} ${next.suffix}`.trim()
    setFormData(prev => ({ ...prev, pan_number: formatted }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Prepare data for database
      const employeeData = {
        employee_id: formData.employee_id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        full_name: `${formData.first_name} ${formData.last_name}`,
        email: formData.email,
        phone: formData.phone,
        job_title: formData.job_title,
        employment_status: formData.employment_status,
        department: formData.department,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        postal_code: formData.postal_code || null,
        hire_date: formData.hire_date,
        bank_name: formData.bank_name || null,
        account_number: formData.account_number || null,
        ifsc_code: formData.ifsc_code || null,
        nostro_account_number: formData.nostro_account_number || null,
        zwl_account_number: formData.zwl_account_number || null,
        branch_code: formData.branch_code || null,
        pan_number: formData.pan_number || null,
        aadhar_number: formData.aadhar_number || null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_phone: formData.emergency_contact_phone || null,
        emergency_contact_relationship: formData.emergency_contact_relationship || null,
        // Map employment_status to status for database compatibility
        status: formData.employment_status,
        // Map job_title to position for database compatibility
        position: formData.job_title
      }

      if (employee?.id) {
        // Update existing employee
        const { error } = await supabase.from("employees").update(employeeData).eq("id", employee.id)

        if (error) throw error
        toast.success("Employee updated", {
          description: `${formData.first_name} ${formData.last_name} saved successfully.`
        })
      } else {
        // Create new employee using API endpoint that bypasses RLS
        const response = await fetch('/api/employees/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(employeeData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.details || errorData.error || 'Failed to create employee')
        }

        toast.success("Employee added", {
          description: `${formData.first_name} ${formData.last_name} created successfully.`
        })
      }

      router.push("/employees")
      router.refresh()
    } catch (error: any) {
      console.error("Error saving employee:", error)
      setError(error.message || "Failed to save employee")
      toast.error("Save failed", {
        description: error.message || "Failed to save employee"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
        <p className="text-sm text-gray-500">Core details used across payroll, attendance and reporting.</p>
        <div className="grid gap-4 md:grid-cols-2 rounded-lg border bg-white p-4">
          <div className="space-y-2">
            <Label htmlFor="employee_id">
              Employee ID <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="employee_id"
                required
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                placeholder="EMP001"
              />
              <Button type="button" variant="outline" onClick={generateEmployeeId}>
                Generate
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="employment_status">
              Employment Status <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.employment_status}
              onValueChange={(value) => setFormData({ ...formData, employment_status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="first_name">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="first_name"
              required
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              placeholder="Praise"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="last_name"
              required
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              placeholder="Masunga"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="name@company.co.zw"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              onBlur={() => setFormData(prev => ({ ...prev, phone: normalizeZimbabwePhone(prev.phone) }))
              }
              placeholder="+263 77 123 4567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
        <p className="text-sm text-gray-500">Used on payslips and official letters.</p>
        <div className="grid gap-4 md:grid-cols-2 rounded-lg border bg-white p-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="House No., Street, Suburb"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Harare"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">Province</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="Harare Province"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postal_code">Postal Code</Label>
            <Input
              id="postal_code"
              value={formData.postal_code}
              onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              placeholder="0000"
            />
          </div>
        </div>
      </div>

      {/* Employment Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Employment Information</h3>
        <p className="text-sm text-gray-500">Role and department details for internal records.</p>
        <div className="grid gap-4 md:grid-cols-2 rounded-lg border bg-white p-4">
          <div className="space-y-2">
            <Label htmlFor="hire_date">
              Hire Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="hire_date"
              type="date"
              required
              value={formData.hire_date}
              onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
              placeholder="Security Guard"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="job_title">
              Job Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="job_title"
              required
              value={formData.job_title}
              onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
              placeholder="Operations"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Bank Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Bank & IDs (Zimbabwe)</h3>
        <p className="text-sm text-gray-500">Provide account details for both USD (Nostro) and ZWL where applicable.</p>
        <div className="grid gap-4 md:grid-cols-2 rounded-lg border bg-white p-4">
          <div className="space-y-2">
            <Label htmlFor="bank_name">Bank Name</Label>
            <Select
              value={formData.bank_name}
              onValueChange={(value) => setFormData({ ...formData, bank_name: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bank" />
              </SelectTrigger>
              <SelectContent>
                {zimbabweBanks.map((bank) => (
                  <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nostro_account_number">Nostro Account Number (USD)</Label>
            <Input
              id="nostro_account_number"
              value={formData.nostro_account_number || ""}
              onChange={(e) => setFormData({ ...formData, nostro_account_number: e.target.value })}
              placeholder="USD account number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zwl_account_number">ZWL Account Number</Label>
            <Input
              id="zwl_account_number"
              value={formData.zwl_account_number || ""}
              onChange={(e) => setFormData({ ...formData, zwl_account_number: e.target.value })}
              placeholder="ZWL account number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch_code">Branch Code</Label>
            <Input
              id="branch_code"
              value={formData.branch_code || ""}
              onChange={(e) => setFormData({ ...formData, branch_code: e.target.value })}
              placeholder="e.g. 12345"
            />
          </div>
          <div className="space-y-2">
            <Label>National ID</Label>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <Label className="text-xs text-gray-500">Prefix</Label>
                <Select value={nationalIdParts.prefix} onValueChange={(v) => updateNationalId({ prefix: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="12" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 100 }, (_, i) => String(i).padStart(2, "0")).map((code) => (
                      <SelectItem key={code} value={code}>{code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Middle (digits)</Label>
                <Input
                  inputMode="numeric"
                  placeholder="345678"
                  value={nationalIdParts.middle}
                  onChange={(e) => updateNationalId({ middle: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Letter</Label>
                <Select value={nationalIdParts.letter} onValueChange={(v) => updateNationalId({ letter: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="A" />
                  </SelectTrigger>
                  <SelectContent>
                    {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Suffix</Label>
                <Select value={nationalIdParts.suffix} onValueChange={(v) => updateNationalId({ suffix: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="12" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 100 }, (_, i) => String(i).padStart(2, "0")).map((code) => (
                      <SelectItem key={code} value={code}>{code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-xs text-gray-500">Format: 12-345678 A 12</div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="aadhar_number">NSSA Number</Label>
            <Input
              id="aadhar_number"
              value={formData.aadhar_number}
              onChange={(e) => setFormData({ ...formData, aadhar_number: e.target.value })}
              placeholder="e.g. 12-345678 Z 12"
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_name">Contact Name</Label>
            <Input
              id="emergency_contact_name"
              value={formData.emergency_contact_name}
              onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
            <Input
              id="emergency_contact_phone"
              value={formData.emergency_contact_phone}
              onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_relationship">Relationship</Label>
            <Select
              value={formData.emergency_contact_relationship}
              onValueChange={(value) => setFormData({ ...formData, emergency_contact_relationship: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Spouse">Spouse</SelectItem>
                <SelectItem value="Parent">Parent</SelectItem>
                <SelectItem value="Child">Child</SelectItem>
                <SelectItem value="Sibling">Sibling</SelectItem>
                <SelectItem value="Relative">Relative</SelectItem>
                <SelectItem value="Guardian">Guardian</SelectItem>
                <SelectItem value="Friend">Friend</SelectItem>
                <SelectItem value="Colleague">Colleague</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="bg-[#a2141e] hover:bg-[#8a1119]">
          {isLoading ? "Saving..." : employee ? "Update Employee" : "Add Employee"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
