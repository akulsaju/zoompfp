import { NextResponse } from 'next/server'
import { getConfig, updateConfig, addLog } from '@/lib/redis'
import { getImagesFromGitHub, downloadImage } from '@/lib/github'
import { getZoomAccessToken, uploadZoomProfilePicture } from '@/lib/zoom'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// This endpoint is called by external cron services (e.g., cron-job.org)
// Use: GET /api/cron/rotate?secret=YOUR_WEBHOOK_SECRET
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  
  const config = await getConfig()
  
  if (!config?.webhookSecret || secret !== config.webhookSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return handleRotation()
}

// Also support POST with secret in header
export async function POST(request: Request) {
  const secret = request.headers.get('x-webhook-secret')
  const config = await getConfig()
  
  if (!config?.webhookSecret || secret !== config.webhookSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return handleRotation()
}

async function handleRotation() {
  try {
    const config = await getConfig()

    if (!config) {
      return NextResponse.json({ error: 'Not configured' }, { status: 400 })
    }

    if (!config.enabled) {
      return NextResponse.json({ message: 'Rotation is disabled' })
    }

    // Check Zoom credentials
    if (!config.zoomAccountId || !config.zoomClientId || !config.zoomClientSecret) {
      await addLog({ message: 'Missing Zoom credentials', type: 'error' })
      return NextResponse.json({ error: 'Missing Zoom credentials' }, { status: 400 })
    }

    // Check GitHub repo
    if (!config.githubRepo) {
      await addLog({ message: 'GitHub repo not configured', type: 'error' })
      return NextResponse.json({ error: 'GitHub repo not configured' }, { status: 400 })
    }

    // Get images from GitHub
    const images = await getImagesFromGitHub(
      config.githubRepo,
      config.githubFolder,
      config.githubBranch
    )

    if (images.length === 0) {
      await addLog({ message: 'No images found in GitHub repo', type: 'error' })
      return NextResponse.json({ error: 'No images found' }, { status: 400 })
    }

    // Select next image
    const currentIndex = config.currentIndex % images.length
    const selectedImage = images[currentIndex]
    const nextIndex = (currentIndex + 1) % images.length

    // Download image from GitHub
    const imageData = await downloadImage(selectedImage.download_url)

    // Get Zoom access token using Server-to-Server OAuth
    const accessToken = await getZoomAccessToken(
      config.zoomAccountId,
      config.zoomClientId,
      config.zoomClientSecret
    )

    // Upload to Zoom
    await uploadZoomProfilePicture(
      accessToken,
      imageData.buffer,
      imageData.contentType
    )

    // Update config
    await updateConfig({
      currentIndex: nextIndex,
      lastRotation: new Date().toISOString(),
    })

    await addLog({
      message: `Profile picture updated to ${selectedImage.name}`,
      type: 'success',
      imageName: selectedImage.name,
    })

    return NextResponse.json({
      success: true,
      image: selectedImage.name,
      nextIndex,
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    await addLog({ message: `Rotation failed: ${errorMessage}`, type: 'error' })
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
