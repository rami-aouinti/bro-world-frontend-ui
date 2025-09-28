import { describe, expect, it } from 'vitest'
import { normalizeRolesInput, normalizeUserPayload } from '~/lib/users/normalizers'

describe('users normalizers', () => {
  it('normalizes string and array role inputs', () => {
    expect(normalizeRolesInput([' Admin ', 'editor', 'ADMIN', ''])).toEqual(['admin', 'editor'])
    expect(normalizeRolesInput('admin, editor , moderator')).toEqual(['admin', 'editor', 'moderator'])
  })

  it('returns sanitized user payload', () => {
    const result = normalizeUserPayload({
      id: ' 123 ',
      username: '  alice  ',
      email: ' Alice@example.com ',
      firstName: ' Alice ',
      lastName: ' DOE ',
      roles: ['ADMIN', 'admin', 'editor'],
    })

    expect(result).toEqual({
      id: '123',
      username: 'alice',
      email: 'alice@example.com',
      firstName: 'Alice',
      lastName: 'DOE',
      roles: ['admin', 'editor'],
    })
  })
})
