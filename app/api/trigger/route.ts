import { NextResponse } from 'next/server'
import { getConfig } from '@/lib/redis'

// Manual trigger endpoint to test rotation from the UI
export async function POST(request: Request) {
  const host = request.headers.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  
  try {
    const config = await getConfig()
    if (!config?.webhookSecret) {
      return NextResponse.json({ error: 'No webhook secret configured' }, { status: 400 })
    }

    const response = await fetch(
      `${protocol}://${host}/api/cron/rotate?secret=${config.webhookSecret}`,
      { method: 'GET' }
    )
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to trigger rotation' },
      { status: 500 }
    )
  }
}
