'use client'

import { useState } from 'react'
import { Eye, EyeOff, Key } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface ZoomConfigProps {
  accountId: string
  clientId: string
  clientSecret: string
  hasCredentials: boolean
  onAccountIdChange: (value: string) => void
  onClientIdChange: (value: string) => void
  onClientSecretChange: (value: string) => void
  disabled?: boolean
}

export function ZoomConfig({
  accountId,
  clientId,
  clientSecret,
  hasCredentials,
  onAccountIdChange,
  onClientIdChange,
  onClientSecretChange,
  disabled,
}: ZoomConfigProps) {
  const [showSecret, setShowSecret] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Key className="h-4 w-4 text-primary" />
          Zoom Credentials
        </CardTitle>
        <CardDescription>
          {hasCredentials
            ? 'Server-to-Server OAuth credentials configured'
            : 'Enter your Zoom Server-to-Server OAuth app credentials'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="accountId">Account ID</Label>
          <Input
            id="accountId"
            value={accountId}
            onChange={(e) => onAccountIdChange(e.target.value)}
            placeholder="a0Z6KtEhS7GJVZ8FKxhFAg"
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientId">Client ID</Label>
          <Input
            id="clientId"
            value={clientId}
            onChange={(e) => onClientIdChange(e.target.value)}
            placeholder="CzzJdvIORReIgttL0Q2uyw"
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientSecret">Client Secret</Label>
          <div className="relative">
            <Input
              id="clientSecret"
              type={showSecret ? 'text' : 'password'}
              value={clientSecret}
              onChange={(e) => onClientSecretChange(e.target.value)}
              placeholder={hasCredentials ? '••••••••••••' : 'Enter client secret'}
              className="pr-10"
              disabled={disabled}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowSecret(!showSecret)}
              disabled={disabled}
            >
              {showSecret ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="sr-only">{showSecret ? 'Hide' : 'Show'} secret</span>
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Get these from your Zoom Server-to-Server OAuth app at marketplace.zoom.us
        </p>
      </CardContent>
    </Card>
  )
}
