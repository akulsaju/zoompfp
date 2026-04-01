import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export interface RotatorConfig {
  zoomToken: string
  githubRepo: string // format: "owner/repo"
  githubFolder: string // e.g., "images/pfp"
  githubBranch: string // e.g., "main"
  intervalMinutes: number
  enabled: boolean
  currentIndex: number
  lastRotation: string | null
  // QStash credentials stored in Redis
  qstashToken: string
  qstashSigningKey: string
  qstashNextSigningKey: string
}

const CONFIG_KEY = 'zoom-pfp-rotator:config'
const LOGS_KEY = 'zoom-pfp-rotator:logs'

export async function getConfig(): Promise<RotatorConfig | null> {
  return await redis.get<RotatorConfig>(CONFIG_KEY)
}

export async function setConfig(config: RotatorConfig): Promise<void> {
  await redis.set(CONFIG_KEY, config)
}

export async function updateConfig(updates: Partial<RotatorConfig>): Promise<RotatorConfig> {
  const current = await getConfig()
  const newConfig: RotatorConfig = {
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
    ...current,
    ...updates,
  }
  await setConfig(newConfig)
  return newConfig
}

export interface LogEntry {
  id: string
  timestamp: string
  message: string
  type: 'success' | 'error' | 'info'
  imageName?: string
}

export async function getLogs(limit = 50): Promise<LogEntry[]> {
  const logs = await redis.lrange<LogEntry>(LOGS_KEY, 0, limit - 1)
  return logs || []
}

export async function addLog(entry: Omit<LogEntry, 'id' | 'timestamp'>): Promise<void> {
  const log: LogEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...entry,
  }
  await redis.lpush(LOGS_KEY, log)
  // Keep only last 100 logs
  await redis.ltrim(LOGS_KEY, 0, 99)
}

export async function clearLogs(): Promise<void> {
  await redis.del(LOGS_KEY)
}
