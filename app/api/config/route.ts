import { NextResponse } from 'next/server'
import { getConfig, updateConfig, type RotatorConfig } from '@/lib/redis'

export async function GET() {
  try {
    const config = await getConfig()
    
    // Return config without exposing full token
    if (config) {
      return NextResponse.json({
        ...config,
        zoomToken: config.zoomToken ? '••••••••' + config.zoomToken.slice(-4) : '',
        hasToken: !!config.zoomToken,
      })
    }
    
    return NextResponse.json({
      zoomToken: '',
      githubRepo: '',
      githubFolder: 'images',
      githubBranch: 'main',
      intervalMinutes: 5,
      enabled: false,
      currentIndex: 0,
      lastRotation: null,
      hasToken: false,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch config' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const updates: Partial<RotatorConfig> = {}
    
    if (body.zoomToken !== undefined && body.zoomToken !== '••••••••') {
      updates.zoomToken = body.zoomToken
    }
    if (body.githubRepo !== undefined) updates.githubRepo = body.githubRepo
    if (body.githubFolder !== undefined) updates.githubFolder = body.githubFolder
    if (body.githubBranch !== undefined) updates.githubBranch = body.githubBranch
    if (body.intervalMinutes !== undefined) updates.intervalMinutes = body.intervalMinutes
    if (body.enabled !== undefined) updates.enabled = body.enabled
    if (body.currentIndex !== undefined) updates.currentIndex = body.currentIndex
    
    const config = await updateConfig(updates)
    
    return NextResponse.json({
      ...config,
      zoomToken: config.zoomToken ? '••••••••' + config.zoomToken.slice(-4) : '',
      hasToken: !!config.zoomToken,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update config' },
      { status: 500 }
    )
  }
}
