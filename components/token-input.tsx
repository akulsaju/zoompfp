'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Key } from 'lucide-react'

interface TokenInputProps {
  token: string
  hasToken: boolean
  onTokenChange: (token: string) => void
  disabled?: boolean
}

export function TokenInput({ token, hasToken, onTokenChange, disabled }: TokenInputProps) {
  const [showToken, setShowToken] = useState(false)

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">Zoom Access Token</CardTitle>
        </div>
        <CardDescription>
          Your OAuth access token with user:write scope
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="relative">
            <Input
              type={showToken ? 'text' : 'password'}
              placeholder={hasToken ? 'Token saved - enter new to update' : 'Enter your Zoom access token'}
              value={token}
              onChange={(e) => onTokenChange(e.target.value)}
              className="pr-10 font-mono text-sm"
              disabled={disabled}
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
              <span className="sr-only">{showToken ? 'Hide' : 'Show'} token</span>
            </Button>
          </div>
          {hasToken && (
            <p className="text-xs text-primary flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Token saved
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
