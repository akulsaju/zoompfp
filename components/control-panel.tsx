'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Play, Square, Zap, Clock, Image } from 'lucide-react'

interface ControlPanelProps {
  isEnabled: boolean
  canEnable: boolean
  isSaving: boolean
  onToggle: () => void
  onTrigger: () => void
  currentIndex: number
  totalImages: number
  interval: number
  lastRotation: string | null
}

export function ControlPanel({
  isEnabled,
  canEnable,
  isSaving,
  onToggle,
  onTrigger,
  currentIndex,
  totalImages,
  interval,
  lastRotation,
}: ControlPanelProps) {
  const formatLastRotation = (iso: string | null) => {
    if (!iso) return 'Never'
    const date = new Date(iso)
    return date.toLocaleString()
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Rotation Control</CardTitle>
        <CardDescription>
          {isEnabled
            ? 'Rotation is active via cron job'
            : 'Enable to start automatic rotation'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div
            className={`h-3 w-3 rounded-full ${
              isEnabled ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'
            }`}
          />
          <span className="text-sm font-medium">
            {isEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Interval: Every {interval} minutes</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Image className="h-4 w-4" />
            <span>
              Position: {totalImages > 0 ? `${currentIndex + 1} of ${totalImages}` : 'N/A'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Zap className="h-4 w-4" />
            <span>Last: {formatLastRotation(lastRotation)}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={onToggle}
            disabled={!canEnable || isSaving}
            variant={isEnabled ? 'destructive' : 'default'}
            className="flex-1"
          >
            {isSaving ? (
              <Spinner className="h-4 w-4 mr-2" />
            ) : isEnabled ? (
              <Square className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isEnabled ? 'Disable' : 'Enable'}
          </Button>
          <Button
            onClick={onTrigger}
            disabled={!isEnabled || isSaving}
            variant="outline"
            title="Trigger rotation now"
          >
            <Zap className="h-4 w-4" />
            <span className="sr-only">Trigger now</span>
          </Button>
        </div>

        {!canEnable && (
          <p className="text-xs text-muted-foreground">
            Configure token and GitHub repo to enable.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
