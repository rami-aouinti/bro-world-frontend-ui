export interface AuthUser {
  id: string
  username: string
  email: string
  firstName?: string | null
  lastName?: string | null
  enabled?: boolean
  photo?: string | null
  roles?: string[]
  [key: string]: unknown
}

export interface AuthLoginResponse {
  token: string
  profile: AuthUser
}

export interface AuthLoginEnvelope {
  token: string
  user: AuthUser
}

export interface AuthSessionEnvelope {
  authenticated: boolean
  user: AuthUser | null
}
