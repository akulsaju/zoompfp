import { Client } from '@upstash/qstash'

export function getQStash(token: string): Client {
  if (!token) {
    throw new Error('QStash token is not configured')
  }
  return new Client({ token })
}

export async function createSchedule(
  token: string,
  scheduleId: string,
  destination: string,
  cronExpression: string
): Promise<string> {
  const qstash = getQStash(token)
  
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

export async function deleteSchedule(token: string, scheduleId: string): Promise<void> {
  const qstash = getQStash(token)
  
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
