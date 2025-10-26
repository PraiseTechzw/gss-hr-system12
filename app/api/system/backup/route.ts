import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated and has admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userProfile || userProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get all system data for backup
    const [
      { data: departments },
      { data: employees },
      { data: attendance },
      { data: leaveRequests },
      { data: payroll },
      { data: deployments },
      { data: userProfiles },
      { data: systemSettings },
      { data: systemActivity }
    ] = await Promise.all([
      supabase.from('departments').select('*'),
      supabase.from('employees').select('*'),
      supabase.from('attendance').select('*'),
      supabase.from('leave_requests').select('*'),
      supabase.from('payroll').select('*'),
      supabase.from('deployments').select('*'),
      supabase.from('user_profiles').select('*'),
      supabase.from('system_settings_new').select('*'),
      supabase.from('system_activity').select('*').order('created_at', { ascending: false }).limit(1000)
    ])

    // Create backup data structure
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '2.0',
      data: {
        departments: departments || [],
        employees: employees || [],
        attendance: attendance || [],
        leaveRequests: leaveRequests || [],
        payroll: payroll || [],
        deployments: deployments || [],
        userProfiles: userProfiles || [],
        systemSettings: systemSettings || [],
        systemActivity: systemActivity || []
      },
      metadata: {
        totalRecords: (departments?.length || 0) + 
                     (employees?.length || 0) + 
                     (attendance?.length || 0) + 
                     (leaveRequests?.length || 0) + 
                     (payroll?.length || 0) + 
                     (deployments?.length || 0) + 
                     (userProfiles?.length || 0) + 
                     (systemSettings?.length || 0) + 
                     (systemActivity?.length || 0),
        backupType: 'full_system_backup'
      }
    }

    // Log the backup action
    await supabase.from('system_activity').insert({
      user_id: user.id,
      action: 'system_backup',
      description: 'System backup initiated',
      details: {
        backup_timestamp: backupData.timestamp,
        total_records: backupData.metadata.totalRecords,
        backup_type: backupData.metadata.backupType
      }
    })

    // Return backup data (in a real system, you might save this to a file or cloud storage)
    return NextResponse.json({
      success: true,
      message: 'System backup completed successfully',
      backup: backupData,
      downloadUrl: `/api/system/backup/download?timestamp=${encodeURIComponent(backupData.timestamp)}`
    })

  } catch (error) {
    console.error('Backup error:', error)
    return NextResponse.json(
      { error: 'Failed to create system backup' },
      { status: 500 }
    )
  }
}
