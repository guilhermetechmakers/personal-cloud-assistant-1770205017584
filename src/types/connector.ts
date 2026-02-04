export type ConnectorStatus = 'connected' | 'disconnected' | 'error' | 'expired'

export interface Connector {
  id: string
  workspace_id: string
  provider: string
  scopes: string[]
  status: ConnectorStatus
  expires_at?: string
  created_at: string
  updated_at: string
}
