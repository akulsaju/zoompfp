import { NextResponse } from 'next/server'
import { getImagesFromGitHub } from '@/lib/github'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const repo = searchParams.get('repo')
  const folder = searchParams.get('folder') || 'images'
  const branch = searchParams.get('branch') || 'main'

  if (!repo) {
    return NextResponse.json(
      { error: 'Missing repo parameter' },
      { status: 400 }
    )
  }

  try {
    const images = await getImagesFromGitHub(repo, folder, branch)
    return NextResponse.json(images)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
