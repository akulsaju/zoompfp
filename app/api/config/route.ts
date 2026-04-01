import { NextResponse } from 'next/server'
import { getConfig, updateConfig, addLog, type RotatorConfig } from '@/lib/redis'

export async function GET() {
  try {
    const config = await getConfig()
    
    if (config) {
      return NextResponse.json({
        ...config,
        // Hide secrets but show if they're set
        zoomClientSecret: '',
        hasZoomCredentials: !!(config.zoomAccountId && config.zoomClientId && config.zoomClientSecret),
      })
    }
    
    return NextResponse.json({
      zoomAccountId: '',
      zoomClientId: '',
      zoomClientSecret: '',
      githubRepo: '',
      githubFolder: 'images',
      githubBranch: 'main',
      intervalMinutes: 5,
      enabled: false,
      currentIndex: 0,
      lastRotation: null,
      webhookSecret: '',
      hasZoomCredentials: false,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const updates: Partial<RotatorConfig> = {}
    
    // Zoom credentials
    if (body.zoomAccountId !== undefined) updates.zoomAccountId = body.zoomAccountId
    if (body.zoomClientId !== undefined) updates.zoomClientId = body.zoomClientId
    if (body.zoomClientSecret !== undefined && body.zoomClientSecret !== '') {
      updates.zoomClientSecret = body.zoomClientSecret
    }
    
    // GitHub settings
    if (body.githubRepo !== undefined) updates.githubRepo = body.githubRepo
    if (body.githubFolder !== undefined) updates.githubFolder = body.githubFolder
    if (body.githubBranch !== undefined) updates.githubBranch = body.githubBranch
    
    // Rotation settings
    if (body.intervalMinutes !== undefined) updates.intervalMinutes = body.intervalMinutes
    if (body.enabled !== undefined) updates.enabled = body.enabled
    if (body.currentIndex !== undefined) updates.currentIndex = body.currentIndex
    
    // Log enable/disable
    const currentConfig = await getConfig()
    if (body.enabled === true && !currentConfig?.enabled) {
      await addLog({ message: 'Rotation enabled', type: 'info' })
    } else if (body.enabled === false && currentConfig?.enabled) {
      await addLog({ message: 'Rotation disabled', type: 'info' })
    }
    
    const config = await updateConfig(updates)
    
    return NextResponse.json({
      ...config,
      zoomClientSecret: '',
      hasZoomCredentials: !!(config.zoomAccountId && config.zoomClientId && config.zoomClientSecret),
    })
  } catch {
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 })
  }
}
