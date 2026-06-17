export type PortalNavItem = {
  key: string
  to: string
  icon: string
  label: string
  badge?: number
}

export type PortalDrawerLink = {
  to: string
  icon: string
  label: string
  external?: boolean
}

export const partnerMobileNav: Omit<PortalNavItem, 'badge'>[] = [
  { key: 'dashboard', to: '/partenaire/dashboard', icon: 'dashboard', label: 'Accueil' },
  { key: 'candidatures', to: '/partenaire/candidatures', icon: 'description', label: 'Dossiers' },
  { key: 'documents', to: '/partenaire/documents', icon: 'folder', label: 'Docs' },
  { key: 'stats', to: '/partenaire/statistiques', icon: 'bar_chart', label: 'Stats' },
  { key: 'menu', to: '#menu', icon: 'menu', label: 'Plus' },
]

export const partnerDrawerLinks: PortalDrawerLink[] = [
  { to: '/partenaire/bourses', icon: 'school', label: 'Bourses' },
  { to: '/partenaire/paiements', icon: 'payments', label: 'Paiements' },
  { to: '/partenaire/parametres', icon: 'settings', label: 'Paramètres' },
  { to: '/partenaire/audit', icon: 'history', label: "Journal d'audit" },
]

export const adminMobileNav: Omit<PortalNavItem, 'badge'>[] = [
  { key: 'dashboard', to: '/admin/dashboard', icon: 'dashboard', label: 'Accueil' },
  { key: 'candidatures', to: '/admin/candidatures', icon: 'description', label: 'Dossiers' },
  { key: 'bourses', to: '/admin/catalogue/bourses', icon: 'school', label: 'Bourses' },
  { key: 'transactions', to: '/admin/transactions', icon: 'payments', label: 'Paiements' },
  { key: 'menu', to: '#menu', icon: 'menu', label: 'Plus' },
]

export const adminDrawerLinks: PortalDrawerLink[] = [
  { to: '/admin/catalogue/programmes', icon: 'menu_book', label: 'Formations' },
  { to: '/admin/catalogue/ecoles', icon: 'apartment', label: 'Écoles' },
  { to: '/admin/catalogue/partenaires', icon: 'handshake', label: 'Partenaires' },
  { to: '/admin/rapports', icon: 'analytics', label: 'Rapports' },
  { to: '/admin/cms/site', icon: 'web', label: 'Blocs du site' },
  { to: '/admin/cms/faq', icon: 'quiz', label: 'FAQ' },
  { to: '/admin/users', icon: 'group', label: 'Utilisateurs' },
  { to: '/admin/audit', icon: 'history', label: "Journal d'audit" },
]

export function portalNavActive(path: string, item: { to: string; key: string }): boolean {
  if (item.key === 'menu') return false
  if (item.to === '/partenaire/dashboard' || item.to === '/admin/dashboard') {
    return path === item.to
  }
  return path === item.to || path.startsWith(`${item.to}/`)
}
