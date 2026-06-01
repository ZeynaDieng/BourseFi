import { requireRole } from '../utils/auth'
import { prisma } from '../utils/prisma'
import { z } from 'zod'
import { writeAuditLog } from '../utils/audit'
import type { CandidatureStatus } from '../utils/candidature-types'
import { saveCandidatureIdentityImages } from '../utils/candidature-files'

const imageDataUrl = z
  .string()
  .min(80)
  .regex(/^data:image\/(jpeg|jpg|png|webp);base64,/i)

const candidatureSchema = z.object({
  programmeId: z.string().min(1),
  firstName: z.string().min(1).max(80).trim(),
  lastName: z.string().min(1).max(80).trim(),
  email: z.email(),
  phone: z.string().min(8).max(32).trim(),
  address: z.string().min(5).max(600).trim(),
  institution: z.string().max(200).optional().default(''),
  field: z.string().max(300).optional().default(''),
  level: z.string().max(80).optional().default('Non precise'),
  lastEducationLevel: z.string().min(2).max(120).trim(),
  lastDiploma: z.string().min(2).max(200).trim(),
  graduationDate: z.string().max(40).optional().default(''),
  gpa: z.string().min(1).max(30).trim(),
  identityCardRecto: imageDataUrl,
  identityCardVerso: imageDataUrl
})

export default defineEventHandler(async (event) => {
  const user = await requireRole(event, ['STUDENT', 'ADMIN'])
  const body = await readBody(event)
  const parsed = candidatureSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Informations candidature invalides ou incomplètes.'
    })
  }

  const programme = await prisma.programme.findUnique({
    where: { id: parsed.data.programmeId }
  })

  if (!programme) {
    throw createError({ statusCode: 404, statusMessage: 'Programme introuvable.' })
  }

  let initialStatus: CandidatureStatus = 'SOUMIS'
  if (programme.fraisDossier > 0) {
    initialStatus = 'EN_ATTENTE_PAIEMENT'
  } else {
    initialStatus = 'EN_REVUE_PARTENAIRE'
  }

  const fullName = `${parsed.data.firstName} ${parsed.data.lastName}`.trim()

  const candidature = await prisma.candidature.create({
    data: {
      userId: user.id,
      programmeId: programme.id,
      partnerId: programme.partnerId,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      fullName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      address: parsed.data.address,
      institution: parsed.data.institution,
      field: parsed.data.field,
      level: parsed.data.level,
      lastEducationLevel: parsed.data.lastEducationLevel,
      lastDiploma: parsed.data.lastDiploma,
      graduationDate: parsed.data.graduationDate,
      gpa: parsed.data.gpa,
      targetProgram: programme.titre,
      status: initialStatus,
      identityCardRectoUrl: null,
      identityCardVersoUrl: null
    }
  })

  try {
    const urls = await saveCandidatureIdentityImages(
      candidature.id,
      parsed.data.identityCardRecto,
      parsed.data.identityCardVerso
    )
    await prisma.candidature.update({
      where: { id: candidature.id },
      data: {
        identityCardRectoUrl: urls.identityCardRectoUrl,
        identityCardVersoUrl: urls.identityCardVersoUrl
      }
    })
  } catch (err) {
    await prisma.candidature.delete({ where: { id: candidature.id } })
    const msg = err instanceof Error ? err.message : 'Erreur enregistrement des pièces d identité.'
    throw createError({ statusCode: 400, statusMessage: msg })
  }

  await writeAuditLog({
    actorId: user.id,
    actorRole: user.role,
    action: 'CANDIDATURE_CREATED',
    entityType: 'Candidature',
    entityId: candidature.id,
    metadata: {
      programmeId: programme.id,
      partnerId: programme.partnerId,
      status: initialStatus
    }
  })

  return {
    ok: true,
    candidature: {
      id: candidature.id,
      status: initialStatus,
      fraisDossier: programme.fraisDossier,
      devise: programme.devise
    }
  }
})
