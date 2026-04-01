'use client'

import { useCallback, useRef } from 'react'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { UploadedImage } from '@/lib/types'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

interface ImageUploaderProps {
  images: UploadedImage[]
  onImagesChange: (images: UploadedImage[]) => void
  currentIndex: number
  isRunning: boolean
}

export function ImageUploader({ images, onImagesChange, currentIndex, isRunning }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return

    const newImages: UploadedImage[] = []
    const errors: string[] = []

    for (const file of Array.from(files)) {
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        errors.push(`${file.name}: Invalid format (PNG, JPG, JPEG only)`)
        continue
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File too large (max 2MB)`)
        continue
      }

      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })

      newImages.push({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        dataUrl,
        file,
      })
    }

    if (errors.length > 0) {
      console.error('Upload errors:', errors)
    }

    onImagesChange([...images, ...newImages])
  }, [images, onImagesChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const removeImage = useCallback((id: string) => {
    onImagesChange(images.filter((img) => img.id !== id))
  }, [images, onImagesChange])

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <ImageIcon className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Profile Images</h2>
        <span className="ml-auto text-sm text-muted-foreground">
          {images.length} image{images.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-secondary/50 transition-colors"
      >
        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-foreground font-medium">Drop images here or click to upload</p>
        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, JPEG (max 2MB each)</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                isRunning && index === currentIndex
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <img
                src={image.dataUrl}
                alt={image.name}
                className="w-full aspect-square object-cover"
              />
              {isRunning && index === currentIndex && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded">
                  Active
                </div>
              )}
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage(image.id)
                }}
                disabled={isRunning}
              >
                <X className="h-3 w-3" />
              </Button>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <p className="text-xs text-white truncate">{image.name}</p>
                <p className="text-xs text-white/60">{(image.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="flex items-center gap-2 mt-4 p-3 bg-secondary/50 rounded-lg">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Upload at least one image to start rotation</p>
        </div>
      )}
    </div>
  )
}
