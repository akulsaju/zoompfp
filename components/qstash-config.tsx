'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Clock, Eye, EyeOff, ExternalLink } from 'lucide-react'

interface QStashConfigProps {
  qstashToken: string
  qstashSigningKey: string
  qstashNextSigningKey: string
  hasQStash: boolean
  onTokenChange: (token: string) => void
  onSigningKeyChange: (key: string) => void
  onNextSigningKeyChange: (key: string) => void
  disabled?: boolean
}

export function QStashConfig({
  qstashToken,
  qstashSigningKey,
  qstashNextSigningKey,
  hasQStash,
  onTokenChange,
  onSigningKeyChange,
  onNextSigningKeyChange,
  disabled,
}: QStashConfigProps) {
  const [showToken, setShowToken] = useState(false)
  const [showSigningKey, setShowSigningKey] = useState(false)
  const [showNextKey, setShowNextKey] = useState(false)

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg text-card-foreground">QStash Scheduler</CardTitle>
        </div>
        <CardDescription>
          {hasQStash
            ? 'QStash configured for server-side scheduling'
            : 'Enter QStash credentials to enable persistent rotation'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="qstash-token" className="text-foreground">QStash Token</Label>
          <div className="relative">
            <Input
              id="qstash-token"
              type={showToken ? 'text' : 'password'}
              value={qstashToken}
              onChange={(e) => onTokenChange(e.target.value)}
              placeholder={hasQStash ? '••••••••' : 'Enter QStash token'}
              disabled={disabled}
              className="pr-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
              onClick={() => setShowToken(!showToken)}
            >
              {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="qstash-signing" className="text-foreground">Current Signing Key</Label>
          <div className="relative">
            <Input
              id="qstash-signing"
              type={showSigningKey ? 'text' : 'password'}
              value={qstashSigningKey}
              onChange={(e) => onSigningKeyChange(e.target.value)}
              placeholder={hasQStash ? '••••••••' : 'QSTASH_CURRENT_SIGNING_KEY'}
              disabled={disabled}
              className="pr-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
              onClick={() => setShowSigningKey(!showSigningKey)}
            >
              {showSigningKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="qstash-next" className="text-foreground">Next Signing Key</Label>
          <div className="relative">
            <Input
              id="qstash-next"
              type={showNextKey ? 'text' : 'password'}
              value={qstashNextSigningKey}
              onChange={(e) => onNextSigningKeyChange(e.target.value)}
              placeholder={hasQStash ? '••••••••' : 'QSTASH_NEXT_SIGNING_KEY'}
              disabled={disabled}
              className="pr-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
              onClick={() => setShowNextKey(!showNextKey)}
            >
              {showNextKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="pt-2">
          <a
            href="https://console.upstash.com/qstash"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
          >
            Get credentials from Upstash Console
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
