import { describe, expect, it } from 'vitest'
import { buildSidebarItems } from '~/lib/navigation/sidebar'

describe('buildSidebarItems', () => {
  it('omits the admin menu when access is denied', () => {
    const items = buildSidebarItems(false)

    expect(items.some((item) => item.key === 'admin')).toBe(false)
  })

  it('includes the admin menu and its children when access is granted', () => {
    const items = buildSidebarItems(true)

    const adminEntry = items.find((item) => item.key === 'admin')
    expect(adminEntry).toBeDefined()
    expect(adminEntry?.children?.map((child) => child.key)).toEqual([
      'admin-general',
      'admin-user-management',
      'admin-blog',
    ])
  })
})
