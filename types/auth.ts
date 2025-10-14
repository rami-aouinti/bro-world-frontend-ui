export interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  enabled?: boolean;
  photo?: string | null;
  roles?: string[];
  [key: string]: unknown;
}

export interface AuthLoginResponse {
  token: string;
  profile: AuthUser;
}

export interface AuthLoginEnvelope {
  token: string;
  /**
   * Some authentication endpoints return the authenticated user under a
   * `user` property while others use `profile`. Supporting both here keeps the
   * consumer code resilient to either payload.
   */
  user?: AuthUser;
  profile?: AuthUser;
}

export interface AuthSessionEnvelope {
  authenticated: boolean;
  user: AuthUser | null;
}
