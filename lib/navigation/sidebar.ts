export interface LayoutSidebarItem {
  key: string;
  label: string;
  icon?: string;
  to?: string;
  children?: LayoutSidebarItem[];
}

export const ADMIN_ROLE_KEYS = ["ROLE_ROOT", "ROLE_ADMIN"] as const;

export function buildSidebarItems(canAccessAdmin: boolean): LayoutSidebarItem[] {
  const items: LayoutSidebarItem[] = [
    {
      key: "calendar",
      label: "layout.sidebar.items.calendar",
      icon: "mdi-calendar-month",
      to: "/",
    },
    { key: "cv", label: "layout.sidebar.items.cv", icon: "mdi-file-account", to: "/" },
    { key: "jobs", label: "layout.sidebar.items.jobs", icon: "mdi-briefcase-search", to: "/" },
  ];

  items.push(
    { key: "help", label: "layout.sidebar.items.help", icon: "mdi-lifebuoy", to: "/help" },
    {
      key: "about",
      label: "layout.sidebar.items.about",
      icon: "mdi-information-outline",
      to: "/about",
    },
    {
      key: "contact",
      label: "layout.sidebar.items.contact",
      icon: "mdi-email-outline",
      to: "/contact",
    },
  );

  if (canAccessAdmin) {
    items.push({
      key: "admin",
      label: "layout.sidebar.items.admin",
      icon: "mdi-shield-crown",
      children: [
        {
          key: "admin-general",
          label: "layout.sidebar.items.adminGeneral",
          icon: "mdi-view-dashboard-outline",
          to: "/admin",
        },
        {
          key: "admin-user-management",
          label: "layout.sidebar.items.adminUserManagement",
          icon: "mdi-account-cog-outline",
          to: "/admin/user-management",
        },
        {
          key: "admin-blog",
          label: "layout.sidebar.items.adminBlog",
          icon: "mdi-post-outline",
          to: "/admin/blog",
        },
      ],
    });
  }

  return items;
}

export function buildProfileSidebarItems(): LayoutSidebarItem[] {
  return [
    {
      key: "profile-overview",
      label: "layout.sidebar.items.profileOverview",
      icon: "mdi-card-account-details-outline",
      to: "/profile",
    },
    {
      key: "profile-edit",
      label: "layout.sidebar.items.profileSettings",
      icon: "mdi-cog-outline",
      to: "/profile-edit",
    },
    {
      key: "profile-security",
      label: "layout.sidebar.items.profileSecurity",
      icon: "mdi-shield-check-outline",
      to: "/profile-security",
    },
    {
      key: "profile-friends",
      label: "layout.sidebar.items.profileFriends",
      icon: "mdi-account-group-outline",
      to: "/profile-friends",
    },
    {
      key: "profile-photos",
      label: "layout.sidebar.items.profilePhotos",
      icon: "mdi-image-multiple-outline",
      to: "/profile-photos",
    },
  ];
}
