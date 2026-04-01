'use client'

import { ScrollText, CheckCircle, XCircle, Info, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { LogEntry } from '@/lib/types'

interface LogsPanelProps {
  logs: LogEntry[]
  onClearLogs: () => void
}

export function LogsPanel({ logs, onClearLogs }: LogsPanelProps) {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date)
  }

  const getIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
      default:
        return <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Activity Logs</h2>
          {logs.length > 0 && (
            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
              {logs.length}
            </span>
          )}
        </div>
        {logs.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearLogs}
            className="text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="bg-secondary/30 rounded-lg border border-border overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-8 text-center">
            <ScrollText className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No activity yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Logs will appear here when rotation starts
            </p>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors"
              >
                {getIcon(log.type)}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${
                    log.type === 'error' ? 'text-destructive' : 'text-foreground'
                  }`}>
                    {log.message}
                  </p>
                  {log.imageName && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      Image: {log.imageName}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground font-mono flex-shrink-0">
                  {formatTime(log.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
