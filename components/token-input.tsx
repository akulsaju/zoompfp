'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Key } from 'lucide-react'

interface TokenInputProps {
  token: string
  onTokenChange: (token: string) => void
}

export function TokenInput({ token, onTokenChange }: TokenInputProps) {
  const [showToken, setShowToken] = useState(false)

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Key className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Zoom Access Token</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Paste your Zoom OAuth access token to authenticate API requests.
      </p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type={showToken ? 'text' : 'password'}
            placeholder="Enter your Zoom access token..."
            value={token}
            onChange={(e) => onTokenChange(e.target.value)}
            className="pr-10 bg-secondary border-border font-mono text-sm"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => setShowToken(!showToken)}
          >
            {showToken ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>
      {token && (
        <p className="text-xs text-primary mt-2 flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Token configured
        </p>
      )}
    </div>
  )
}
