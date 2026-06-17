import { createError } from 'h3'

/** MVP : portail partenaire désactivé — réactivation future via ce flag. */
export const PARTNER_PORTAL_ENABLED = false

export function assertPartnerPortalEnabled() {
  if (!PARTNER_PORTAL_ENABLED) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Le portail partenaire est indisponible pour le moment.',
    })
  }
}
