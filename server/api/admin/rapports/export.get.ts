import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const [candidatures, paiements, bourses] = await Promise.all([
    prisma.candidature.findMany({
      include: {
        programme: { select: { titre: true } },
        partner: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.paiement.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.bourse.count({ where: { isActive: true } }),
  ])

  const lines = [
    'RAPPORT BOURSEFI',
    `Date;${new Date().toISOString()}`,
    `Bourses actives;${bourses}`,
    '',
    'CANDIDATURES',
    'ID;Nom;Email;Programme;Partenaire;Statut;Date',
    ...candidatures.map(
      (c) =>
        `${c.id};${csvEscape(c.fullName)};${csvEscape(c.email)};${csvEscape(c.programme.titre)};${csvEscape(c.partner.name)};${c.status};${c.createdAt.toISOString()}`,
    ),
    '',
    'PAIEMENTS',
    'ID;Montant;Partenaire;Plateforme;Devise;Date',
    ...paiements.map(
      (p) =>
        `${p.id};${p.amount};${p.amountPartner};${p.amountPlatform};${p.currency};${p.createdAt.toISOString()}`,
    ),
  ]

  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setHeader(event, 'Content-Disposition', 'attachment; filename="boursefi-rapport.csv"')
  return lines.join('\n')
})

function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`
}
