import { createError, getRouterParam, readBody } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'
import { writeAuditLog } from '../../../utils/audit'

function normalizeSlug(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID manquant.' })

  const body = await readBody<{
    slug?: string
    nom?: string
    ville?: string
    adresse?: string | null
    accreditation?: string | null
    site?: string | null
    phone?: string | null
    phoneSecondary?: string | null
    whatsapp?: string | null
    email?: string | null
    resume?: string | null
    coverImageUrl?: string | null
    logoUrl?: string | null
    typeLabel?: string | null
    status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
    source?: 'OFFICIAL_WEBSITE' | 'ESTABLISHMENT' | 'DIRECTORY' | 'OTHER' | null
    contactStatus?: 'VERIFIED' | 'TO_VERIFY' | 'UNVERIFIED'
    isDirectPartner?: boolean
    fraisDossier?: number
    autoIssueAttestation?: boolean
    commissionType?: string
    commissionValue?: number
    commissionPaidStatus?: string
    programmeCommissions?: Array<{ id: string; fraisDossier: number | null }>
  }>(event)

  if (body.slug !== undefined) {
    const s = normalizeSlug(body.slug)
    if (!s) throw createError({ statusCode: 400, statusMessage: 'Slug invalide.' })
    const clash = await prisma.etablissement.findFirst({
      where: { slug: s, NOT: { id } },
    })
    if (clash) {
      throw createError({ statusCode: 409, statusMessage: 'Ce slug est déjà utilisé.' })
    }
  }

  const updateData: Record<string, any> = {
    ...(body.slug !== undefined ? { slug: normalizeSlug(body.slug) } : {}),
    ...(body.nom !== undefined ? { nom: body.nom.trim() } : {}),
    ...(body.ville !== undefined ? { ville: body.ville.trim() } : {}),
    ...(body.adresse !== undefined ? { adresse: body.adresse?.trim() || null } : {}),
    ...(body.accreditation !== undefined ? { accreditation: body.accreditation?.trim() || null } : {}),
    ...(body.site !== undefined ? { site: body.site?.trim() || null } : {}),
    ...(body.phone !== undefined ? { phone: body.phone?.trim() || null } : {}),
    ...(body.phoneSecondary !== undefined ? { phoneSecondary: body.phoneSecondary?.trim() || null } : {}),
    ...(body.whatsapp !== undefined ? { whatsapp: body.whatsapp?.trim() || null } : {}),
    ...(body.email !== undefined ? { email: body.email?.trim() || null } : {}),
    ...(body.resume !== undefined ? { resume: body.resume?.trim() || null } : {}),
    ...(body.coverImageUrl !== undefined ? { coverImageUrl: body.coverImageUrl?.trim() || null } : {}),
    ...(body.logoUrl !== undefined ? { logoUrl: body.logoUrl?.trim() || null } : {}),
    ...(body.typeLabel !== undefined ? { typeLabel: body.typeLabel?.trim() || null } : {}),
    ...(body.status !== undefined ? { status: body.status } : {}),
    ...(body.source !== undefined ? { source: body.source } : {}),
    ...(body.isDirectPartner !== undefined ? { isDirectPartner: body.isDirectPartner } : {}),
    ...(body.fraisDossier !== undefined ? { fraisDossier: Number(body.fraisDossier) } : {}),
    ...(body.autoIssueAttestation !== undefined ? { autoIssueAttestation: body.autoIssueAttestation } : {}),
    ...(body.commissionType !== undefined ? { commissionType: body.commissionType } : {}),
    ...(body.commissionValue !== undefined ? { commissionValue: Number(body.commissionValue) } : {}),
    ...(body.commissionPaidStatus !== undefined ? { commissionPaidStatus: body.commissionPaidStatus } : {}),
    updatedBy: user.email,
  }

  if (body.contactStatus !== undefined) {
    updateData.contactStatus = body.contactStatus
    if (body.contactStatus === 'VERIFIED') {
      updateData.contactVerifiedAt = new Date()
    }
  }

  const row = await prisma.etablissement.update({
    where: { id },
    data: updateData,
  })

  if (Array.isArray(body.programmeCommissions) && body.programmeCommissions.length > 0) {
    for (const item of body.programmeCommissions) {
      if (item.id) {
        const val = item.fraisDossier !== null && item.fraisDossier !== undefined ? Number(item.fraisDossier) : null
        const isCustomOverride = val !== null && !isNaN(val)

        await prisma.programme.update({
          where: { id: item.id },
          data: {
            fraisDossier: isCustomOverride ? val : null
          }
        })
      }
    }
  }

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'ETABLISSEMENT_UPDATE',
    entityType: 'Etablissement',
    entityId: row.id,
    metadata: { slug: row.slug, status: row.status, contactStatus: row.contactStatus },
  })

  return row
})
