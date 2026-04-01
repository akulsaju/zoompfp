'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { TokenInput } from '@/components/token-input'
import { ImageUploader } from '@/components/image-uploader'
import { IntervalSelector } from '@/components/interval-selector'
import { ControlPanel } from '@/components/control-panel'
import { LogsPanel } from '@/components/logs-panel'
import type { UploadedImage, LogEntry } from '@/lib/types'
import { Camera } from 'lucide-react'

export default function Home() {
  const [token, setToken] = useState('')
  const [images, setImages] = useState<UploadedImage[]>([])
  const [interval, setInterval] = useState(5)
  const [isRunning, setIsRunning] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [logs, setLogs] = useState<LogEntry[]>([])

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const imagesRef = useRef<UploadedImage[]>([])
  const currentIndexRef = useRef(0)
  const tokenRef = useRef('')

  // Keep refs in sync with state
  useEffect(() => {
    imagesRef.current = images
  }, [images])

  useEffect(() => {
    currentIndexRef.current = currentIndex
  }, [currentIndex])

  useEffect(() => {
    tokenRef.current = token
  }, [token])

  const addLog = useCallback((message: string, type: LogEntry['type'], imageName?: string) => {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      message,
      type,
      imageName,
    }
    setLogs((prev) => [entry, ...prev])
  }, [])

  const uploadImage = useCallback(async (image: UploadedImage): Promise<boolean> => {
    if (!image.file) {
      // Convert dataUrl back to file
      const response = await fetch(image.dataUrl)
      const blob = await response.blob()
      image.file = new File([blob], image.name, { type: blob.type })
    }

    const formData = new FormData()
    formData.append('token', tokenRef.current)
    formData.append('image', image.file)

    try {
      const response = await fetch('/api/zoom/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      return true
    } catch (error) {
      throw error
    }
  }, [])

  const rotateImage = useCallback(async () => {
    const currentImages = imagesRef.current
    if (currentImages.length === 0) return

    const nextIndex = (currentIndexRef.current + 1) % currentImages.length
    const image = currentImages[nextIndex]

    try {
      await uploadImage(image)
      addLog(`Profile picture updated to ${image.name}`, 'success', image.name)
      setCurrentIndex(nextIndex)
    } catch (error) {
      addLog(
        error instanceof Error ? error.message : 'Failed to update profile picture',
        'error',
        image.name
      )
    }
  }, [uploadImage, addLog])

  const handleStart = useCallback(async () => {
    if (!token || images.length === 0) return

    setIsRunning(true)
    addLog('Rotation started', 'info')

    // Upload first image immediately
    const firstImage = images[0]
    try {
      await uploadImage(firstImage)
      addLog(`Profile picture set to ${firstImage.name}`, 'success', firstImage.name)
      setCurrentIndex(0)
    } catch (error) {
      addLog(
        error instanceof Error ? error.message : 'Failed to set initial profile picture',
        'error',
        firstImage.name
      )
    }

    // Set up interval for subsequent rotations
    intervalRef.current = setInterval(rotateImage, interval * 60 * 1000)
  }, [token, images, interval, uploadImage, addLog, rotateImage])

  const handleStop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRunning(false)
    addLog('Rotation stopped', 'info')
  }, [addLog])

  const handleClearLogs = useCallback(() => {
    setLogs([])
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const canStart = token.length > 0 && images.length > 0

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Camera className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Zoom PFP Rotator</h1>
              <p className="text-sm text-muted-foreground">Automatically rotate your profile picture</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TokenInput token={token} onTokenChange={setToken} />
            <ImageUploader
              images={images}
              onImagesChange={setImages}
              currentIndex={currentIndex}
              isRunning={isRunning}
            />
            <LogsPanel logs={logs} onClearLogs={handleClearLogs} />
          </div>

          <div className="space-y-6">
            <IntervalSelector
              interval={interval}
              onIntervalChange={setInterval}
              disabled={isRunning}
            />
            <ControlPanel
              isRunning={isRunning}
              canStart={canStart}
              onStart={handleStart}
              onStop={handleStop}
              currentIndex={currentIndex}
              totalImages={images.length}
              interval={interval}
            />

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="text-sm font-medium text-foreground mb-3">How to get your Zoom token</h3>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Go to the Zoom App Marketplace</li>
                <li>Create or use an existing OAuth app</li>
                <li>Add the <code className="text-primary bg-secondary px-1 rounded">user:write</code> scope</li>
                <li>Generate an access token</li>
                <li>Paste the token above</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
