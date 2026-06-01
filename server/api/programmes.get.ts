import {
  isKnownMetierTrack,
  programmeMatchesMetierTrack
} from '../../app/utils/metier-tracks'
import { prisma } from '../utils/prisma'

function serialize<
  P extends {
    id: string
    slug: string
    titre: string
    ville: string
    duree: string
    fraisDossier: number
    fraisScolarite: number
    devise: string
    niveau: string
    placement: string | null
    description: string
    eligibilite: string | null
    brochureUrl: string | null
    perspectives: string | null
    partner: { name: string; slug: string; partnerSharePercent: number }
    etablissement: { slug: string; nom: string }
  }
>(p: P) {
  return {
    id: p.id,
    slug: p.slug,
    titre: p.titre,
    etablissement: p.etablissement.nom,
    etablissementSlug: p.etablissement.slug,
    partnerName: p.partner.name,
    partnerSlug: p.partner.slug,
    ville: p.ville,
    duree: p.duree,
    frais: p.fraisScolarite,
    fraisDossier: p.fraisDossier,
    fraisScolarite: p.fraisScolarite,
    devise: p.devise,
    niveau: p.niveau,
    placement: p.placement,
    description: p.description,
    eligibilite: p.eligibilite,
    brochureUrl: p.brochureUrl,
    perspectives: p.perspectives,
    pays: 'Senegal',
    partnerSharePercent: p.partner.partnerSharePercent
  }
}

export default defineEventHandler(async (event) => {
  const raw = getQuery(event).metier
  const metier = typeof raw === 'string' ? raw : undefined

  const rows = await prisma.programme.findMany({
    include: {
      partner: true,
      etablissement: true
    },
    orderBy: { titre: 'asc' }
  })

  const filtered =
    isKnownMetierTrack(metier)
      ? rows.filter((r) =>
          programmeMatchesMetierTrack(
            {
              slug: r.slug,
              titre: r.titre,
              description: r.description,
              perspectives: r.perspectives
            },
            metier
          )
        )
      : rows

  return filtered.map(serialize)
})
