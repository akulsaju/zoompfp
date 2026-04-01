'use client'

import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import { TokenInput } from '@/components/token-input'
import { GitHubConfig } from '@/components/github-config'
import { ImagePreview } from '@/components/image-preview'
import { IntervalSelector } from '@/components/interval-selector'
import { ControlPanel } from '@/components/control-panel'
import { LogsPanel } from '@/components/logs-panel'
import { Button } from '@/components/ui/button'
import { Camera, Save } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import type { GitHubFile } from '@/lib/github'
import type { LogEntry } from '@/lib/redis'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Config {
  zoomToken: string
  githubRepo: string
  githubFolder: string
  githubBranch: string
  intervalMinutes: number
  enabled: boolean
  currentIndex: number
  lastRotation: string | null
  hasToken: boolean
}

export default function Home() {
  // Form state (local)
  const [token, setToken] = useState('')
  const [repo, setRepo] = useState('')
  const [folder, setFolder] = useState('images')
  const [branch, setBranch] = useState('main')
  const [interval, setIntervalValue] = useState(5)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Fetch config from Redis
  const { data: config, mutate: mutateConfig } = useSWR<Config>('/api/config', fetcher, {
    refreshInterval: 30000,
  })

  // Fetch logs from Redis
  const { data: logs = [], mutate: mutateLogs, isLoading: logsLoading } = useSWR<LogEntry[]>(
    '/api/logs',
    fetcher,
    { refreshInterval: 10000 }
  )

  // Fetch images from GitHub
  const imageUrl = repo ? `/api/images?repo=${encodeURIComponent(repo)}&folder=${encodeURIComponent(folder)}&branch=${encodeURIComponent(branch)}` : null
  const { data: imagesData, error: imagesError, isLoading: imagesLoading, mutate: mutateImages } = useSWR<GitHubFile[] | { error: string }>(
    imageUrl,
    fetcher
  )

  const images: GitHubFile[] = Array.isArray(imagesData) ? imagesData : []
  const imagesErrorMessage = imagesData && 'error' in imagesData ? imagesData.error : imagesError?.message || null

  // Sync form with config when loaded
  useEffect(() => {
    if (config) {
      setRepo(config.githubRepo || '')
      setFolder(config.githubFolder || 'images')
      setBranch(config.githubBranch || 'main')
      setIntervalValue(config.intervalMinutes || 5)
    }
  }, [config])

  // Track changes
  useEffect(() => {
    if (!config) return
    const changed =
      token !== '' ||
      repo !== (config.githubRepo || '') ||
      folder !== (config.githubFolder || 'images') ||
      branch !== (config.githubBranch || 'main') ||
      interval !== (config.intervalMinutes || 5)
    setHasChanges(changed)
  }, [token, repo, folder, branch, interval, config])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      const body: Record<string, unknown> = {
        githubRepo: repo,
        githubFolder: folder,
        githubBranch: branch,
        intervalMinutes: interval,
      }
      if (token) {
        body.zoomToken = token
      }

      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        setToken('')
        setHasChanges(false)
        mutateConfig()
        mutateImages()
      }
    } finally {
      setIsSaving(false)
    }
  }, [token, repo, folder, branch, interval, mutateConfig, mutateImages])

  const handleToggle = useCallback(async () => {
    if (!config) return
    setIsSaving(true)
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !config.enabled }),
      })
      mutateConfig()
    } finally {
      setIsSaving(false)
    }
  }, [config, mutateConfig])

  const handleTrigger = useCallback(async () => {
    setIsSaving(true)
    try {
      await fetch('/api/trigger', { method: 'POST' })
      mutateConfig()
      mutateLogs()
    } finally {
      setIsSaving(false)
    }
  }, [mutateConfig, mutateLogs])

  const handleClearLogs = useCallback(async () => {
    await fetch('/api/logs', { method: 'DELETE' })
    mutateLogs()
  }, [mutateLogs])

  const canEnable = !!(config?.hasToken || token) && repo.length > 0 && images.length > 0

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Camera className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Zoom PFP Rotator</h1>
                <p className="text-sm text-muted-foreground">Server-side rotation via cron</p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? (
                <Spinner className="h-4 w-4 mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TokenInput
              token={token}
              hasToken={config?.hasToken || false}
              onTokenChange={setToken}
              disabled={config?.enabled}
            />
            <GitHubConfig
              repo={repo}
              folder={folder}
              branch={branch}
              onRepoChange={setRepo}
              onFolderChange={setFolder}
              onBranchChange={setBranch}
              disabled={config?.enabled}
            />
            <ImagePreview
              images={images}
              loading={imagesLoading}
              error={imagesErrorMessage}
              currentIndex={config?.currentIndex || 0}
              onRefresh={() => mutateImages()}
            />
            <LogsPanel
              logs={logs}
              loading={logsLoading}
              onRefresh={() => mutateLogs()}
              onClearLogs={handleClearLogs}
            />
          </div>

          <div className="space-y-6">
            <IntervalSelector
              interval={interval}
              onIntervalChange={setIntervalValue}
              disabled={config?.enabled}
            />
            <ControlPanel
              isEnabled={config?.enabled || false}
              canEnable={canEnable}
              isSaving={isSaving}
              onToggle={handleToggle}
              onTrigger={handleTrigger}
              currentIndex={config?.currentIndex || 0}
              totalImages={images.length}
              interval={interval}
              lastRotation={config?.lastRotation || null}
            />

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-sm font-medium text-foreground mb-3">How it works</h3>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Add your Zoom OAuth token</li>
                <li>Point to a public GitHub repo folder</li>
                <li>Set your rotation interval</li>
                <li>Enable - runs via Vercel Cron</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                Settings persist in Redis. Rotation continues even when browser is closed.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
