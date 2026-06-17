import {
  partnerDrawerLinks,
  partnerMobileNav,
  type PortalNavItem,
} from '~/utils/portal-nav'

export function usePartnerPortalNav() {
  const { data: stats } = useFetch('/api/partner/stats')

  const navItems = computed<PortalNavItem[]>(() =>
    partnerMobileNav.map((item) =>
      item.key === 'candidatures'
        ? { ...item, badge: stats.value?.pendingCount ?? 0 }
        : { ...item },
    ),
  )

  return { navItems, partnerDrawerLinks, stats }
}
