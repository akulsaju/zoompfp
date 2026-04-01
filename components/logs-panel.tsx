'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Terminal, Trash2, RefreshCw, CheckCircle, XCircle, Info } from 'lucide-react'
import type { LogEntry } from '@/lib/redis'

interface LogsPanelProps {
  logs: LogEntry[]
  loading: boolean
  onRefresh: () => void
  onClearLogs: () => void
}

export function LogsPanel({ logs, loading, onRefresh, onClearLogs }: LogsPanelProps) {
  const getIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
    }
  }

  const formatTime = (iso: string) => {
    const date = new Date(iso)
    return date.toLocaleTimeString()
  }

  const formatDate = (iso: string) => {
    const date = new Date(iso)
    return date.toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Activity Logs</CardTitle>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="sr-only">Refresh logs</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearLogs}
              disabled={logs.length === 0}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Clear logs</span>
            </Button>
          </div>
        </div>
        <CardDescription>
          Stored in Redis - persists across sessions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          {logs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No activity yet
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-2 text-sm p-2 rounded-md bg-secondary/50"
                >
                  {getIcon(log.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground break-words">{log.message}</p>
                    {log.imageName && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Image: {log.imageName}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground text-right flex-shrink-0">
                    <div>{formatTime(log.timestamp)}</div>
                    <div>{formatDate(log.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
