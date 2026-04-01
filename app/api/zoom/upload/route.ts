import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const token = formData.get('token') as string
    const image = formData.get('image') as File

    if (!token) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      )
    }

    if (!image) {
      return NextResponse.json(
        { error: 'Image file is required' },
        { status: 400 }
      )
    }

    // Validate image size (max 2MB)
    if (image.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image must be less than 2MB' },
        { status: 400 }
      )
    }

    // Validate image type
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(image.type)) {
      return NextResponse.json(
        { error: 'Image must be PNG, JPG, or JPEG format' },
        { status: 400 }
      )
    }

    // Create form data for Zoom API
    const zoomFormData = new FormData()
    zoomFormData.append('pic_file', image, image.name)

    // Upload to Zoom API
    const response = await fetch('https://api.zoom.us/v2/users/me/picture', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: zoomFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = 'Failed to upload to Zoom'
      
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.message || errorMessage
      } catch {
        // Use default error message
      }

      // Handle specific Zoom API errors
      if (response.status === 401) {
        errorMessage = 'Invalid or expired access token'
      } else if (response.status === 403) {
        errorMessage = 'Access forbidden - check token permissions'
      } else if (response.status === 429) {
        errorMessage = 'Rate limited - please wait before trying again'
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Profile picture updated successfully',
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
