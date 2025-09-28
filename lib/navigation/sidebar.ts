export interface LayoutSidebarItem {
  key: string
  label: string
  icon?: string
  to?: string
  children?: LayoutSidebarItem[]
}

export const ADMIN_ROLE_KEYS = ['ROLE_ROOT', 'ROLE_ADMIN'] as const

export function buildSidebarItems(canAccessAdmin: boolean): LayoutSidebarItem[] {
  const items: LayoutSidebarItem[] = [
    {
      key: 'apps',
      label: 'layout.sidebar.items.apps',
      icon: 'mdi-apps',
      to: '/',
      children: [
        { key: 'calendar', label: 'layout.sidebar.items.calendar', icon: 'mdi-calendar-month', to: '/' },
        { key: 'cv', label: 'layout.sidebar.items.cv', icon: 'mdi-file-account', to: '/' },
        { key: 'jobs', label: 'layout.sidebar.items.jobs', icon: 'mdi-briefcase-search', to: '/' },
      ],
    },
  ]

  if (canAccessAdmin) {
    items.push({
      key: 'admin',
      label: 'layout.sidebar.items.admin',
      icon: 'mdi-shield-crown',
      children: [
        { key: 'admin-general', label: 'layout.sidebar.items.adminGeneral', icon: 'mdi-view-dashboard-outline', to: '/admin' },
        {
          key: 'admin-user-management',
          label: 'layout.sidebar.items.adminUserManagement',
          icon: 'mdi-account-cog-outline',
          to: '/admin/user-management',
        },
        {
          key: 'admin-blog',
          label: 'layout.sidebar.items.adminBlog',
          icon: 'mdi-post-outline',
          to: '/admin/blog',
        },
      ],
    })
  }

  items.push(
    { key: 'help', label: 'layout.sidebar.items.help', icon: 'mdi-lifebuoy', to: '/help' },
    { key: 'about', label: 'layout.sidebar.items.about', icon: 'mdi-information-outline', to: '/about' },
    { key: 'contact', label: 'layout.sidebar.items.contact', icon: 'mdi-email-outline', to: '/contact' },
  )

  return items
}
