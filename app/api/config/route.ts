import { NextResponse } from 'next/server'
import { getConfig, updateConfig, addLog, type RotatorConfig } from '@/lib/redis'
import { createSchedule, deleteSchedule, intervalToCron } from '@/lib/qstash'

export async function GET() {
  try {
    const config = await getConfig()
    
    // Return config without exposing full secrets
    if (config) {
      return NextResponse.json({
        ...config,
        zoomToken: config.zoomToken ? '••••••••' + config.zoomToken.slice(-4) : '',
        qstashToken: '',
        qstashSigningKey: '',
        qstashNextSigningKey: '',
        hasToken: !!config.zoomToken,
        hasQStash: !!(config.qstashToken && config.qstashSigningKey),
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
      qstashToken: '',
      qstashSigningKey: '',
      qstashNextSigningKey: '',
      hasToken: false,
      hasQStash: false,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch config' },
      { status: 500 }
    )
  }
}

const SCHEDULE_ID = 'zoom-pfp-rotator'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const currentConfig = await getConfig()
    
    const updates: Partial<RotatorConfig> = {}
    
    if (body.zoomToken !== undefined && body.zoomToken !== '••••••••' && body.zoomToken !== '') {
      updates.zoomToken = body.zoomToken
    }
    if (body.githubRepo !== undefined) updates.githubRepo = body.githubRepo
    if (body.githubFolder !== undefined) updates.githubFolder = body.githubFolder
    if (body.githubBranch !== undefined) updates.githubBranch = body.githubBranch
    if (body.intervalMinutes !== undefined) updates.intervalMinutes = body.intervalMinutes
    if (body.enabled !== undefined) updates.enabled = body.enabled
    if (body.currentIndex !== undefined) updates.currentIndex = body.currentIndex
    // QStash credentials
    if (body.qstashToken !== undefined && body.qstashToken !== '') {
      updates.qstashToken = body.qstashToken
    }
    if (body.qstashSigningKey !== undefined && body.qstashSigningKey !== '') {
      updates.qstashSigningKey = body.qstashSigningKey
    }
    if (body.qstashNextSigningKey !== undefined && body.qstashNextSigningKey !== '') {
      updates.qstashNextSigningKey = body.qstashNextSigningKey
    }
    
    // Handle QStash schedule when enabling/disabling
    const isEnabling = body.enabled === true && !currentConfig?.enabled
    const isDisabling = body.enabled === false && currentConfig?.enabled
    const intervalChanged = body.intervalMinutes !== undefined && 
      body.intervalMinutes !== currentConfig?.intervalMinutes &&
      currentConfig?.enabled

    // Get QStash token (from update or existing config)
    const qstashToken = updates.qstashToken || currentConfig?.qstashToken || ''

    if (isEnabling || intervalChanged) {
      if (!qstashToken) {
        return NextResponse.json(
          { error: 'QStash token is required to enable scheduling' },
          { status: 400 }
        )
      }

      // Create or update schedule
      const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL 
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000'
      
      const interval = body.intervalMinutes ?? currentConfig?.intervalMinutes ?? 5
      const cron = intervalToCron(interval)
      
      try {
        await createSchedule(
          qstashToken,
          SCHEDULE_ID,
          `${baseUrl}/api/cron/rotate`,
          cron
        )
        await addLog({
          message: `Schedule created: ${cron} (every ${interval} min)`,
          type: 'info',
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create schedule'
        await addLog({
          message: `QStash error: ${errorMessage}`,
          type: 'error',
        })
        return NextResponse.json(
          { error: `Failed to create schedule: ${errorMessage}` },
          { status: 500 }
        )
      }
    }

    if (isDisabling && qstashToken) {
      // Delete schedule
      try {
        await deleteSchedule(qstashToken, SCHEDULE_ID)
        await addLog({
          message: 'Schedule deleted',
          type: 'info',
        })
      } catch {
        // Non-fatal, schedule might not exist
      }
    }
    
    const config = await updateConfig(updates)
    
    return NextResponse.json({
      ...config,
      zoomToken: config.zoomToken ? '••••••••' + config.zoomToken.slice(-4) : '',
      qstashToken: '',
      qstashSigningKey: '',
      qstashNextSigningKey: '',
      hasToken: !!config.zoomToken,
      hasQStash: !!(config.qstashToken && config.qstashSigningKey),
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update config' },
      { status: 500 }
    )
  }
}
