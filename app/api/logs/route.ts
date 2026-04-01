import { NextResponse } from 'next/server'
import { getLogs, clearLogs } from '@/lib/redis'

export async function GET() {
  try {
    const logs = await getLogs()
    return NextResponse.json(logs)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    await clearLogs()
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to clear logs' },
      { status: 500 }
    )
  }
}
