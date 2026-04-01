// Zoom Server-to-Server OAuth helper

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export async function getZoomAccessToken(
  accountId: string,
  clientId: string,
  clientSecret: string
): Promise<string> {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  
  const response = await fetch('https://zoom.us/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'account_credentials',
      account_id: accountId,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get Zoom access token: ${error}`)
  }

  const data: TokenResponse = await response.json()
  return data.access_token
}

export async function uploadZoomProfilePicture(
  accessToken: string,
  imageBuffer: Buffer,
  contentType: string
): Promise<void> {
  // Create form data with the image
  const formData = new FormData()
  const blob = new Blob([imageBuffer], { type: contentType })
  formData.append('pic_file', blob, `profile.${contentType.split('/')[1]}`)

  const response = await fetch('https://api.zoom.us/v2/users/me/picture', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    if (response.status === 429) {
      throw new Error('Rate limited by Zoom API. Please wait before trying again.')
    }
    throw new Error(`Failed to upload profile picture: ${error}`)
  }
}
