'use client'

import { Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface IntervalSelectorProps {
  interval: number
  onIntervalChange: (interval: number) => void
  disabled: boolean
}

const PRESETS = [5, 10, 15, 30, 60]

export function IntervalSelector({ interval, onIntervalChange, disabled }: IntervalSelectorProps) {
  const handleInputChange = (value: string) => {
    const num = parseInt(value, 10)
    if (!isNaN(num) && num >= 5) {
      onIntervalChange(num)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Rotation Interval</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Set how often the profile picture should change (minimum 5 minutes).
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => onIntervalChange(preset)}
            disabled={disabled}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              interval === preset
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {preset < 60 ? `${preset}m` : `${preset / 60}h`}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Custom:</span>
        <Input
          type="number"
          min={5}
          value={interval}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={disabled}
          className="w-24 bg-secondary border-border"
        />
        <span className="text-sm text-muted-foreground">minutes</span>
      </div>
    </div>
  )
}
