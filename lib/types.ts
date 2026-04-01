export interface UploadedImage {
  id: string
  name: string
  size: number
  dataUrl: string
  file?: File
}

export interface LogEntry {
  id: string
  timestamp: Date
  message: string
  type: 'success' | 'error' | 'info'
  imageName?: string
}

export interface RotatorState {
  isRunning: boolean
  currentIndex: number
  intervalMinutes: number
}
