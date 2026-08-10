import { createError, getRouterParam, readBody } from 'h3'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID tarif manquant.' })

  const body = await readBody<{
    anneeAcademique?: string
    montant?: number
    frequence?: string
    devise?: string
    label?: string | null
    isDefault?: boolean
    source?: 'OFFICIAL_WEBSITE' | 'ESTABLISHMENT' | 'DOCUMENT' | 'PARTNER' | 'OTHER' | null
    isVerified?: boolean
    status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  }>(event)

  const existing = await prisma.tarif.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Tarif introuvable.' })

  if (body.isDefault) {
    await prisma.tarif.updateMany({
      where: { programmeId: existing.programmeId },
      data: { isDefault: false },
    })
  }

  const updateData: Record<string, any> = {
    ...(body.anneeAcademique !== undefined ? { anneeAcademique: body.anneeAcademique.trim() } : {}),
    ...(body.montant !== undefined ? { montant: Number(body.montant) } : {}),
    ...(body.frequence !== undefined ? { frequence: body.frequence } : {}),
    ...(body.devise !== undefined ? { devise: body.devise } : {}),
    ...(body.label !== undefined ? { label: body.label?.trim() || null } : {}),
    ...(body.isDefault !== undefined ? { isDefault: body.isDefault } : {}),
    ...(body.source !== undefined ? { source: body.source } : {}),
    ...(body.status !== undefined ? { status: body.status } : {}),
    updatedBy: user.email,
  }

  if (body.isVerified !== undefined) {
    updateData.isVerified = body.isVerified
    if (body.isVerified) {
      updateData.verifiedAt = new Date()
    }
  }

  const updated = await prisma.tarif.update({
    where: { id },
    data: updateData,
  })

  return updated
})
