'use client'

import { useState } from 'react'
import { Copy, Check, Link, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface WebhookInfoProps {
  webhookSecret: string
  isEnabled: boolean
}

export function WebhookInfo({ webhookSecret, isEnabled }: WebhookInfoProps) {
  const [copied, setCopied] = useState(false)
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const webhookUrl = `${baseUrl}/api/cron/rotate?secret=${webhookSecret}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(webhookUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!webhookSecret) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Link className="h-4 w-4 text-primary" />
          Webhook URL
        </CardTitle>
        <CardDescription>
          Use this URL with any free cron service to trigger rotation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Cron URL</Label>
          <div className="flex gap-2">
            <Input
              readOnly
              value={webhookUrl}
              className="font-mono text-xs"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="sr-only">Copy URL</span>
            </Button>
          </div>
        </div>
        
        <div className="rounded-lg bg-muted/50 p-3 space-y-2">
          <p className="text-sm font-medium">Setup Instructions:</p>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Go to <a href="https://cron-job.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">cron-job.org <ExternalLink className="h-3 w-3" /></a> (free)</li>
            <li>Create an account and add a new cron job</li>
            <li>Paste the webhook URL above</li>
            <li>Set your desired schedule (e.g., every 5 minutes)</li>
          </ol>
        </div>

        {isEnabled && (
          <div className="flex items-center gap-2 text-xs text-green-500">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Rotation is enabled and waiting for cron triggers
          </div>
        )}
      </CardContent>
    </Card>
  )
}
