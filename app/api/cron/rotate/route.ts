import { NextResponse } from 'next/server'
import { getConfig, updateConfig, addLog } from '@/lib/redis'
import { getImagesFromGitHub, downloadImage } from '@/lib/github'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// This endpoint is called by Vercel Cron
export async function GET(request: Request) {
  // Verify cron secret in production
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const config = await getConfig()

    if (!config || !config.enabled) {
      return NextResponse.json({ message: 'Rotator is disabled' })
    }

    if (!config.zoomToken || !config.githubRepo || !config.githubFolder) {
      await addLog({
        message: 'Missing configuration (token, repo, or folder)',
        type: 'error',
      })
      return NextResponse.json({ error: 'Missing configuration' }, { status: 400 })
    }

    // Check if enough time has passed since last rotation
    if (config.lastRotation) {
      const lastRotation = new Date(config.lastRotation)
      const now = new Date()
      const minutesSinceLastRotation = (now.getTime() - lastRotation.getTime()) / 1000 / 60
      
      if (minutesSinceLastRotation < config.intervalMinutes) {
        return NextResponse.json({ 
          message: 'Not enough time has passed',
          minutesSinceLastRotation,
          intervalMinutes: config.intervalMinutes,
        })
      }
    }

    // Fetch images from GitHub
    const images = await getImagesFromGitHub(
      config.githubRepo,
      config.githubFolder,
      config.githubBranch
    )

    if (images.length === 0) {
      await addLog({
        message: 'No images found in GitHub folder',
        type: 'error',
      })
      return NextResponse.json({ error: 'No images found' }, { status: 400 })
    }

    // Calculate next index
    const nextIndex = (config.currentIndex + 1) % images.length
    const image = images[nextIndex]

    // Download the image
    const imageBuffer = await downloadImage(image.download_url)

    // Upload to Zoom
    const formData = new FormData()
    const blob = new Blob([imageBuffer], { type: 'image/png' })
    formData.append('pic_file', blob, image.name)

    const zoomResponse = await fetch('https://api.zoom.us/v2/users/me/picture', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.zoomToken}`,
      },
      body: formData,
    })

    if (!zoomResponse.ok) {
      const errorText = await zoomResponse.text()
      let errorMessage = `Zoom API error: ${zoomResponse.status}`
      
      if (zoomResponse.status === 401) {
        errorMessage = 'Zoom token expired or invalid'
      } else if (zoomResponse.status === 429) {
        errorMessage = 'Rate limited by Zoom API'
      }

      await addLog({
        message: errorMessage,
        type: 'error',
        imageName: image.name,
      })

      return NextResponse.json({ error: errorMessage, details: errorText }, { status: zoomResponse.status })
    }

    // Update config with new index and timestamp
    await updateConfig({
      currentIndex: nextIndex,
      lastRotation: new Date().toISOString(),
    })

    await addLog({
      message: `Profile picture updated to ${image.name}`,
      type: 'success',
      imageName: image.name,
    })

    return NextResponse.json({
      success: true,
      image: image.name,
      index: nextIndex,
      totalImages: images.length,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    await addLog({
      message: errorMessage,
      type: 'error',
    })

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
