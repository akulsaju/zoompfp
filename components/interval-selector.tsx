'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Timer } from 'lucide-react'

interface IntervalSelectorProps {
  interval: number
  onIntervalChange: (interval: number) => void
  disabled?: boolean
}

const presets = [
  { label: '5m', value: 5 },
  { label: '10m', value: 10 },
  { label: '15m', value: 15 },
  { label: '30m', value: 30 },
  { label: '1h', value: 60 },
]

export function IntervalSelector({ interval, onIntervalChange, disabled }: IntervalSelectorProps) {
  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value) && value >= 5) {
      onIntervalChange(value)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">Rotation Interval</CardTitle>
        </div>
        <CardDescription>How often to rotate</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.value}
              variant={interval === preset.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onIntervalChange(preset.value)}
              disabled={disabled}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <div className="space-y-2">
          <Label htmlFor="custom-interval" className="text-xs text-muted-foreground">
            Custom (minutes)
          </Label>
          <Input
            id="custom-interval"
            type="number"
            min={5}
            value={interval}
            onChange={handleCustomChange}
            disabled={disabled}
            className="w-24"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Cron checks every 5 min. Your interval controls actual rotation timing.
        </p>
      </CardContent>
    </Card>
  )
}
