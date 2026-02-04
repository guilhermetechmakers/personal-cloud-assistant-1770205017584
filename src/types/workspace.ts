export interface Workspace {
  id: string
  name: string
  plan: 'free' | 'pro' | 'teams'
  created_at: string
  updated_at: string
}

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: 'admin' | 'member' | 'viewer'
  email?: string
  full_name?: string
}
