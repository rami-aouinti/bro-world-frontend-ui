export interface MercureTokenEnvelope {
  token: string
  expiresAt?: string | null
  expiresIn?: number | null
}

export interface MercureTokenState {
  token: string
  /**
   * Unix timestamp (ms) at which the token expires. `null` when unknown.
   */
  expiresAt: number | null
}
