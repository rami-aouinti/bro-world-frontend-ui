export interface SidebarItem {
  key: string
  label: string
  icon?: string
  to?: string
  children?: SidebarItem[]
}
