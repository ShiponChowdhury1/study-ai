export const sidebarItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    href: '/dashboard',
  },
  {
    id: 'user-management',
    label: 'User Management',
    icon: 'Users',
    href: '/user-management',
  },
  {
    id: 'content-control',
    label: 'Content Control',
    icon: 'FileText',
    href: '/content-control',
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions and plans',
    icon: 'CreditCard',
    href: '/subscriptions',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    href: '/settings',
  },
] as const

export type SidebarItemId = (typeof sidebarItems)[number]['id']
