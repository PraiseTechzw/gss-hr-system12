import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthService } from '@/lib/auth-service'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authToken = request.cookies.get('auth-token')?.value
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authResult = AuthService.verifyToken(authToken)
    if (!authResult.valid || !authResult.user || authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const supabase = await createClient()

    // Get all system settings
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('setting_key')

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to fetch settings',
        details: error.message 
      }, { status: 500 })
    }

    // Convert array to object
    const settingsObject: Record<string, any> = {}
    settings?.forEach(setting => {
      settingsObject[setting.setting_key] = setting.setting_value
    })

    return NextResponse.json({
      success: true,
      data: settingsObject
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authToken = request.cookies.get('auth-token')?.value
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authResult = AuthService.verifyToken(authToken)
    if (!authResult.valid || !authResult.user || authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const supabase = await createClient()

    // Update or insert settings
    const settingsToUpdate = Object.entries(body).map(([key, value]) => ({
      setting_key: key,
      setting_value: String(value),
      updated_by: authResult.user.id
    }))

    // Use upsert to update or insert
    const { error: updateError } = await supabase
      .from('system_settings')
      .upsert(settingsToUpdate, {
        onConflict: 'setting_key'
      })

    if (updateError) {
      return NextResponse.json({ 
        error: 'Failed to save settings',
        details: updateError.message 
      }, { status: 500 })
    }

    // Log the action
    await supabase
      .from('system_activity')
      .insert({
        user_id: authResult.user.id,
        action: 'update',
        description: 'System settings updated',
        details: {
          type: 'settings_updated',
          settings: Object.keys(body)
        }
      })

    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully'
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

