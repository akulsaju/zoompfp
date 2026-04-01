import { Client } from '@upstash/qstash'

let qstashClient: Client | null = null

export function getQStash(): Client {
  if (!qstashClient) {
    if (!process.env.QSTASH_TOKEN) {
      throw new Error('QSTASH_TOKEN is not set')
    }
    qstashClient = new Client({
      token: process.env.QSTASH_TOKEN,
    })
  }
  return qstashClient
}

export async function createSchedule(
  scheduleId: string,
  destination: string,
  cronExpression: string
): Promise<string> {
  const qstash = getQStash()
  
  // First try to delete any existing schedule with this ID
  try {
    await qstash.schedules.delete(scheduleId)
  } catch {
    // Schedule doesn't exist, that's fine
  }
  
  // Create new schedule
  const response = await qstash.schedules.create({
    scheduleId,
    destination,
    cron: cronExpression,
  })
  
  return response.scheduleId
}

export async function deleteSchedule(scheduleId: string): Promise<void> {
  const qstash = getQStash()
  
  try {
    await qstash.schedules.delete(scheduleId)
  } catch {
    // Schedule doesn't exist, that's fine
  }
}

export function intervalToCron(minutes: number): string {
  // Convert interval minutes to cron expression
  if (minutes < 60) {
    return `*/${minutes} * * * *`
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60)
    return `0 */${hours} * * *`
  } else {
    const days = Math.floor(minutes / 1440)
    return `0 0 */${days} * *`
  }
}
