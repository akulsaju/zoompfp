export interface GitHubFile {
  name: string
  path: string
  download_url: string
  type: 'file' | 'dir'
}

export async function getImagesFromGitHub(
  repo: string,
  folder: string,
  branch: string
): Promise<GitHubFile[]> {
  const url = `https://api.github.com/repos/${repo}/contents/${folder}?ref=${branch}`
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Zoom-PFP-Rotator',
    },
    next: { revalidate: 60 }, // Cache for 60 seconds
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Folder not found: ${repo}/${folder} (branch: ${branch})`)
    }
    throw new Error(`GitHub API error: ${response.status}`)
  }

  const files: GitHubFile[] = await response.json()
  
  // Filter for image files only
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp']
  return files.filter(
    (file) =>
      file.type === 'file' &&
      imageExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
  )
}

export async function downloadImage(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`)
  }
  const contentType = response.headers.get('content-type') || 'image/png'
  const arrayBuffer = await response.arrayBuffer()
  return {
    buffer: Buffer.from(arrayBuffer),
    contentType,
  }
}
