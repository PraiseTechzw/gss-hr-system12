import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthService } from '@/lib/auth'

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

    // Convert array to object for easier frontend consumption
    const settingsObject = settings?.reduce((acc, setting) => {
      acc[setting.setting_key] = {
        value: setting.setting_value,
        description: setting.description,
        id: setting.id
      }
      return acc
    }, {} as Record<string, any>) || {}

    return NextResponse.json({
      success: true,
      data: settingsObject
    })

  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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
    const { settings } = body

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ 
        error: 'Invalid settings data' 
      }, { status: 400 })
    }

    const supabase = await createClient()

    // Update settings
    const updates = Object.entries(settings).map(([key, value]) => ({
      setting_key: key,
      setting_value: value,
      updated_by: authResult.user.id
    }))

    const { error: updateError } = await supabase
      .from('system_settings')
      .upsert(updates, { 
        onConflict: 'setting_key',
        ignoreDuplicates: false 
      })

    if (updateError) {
      return NextResponse.json({ 
        error: 'Failed to update settings',
        details: updateError.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully'
    })

  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
