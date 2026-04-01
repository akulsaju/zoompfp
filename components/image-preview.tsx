'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Images, RefreshCw, AlertCircle } from 'lucide-react'
import type { GitHubFile } from '@/lib/github'

interface ImagePreviewProps {
  images: GitHubFile[]
  loading: boolean
  error: string | null
  currentIndex: number
  onRefresh: () => void
}

export function ImagePreview({
  images,
  loading,
  error,
  currentIndex,
  onRefresh,
}: ImagePreviewProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Images className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Image Preview</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh images</span>
          </Button>
        </div>
        <CardDescription>
          {images.length > 0
            ? `${images.length} images found in repository`
            : 'Configure your GitHub repository to preview images'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-6 w-6" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-destructive text-sm py-4">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No images found. Add PNG, JPG, or GIF files to your GitHub folder.
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
            {images.map((image, index) => (
              <div
                key={image.path}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                  index === currentIndex
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-muted-foreground/50'
                }`}
              >
                <img
                  src={image.download_url}
                  alt={image.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                    <span className="text-[10px] font-medium bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                      CURRENT
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
