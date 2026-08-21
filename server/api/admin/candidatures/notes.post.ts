import { z } from 'zod'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'
import { writeAuditLog } from '../../../utils/audit'

const noteSchema = z.object({
  candidatureId: z.string().min(1, 'Candidature ID requis.'),
  exchangeType: z.enum(['CALL', 'WHATSAPP', 'EMAIL', 'MEETING', 'SUPPORT', 'OTHER']).default('WHATSAPP'),
  content: z.string().min(1, 'Le compte-rendu ne peut pas être vide.'),
  interestLevel: z.enum(['HOT_HIGH', 'HOT_MED', 'WARM', 'COLD', 'NOT_INTERESTED']).optional().nullable(),
  blockingReason: z.enum(['PARENT_APPROVAL', 'FINANCIAL_DIFFICULTY', 'MISSING_DOCS', 'SCHOOL_HESITATION', 'PROGRAM_HESITATION', 'TECHNICAL_ISSUE', 'WAITING_RESPONSE', 'NO_LONGER_INTERESTED', 'EXPIRED', 'OTHER']).optional().nullable(),
  nextAction: z.enum(['CALL_TOMORROW', 'SEND_BROCHURE', 'SEND_PROMO', 'SEND_PAYMENT_LINK', 'WAIT_CANDIDATE', 'SCHEDULE_MEETING', 'VERIFY_DOCS']).optional().nullable(),
  nextRelanceAt: z.string().optional().nullable(),
  isPinned: z.boolean().default(false),
  attachmentUrl: z.string().optional().nullable(),
})

export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  const body = await readBody(event)
  const parsed = noteSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Données invalides : ' + parsed.error.issues.map((i) => i.message).join(', '),
    })
  }

  const candidature = await prisma.candidature.findUnique({
    where: { id: parsed.data.candidatureId },
  })

  if (!candidature) {
    throw createError({ statusCode: 404, statusMessage: 'Candidature introuvable.' })
  }

  const nextRelanceDate = parsed.data.nextRelanceAt ? new Date(parsed.data.nextRelanceAt) : null

  // Création de la note commerciale
  const note = await prisma.candidatureNote.create({
    data: {
      candidatureId: candidature.id,
      agentName: admin.name || admin.email || 'Admin BourseFi',
      exchangeType: parsed.data.exchangeType,
      content: parsed.data.content,
      interestLevel: parsed.data.interestLevel || undefined,
      blockingReason: parsed.data.blockingReason || undefined,
      nextAction: parsed.data.nextAction || undefined,
      nextRelanceAt: nextRelanceDate,
      isPinned: parsed.data.isPinned,
      attachmentUrl: parsed.data.attachmentUrl || null,
    },
  })

  // Mise à jour synchrone sur la candidature
  await prisma.candidature.update({
    where: { id: candidature.id },
    data: {
      ...(parsed.data.interestLevel ? { interestLevel: parsed.data.interestLevel } : {}),
      ...(parsed.data.blockingReason !== undefined ? { blockingReason: parsed.data.blockingReason } : {}),
      ...(nextRelanceDate ? { nextRelanceAt: nextRelanceDate } : {}),
    },
  })

  await writeAuditLog({
    actorId: admin.id,
    actorRole: admin.role,
    action: 'CRM_NOTE_CREATED',
    entityType: 'Candidature',
    entityId: candidature.id,
    metadata: {
      noteId: note.id,
      exchangeType: note.exchangeType,
      interestLevel: note.interestLevel,
      blockingReason: note.blockingReason,
    },
  })

  return { ok: true, note }
})
