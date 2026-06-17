import {
  adminDrawerLinks,
  adminMobileNav,
  type PortalNavItem,
} from '~/utils/portal-nav'

export function useAdminPortalNav() {
  const navItems = computed<PortalNavItem[]>(() =>
    adminMobileNav.map((item) => ({ ...item })),
  )

  return { navItems, adminDrawerLinks }
}
