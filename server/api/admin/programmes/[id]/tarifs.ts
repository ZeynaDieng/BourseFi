import { createError, getRouterParam, readBody } from 'h3'
import { prisma } from '../../../../utils/prisma'
import { requireRole } from '../../../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID programme manquant.' })

  const method = event.method

  if (method === 'GET') {
    return prisma.tarif.findMany({
      where: { programmeId: id },
      orderBy: [{ anneeAcademique: 'desc' }, { createdAt: 'desc' }],
    })
  }

  if (method === 'POST') {
    const body = await readBody<{
      anneeAcademique: string
      montant: number
      fraisInscription?: number | null
      mensualite?: number | null
      nombreMois?: number | null
      frequence?: string
      devise?: string
      label?: string | null
      isDefault?: boolean
      source?: 'OFFICIAL_WEBSITE' | 'ESTABLISHMENT' | 'DOCUMENT' | 'PARTNER' | 'OTHER' | null
      isVerified?: boolean
      status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
    }>(event)

    if (!body.anneeAcademique?.trim() || body.montant === undefined || body.montant < 0) {
      throw createError({ statusCode: 400, statusMessage: 'Année académique et montant positif requis.' })
    }

    if (body.isDefault) {
      await prisma.tarif.updateMany({
        where: { programmeId: id },
        data: { isDefault: false },
      })
    }

    const tarif = await prisma.tarif.create({
      data: {
        programmeId: id,
        anneeAcademique: body.anneeAcademique.trim(),
        montant: Number(body.montant),
        fraisInscription: body.fraisInscription ? Number(body.fraisInscription) : null,
        mensualite: body.mensualite ? Number(body.mensualite) : null,
        nombreMois: body.nombreMois ? Number(body.nombreMois) : 10,
        frequence: body.frequence || 'ANNUEL',
        devise: body.devise || 'FCFA',
        label: body.label?.trim() || null,
        isDefault: body.isDefault !== undefined ? body.isDefault : true,
        source: body.source || null,
        isVerified: body.isVerified || false,
        verifiedAt: body.isVerified ? new Date() : null,
        status: body.status || 'ACTIVE',
        updatedBy: user.email,
      },
    })

    return tarif
  }

  throw createError({ statusCode: 405, statusMessage: 'Méthode non autorisée.' })
})
