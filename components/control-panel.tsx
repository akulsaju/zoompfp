'use client'

import { Play, Square, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ControlPanelProps {
  isRunning: boolean
  canStart: boolean
  onStart: () => void
  onStop: () => void
  currentIndex: number
  totalImages: number
  interval: number
}

export function ControlPanel({
  isRunning,
  canStart,
  onStart,
  onStop,
  currentIndex,
  totalImages,
  interval,
}: ControlPanelProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <RotateCw className={`h-5 w-5 text-primary ${isRunning ? 'animate-spin' : ''}`} />
        <h2 className="text-lg font-semibold text-foreground">Automation Control</h2>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isRunning ? 'bg-primary animate-pulse' : 'bg-muted-foreground'
              }`}
            />
            <span className={`font-medium ${isRunning ? 'text-primary' : 'text-muted-foreground'}`}>
              {isRunning ? 'Running' : 'Stopped'}
            </span>
          </div>
        </div>

        {isRunning && totalImages > 0 && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Current Image</p>
            <p className="font-medium text-foreground mt-1">
              {currentIndex + 1} of {totalImages}
            </p>
          </div>
        )}
      </div>

      {isRunning && (
        <div className="mb-6 p-3 bg-secondary/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Next rotation in <span className="text-foreground font-medium">{interval} minutes</span>
          </p>
        </div>
      )}

      <div className="flex gap-3">
        {!isRunning ? (
          <Button
            onClick={onStart}
            disabled={!canStart}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Rotation
          </Button>
        ) : (
          <Button
            onClick={onStop}
            variant="destructive"
            className="flex-1"
          >
            <Square className="h-4 w-4 mr-2" />
            Stop Rotation
          </Button>
        )}
      </div>

      {!canStart && !isRunning && (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Add a token and at least one image to start
        </p>
      )}
    </div>
  )
}
