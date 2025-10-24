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
import { AlertCircle, MapPin, Calendar, DollarSign, Clock, User, Building, FileText, CheckCircle2 } from "lucide-react"

type Employee = {
  id: string
  employee_id: string
  first_name: string
  last_name: string
  job_title: string
}

type DeploymentFormData = {
  employee_id: string
  client_name: string
  site_location: string
  deployment_type: string
  start_date: string
  end_date: string
  shift_timing: string
  daily_rate: string
  monthly_salary: string
  status: string
  notes: string
  contact_person: string
  contact_phone: string
  site_address: string
  special_requirements: string
}

type ValidationErrors = {
  [key: string]: string
}

type FormStep = 'basic' | 'location' | 'compensation' | 'additional'

export function DeploymentForm({
  employees,
  deployment,
}: {
  employees: Employee[]
  deployment?: DeploymentFormData & { id: string }
}) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<FormStep>('basic')
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  const [formData, setFormData] = useState<DeploymentFormData>({
    employee_id: deployment?.employee_id || "",
    client_name: deployment?.client_name || "",
    site_location: deployment?.site_location || "",
    deployment_type: deployment?.deployment_type || "permanent",
    start_date: deployment?.start_date || "",
    end_date: deployment?.end_date || "",
    shift_timing: deployment?.shift_timing || "",
    daily_rate: deployment?.daily_rate || "",
    monthly_salary: deployment?.monthly_salary || "",
    status: deployment?.status || "pending",
    notes: deployment?.notes || "",
    contact_person: deployment?.contact_person || "",
    contact_phone: deployment?.contact_phone || "",
    site_address: deployment?.site_address || "",
    special_requirements: deployment?.special_requirements || "",
  })

  // Find selected employee when form loads or employee changes
  useEffect(() => {
    if (formData.employee_id) {
      const employee = employees.find(emp => emp.id === formData.employee_id)
      setSelectedEmployee(employee || null)
    }
  }, [formData.employee_id, employees])

  // Validation function
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    // Basic Information Validation
    if (!formData.employee_id) errors.employee_id = "Employee is required"
    if (!formData.client_name.trim()) errors.client_name = "Client name is required"
    if (formData.client_name.length < 2) errors.client_name = "Client name must be at least 2 characters"
    
    // Location Validation
    if (!formData.site_location.trim()) errors.site_location = "Site location is required"
    if (!formData.deployment_type) errors.deployment_type = "Deployment type is required"
    
    // Date Validation
    if (!formData.start_date) errors.start_date = "Start date is required"
    if (formData.end_date && formData.start_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      errors.end_date = "End date must be after start date"
    }
    
    // Compensation Validation
    const hasMonthly = formData.monthly_salary && Number.parseFloat(formData.monthly_salary) > 0
    const hasDaily = formData.daily_rate && Number.parseFloat(formData.daily_rate) > 0
    
    if (!hasMonthly && !hasDaily) {
      errors.compensation = "Either monthly salary or daily rate is required"
    }
    
    if (hasMonthly && hasDaily) {
      errors.compensation = "Please specify either monthly salary OR daily rate, not both"
    }

    // Phone validation
    if (formData.contact_phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.contact_phone)) {
      errors.contact_phone = "Please enter a valid phone number"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Step validation
  const validateStep = (step: FormStep): boolean => {
    const errors: ValidationErrors = {}

    switch (step) {
      case 'basic':
        if (!formData.employee_id) errors.employee_id = "Employee is required"
        if (!formData.client_name.trim()) errors.client_name = "Client name is required"
        if (!formData.deployment_type) errors.deployment_type = "Deployment type is required"
        break
      case 'location':
        if (!formData.site_location.trim()) errors.site_location = "Site location is required"
        if (!formData.start_date) errors.start_date = "Start date is required"
        break
      case 'compensation':
        const hasMonthly = formData.monthly_salary && Number.parseFloat(formData.monthly_salary) > 0
        const hasDaily = formData.daily_rate && Number.parseFloat(formData.daily_rate) > 0
        if (!hasMonthly && !hasDaily) {
          errors.compensation = "Either monthly salary or daily rate is required"
        }
        break
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Step navigation
  const nextStep = () => {
    if (validateStep(currentStep)) {
      const steps: FormStep[] = ['basic', 'location', 'compensation', 'additional']
      const currentIndex = steps.indexOf(currentStep)
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1])
      }
    }
  }

  const prevStep = () => {
    const steps: FormStep[] = ['basic', 'location', 'compensation', 'additional']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setError("Please fix the validation errors before submitting")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Prepare data for submission
      const submitData = {
        employee_id: formData.employee_id,
        client_name: formData.client_name,
        site_location: formData.site_location,
        deployment_type: formData.deployment_type,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        shift_timing: formData.shift_timing || null,
        daily_rate: formData.daily_rate ? Number.parseFloat(formData.daily_rate) : null,
        monthly_salary: formData.monthly_salary ? Number.parseFloat(formData.monthly_salary) : null,
        status: formData.status,
        notes: formData.notes || null,
        contact_person: formData.contact_person || null,
        contact_phone: formData.contact_phone || null,
        site_address: formData.site_address || null,
        special_requirements: formData.special_requirements || null,
      }

      if (deployment?.id) {
        // Update existing deployment
        const { error } = await supabase.from("deployments").update(submitData).eq("id", deployment.id)

        if (error) throw error
        toast.success("Deployment updated", {
          description: `Deployment for ${selectedEmployee?.first_name} ${selectedEmployee?.last_name} updated successfully`
        })
      } else {
        // Create new deployment
        const { error } = await supabase.from("deployments").insert([submitData])

        if (error) throw error
        toast.success("Deployment created", {
          description: `New deployment for ${selectedEmployee?.first_name} ${selectedEmployee?.last_name} created successfully`
        })
      }

      router.push("/deployments")
      router.refresh()
    } catch (error: any) {
      console.error("Error saving deployment:", error)
      setError(error.message || "Failed to save deployment")
      toast.error("Save failed", {
        description: error.message || "Failed to save deployment"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to update form data
  const updateFormData = (field: keyof DeploymentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Step progress
  const steps = [
    { key: 'basic', title: 'Basic Info', icon: User },
    { key: 'location', title: 'Location & Schedule', icon: MapPin },
    { key: 'compensation', title: 'Compensation', icon: DollarSign },
    { key: 'additional', title: 'Additional Details', icon: FileText }
  ]
  
  const currentStepIndex = steps.findIndex(step => step.key === currentStep)

  // Error display component
  const ErrorMessage = ({ error }: { error: string }) => (
    <div className="flex items-center gap-2 text-sm text-red-600">
      <AlertCircle className="h-4 w-4" />
      {error}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const StepIcon = step.icon
          const isActive = step.key === currentStep
          const isCompleted = index < currentStepIndex
          
          return (
            <div key={step.key} className="flex items-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-[#a2141e] text-white' : 
                isCompleted ? 'bg-green-100 text-green-800' : 
                'bg-gray-100 text-gray-600'
              }`}>
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <StepIcon className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-px mx-2 ${
                  index < currentStepIndex ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">Error</span>
          </div>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Basic Information */}
        {currentStep === 'basic' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="employee_id">
                    Employee <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.employee_id}
                    onValueChange={(value) => updateFormData('employee_id', value)}
                  >
                    <SelectTrigger className={validationErrors.employee_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.employee_id} - {emp.first_name} {emp.last_name} ({emp.job_title})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.employee_id && <ErrorMessage error={validationErrors.employee_id} />}
                  
                  {selectedEmployee && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
                          {selectedEmployee.first_name[0]}{selectedEmployee.last_name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-blue-900">
                            {selectedEmployee.first_name} {selectedEmployee.last_name}
                          </p>
                          <p className="text-sm text-blue-600">{selectedEmployee.job_title}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => updateFormData('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_name">
                    Client Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={(e) => updateFormData('client_name', e.target.value)}
                    placeholder="e.g., GSS"
                    className={validationErrors.client_name ? 'border-red-500' : ''}
                  />
                  {validationErrors.client_name && <ErrorMessage error={validationErrors.client_name} />}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deployment_type">
                    Deployment Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.deployment_type}
                    onValueChange={(value) => updateFormData('deployment_type', value)}
                  >
                    <SelectTrigger className={validationErrors.deployment_type ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="permanent">Permanent</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.deployment_type && <ErrorMessage error={validationErrors.deployment_type} />}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => updateFormData('contact_person', e.target.value)}
                    placeholder="Site manager or contact person"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => updateFormData('contact_phone', e.target.value)}
                    placeholder="+263 77 123 4567"
                    className={validationErrors.contact_phone ? 'border-red-500' : ''}
                  />
                  {validationErrors.contact_phone && <ErrorMessage error={validationErrors.contact_phone} />}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Location & Schedule */}
        {currentStep === 'location' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location & Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="site_location">
                    Site Location <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="site_location"
                    value={formData.site_location}
                    onChange={(e) => updateFormData('site_location', e.target.value)}
                    placeholder="e.g., Harare CBD Office Complex"
                    className={validationErrors.site_location ? 'border-red-500' : ''}
                  />
                  {validationErrors.site_location && <ErrorMessage error={validationErrors.site_location} />}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shift_timing">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Shift Timing
                  </Label>
                  <Input
                    id="shift_timing"
                    value={formData.shift_timing}
                    onChange={(e) => updateFormData('shift_timing', e.target.value)}
                    placeholder="e.g., 08:00 - 17:00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_date">
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => updateFormData('start_date', e.target.value)}
                    className={validationErrors.start_date ? 'border-red-500' : ''}
                  />
                  {validationErrors.start_date && <ErrorMessage error={validationErrors.start_date} />}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => updateFormData('end_date', e.target.value)}
                    className={validationErrors.end_date ? 'border-red-500' : ''}
                  />
                  {validationErrors.end_date && <ErrorMessage error={validationErrors.end_date} />}
                  <p className="text-sm text-gray-500">Leave empty for ongoing deployments</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="site_address">Full Site Address</Label>
                  <Textarea
                    id="site_address"
                    value={formData.site_address}
                    onChange={(e) => updateFormData('site_address', e.target.value)}
                    placeholder="Complete address including street, suburb, city..."
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Compensation */}
        {currentStep === 'compensation' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Compensation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {validationErrors.compensation && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <ErrorMessage error={validationErrors.compensation} />
                </div>
              )}
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="monthly_salary">Monthly Salary (USD $)</Label>
                  <Input
                    id="monthly_salary"
                    type="number"
                    step="0.01"
                    value={formData.monthly_salary}
                    onChange={(e) => updateFormData('monthly_salary', e.target.value)}
                    placeholder="500.00"
                  />
                  <p className="text-sm text-gray-500">For permanent positions</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="daily_rate">Daily Rate (USD $)</Label>
                  <Input
                    id="daily_rate"
                    type="number"
                    step="0.01"
                    value={formData.daily_rate}
                    onChange={(e) => updateFormData('daily_rate', e.target.value)}
                    placeholder="25.00"
                  />
                  <p className="text-sm text-gray-500">For temporary/contract work</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Compensation Guidelines</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Specify either monthly salary OR daily rate, not both</li>
                  <li>• Monthly salary is typically for permanent positions</li>
                  <li>• Daily rate is for temporary or contract work</li>
                  <li>• All amounts are in USD</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Additional Details */}
        {currentStep === 'additional' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="special_requirements">Special Requirements</Label>
                  <Textarea
                    id="special_requirements"
                    value={formData.special_requirements}
                    onChange={(e) => updateFormData('special_requirements', e.target.value)}
                    placeholder="Any special skills, certifications, or equipment required..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => updateFormData('notes', e.target.value)}
                    placeholder="Any other relevant information about this deployment..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Summary Card */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Deployment Summary</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employee:</span>
                    <span className="font-medium">
                      {selectedEmployee ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}` : 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Client:</span>
                    <span className="font-medium">{formData.client_name || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{formData.site_location || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <Badge variant="outline">{formData.deployment_type}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium">{formData.start_date || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Compensation:</span>
                    <span className="font-medium">
                      {formData.monthly_salary ? `USD $${formData.monthly_salary}/month` : 
                       formData.daily_rate ? `USD $${formData.daily_rate}/day` : 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStepIndex === 0}
          >
            Previous
          </Button>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            
            {currentStepIndex === steps.length - 1 ? (
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="bg-[#a2141e] hover:bg-[#8a1119]"
              >
                {isLoading ? "Saving..." : deployment ? "Update Deployment" : "Create Deployment"}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-[#a2141e] hover:bg-[#8a1119]"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
