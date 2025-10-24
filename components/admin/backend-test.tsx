'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Database, 
  Shield, 
  Users, 
  Building2, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface TestResult {
  name: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: string
}

export default function BackendTest() {
  const [tests, setTests] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    setTests([])

    try {
      // Run comprehensive backend test
      const response = await fetch('/api/test-backend')
      const data = await response.json()

      if (data.success) {
        // Convert test results to our format
        const testResults: TestResult[] = data.results.tests.map((test: any) => ({
          name: test.name,
          status: test.status === 'PASS' ? 'success' : test.status === 'WARN' ? 'warning' : 'error',
          message: test.message,
          details: test.details
        }))

        setTests(testResults)

        // Show summary toast
        const { summary } = data
        if (summary.healthPercentage >= 100) {
          toast.success('All backend tests passed!', {
            description: `${summary.passed}/${summary.total} tests completed successfully`
          })
        } else if (summary.healthPercentage >= 80) {
          toast.warning('Most backend tests passed', {
            description: `${summary.passed}/${summary.total} tests passed (${summary.healthPercentage}%)`
          })
        } else {
          toast.error('Backend tests failed', {
            description: `Only ${summary.passed}/${summary.total} tests passed (${summary.healthPercentage}%)`
          })
        }
      } else {
        toast.error('Backend test failed', {
          description: data.error || 'Unable to run backend tests'
        })
      }
    } catch (error) {
      console.error('Backend test error:', error)
      toast.error('Backend test failed', {
        description: 'Unable to run backend tests'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Pass</Badge>
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case 'error':
        return <Badge variant="destructive">Fail</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-blue-600" />
          <span>Backend Connection Test</span>
        </CardTitle>
        <CardDescription>
          Test all backend connections and API endpoints
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Run comprehensive tests to verify all backend connections are working properly.
          </p>
          <Button onClick={runTests} disabled={loading}>
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Running Tests...' : 'Run Tests'}
          </Button>
        </div>

        {tests.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Test Results</h4>
            {tests.map((test, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <p className="font-medium text-gray-900">{test.name}</p>
                      <p className="text-sm text-gray-600">{test.message}</p>
                      {test.details && (
                        <p className="text-xs text-gray-500 mt-1">{test.details}</p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(test.status)}
                </div>
              </div>
            ))}
          </div>
        )}

        {tests.length === 0 && !loading && (
          <div className="text-center py-8">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Click "Run Tests" to check backend connections</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
