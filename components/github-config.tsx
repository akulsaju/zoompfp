'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Github } from 'lucide-react'

interface GitHubConfigProps {
  repo: string
  folder: string
  branch: string
  onRepoChange: (value: string) => void
  onFolderChange: (value: string) => void
  onBranchChange: (value: string) => void
  disabled?: boolean
}

export function GitHubConfig({
  repo,
  folder,
  branch,
  onRepoChange,
  onFolderChange,
  onBranchChange,
  disabled,
}: GitHubConfigProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Github className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">GitHub Repository</CardTitle>
        </div>
        <CardDescription>
          Point to a public repo folder containing your profile pictures
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="repo">Repository</Label>
          <Input
            id="repo"
            placeholder="username/repo-name"
            value={repo}
            onChange={(e) => onRepoChange(e.target.value)}
            disabled={disabled}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Format: owner/repository (e.g., octocat/my-pfps)
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="folder">Folder Path</Label>
            <Input
              id="folder"
              placeholder="images"
              value={folder}
              onChange={(e) => onFolderChange(e.target.value)}
              disabled={disabled}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch">Branch</Label>
            <Input
              id="branch"
              placeholder="main"
              value={branch}
              onChange={(e) => onBranchChange(e.target.value)}
              disabled={disabled}
              className="font-mono text-sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
