import { NextResponse } from 'next/server'

// Manual trigger endpoint to test rotation
export async function POST(request: Request) {
  const host = request.headers.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  
  try {
    const response = await fetch(`${protocol}://${host}/api/cron/rotate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || ''}`,
      },
    })
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to trigger rotation' },
      { status: 500 }
    )
  }
}
