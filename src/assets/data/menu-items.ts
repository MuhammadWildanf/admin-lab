import type { MenuItemType } from '@/types/menu'

export const MENU_ITEMS: MenuItemType[] = [
  {
    key: 'menu',
    label: 'MENU',
    isTitle: true,
  },
  {
    key: 'dashboard',
    icon: 'solar:home-2-broken',
    label: 'Dashboard',
    badge: {
      text: '9+',
      variant: 'success',
    },
    url: '/dashboard/analytics',
  },
  {
    key: 'sub-category',
    icon: 'solar:tag-broken',
    label: 'Sub Category',
    url: '/sub-category',
  },
  {
    key: 'category',
    icon: 'solar:tag-broken',
    label: 'Category',
    url: '/category',
  },
  {
    key: 'product',
    icon: 'solar:tag-broken',
    label: 'Product',
    url: '/product',
  },
]
