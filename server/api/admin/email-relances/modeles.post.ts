import { z } from 'zod'
import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'
import { sendEmail, renderEmail } from '../../../utils/email'
import { writeAuditLog } from '../../../utils/audit'

const templateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  subject: z.string().min(1),
  bodyHtml: z.string().min(1),
  bodyText: z.string().optional(),
  scenarioStep: z.number().int().optional().nullable(),
  isActive: z.boolean().default(true),
  testEmail: z.string().email().optional(), // Pour test envoi
})

export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  const body = await readBody(event)
  const parsed = templateSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Données de modèle invalides.' })
  }

  const { id, name, subject, bodyHtml, bodyText, scenarioStep, isActive, testEmail } = parsed.data

  // Si testEmail est fourni, envoyer un email de test
  if (testEmail) {
    const sampleText = bodyHtml
      .replace(/\{\{prenom\}\}/g, 'Awa')
      .replace(/\{\{nom\}\}/g, 'Ndiaye')
      .replace(/\{\{email\}\}/g, testEmail)
      .replace(/\{\{telephone\}\}/g, '+221 77 123 45 67')
      .replace(/\{\{ecole\}\}/g, 'Université HECM / BourseFi')
      .replace(/\{\{formation\}\}/g, 'Licence en Gestion de Projet')
      .replace(/\{\{niveau\}\}/g, 'Licence 1')
      .replace(/\{\{montant\}\}/g, '20 000 FCFA')
      .replace(/\{\{pourcentage_bourse\}\}/g, '50%')
      .replace(/\{\{code_promo\}\}/g, 'RENTREE2026')
      .replace(/\{\{date_limite\}\}/g, '31 Décembre 2026')
      .replace(/\{\{lien_paiement\}\}/g, 'https://boursefi.com/paiement?demo=1')

    const htmlContent = renderEmail('Candidature', {
      recipientName: 'Awa',
      title: subject,
      message: sampleText,
      ctaLabel: 'Finaliser mon inscription →',
      ctaUrl: 'https://boursefi.com/paiement?demo=1',
    })

    await sendEmail({
      to: testEmail,
      subject: `[TEST MODÈLE] ${subject}`,
      html: htmlContent,
      text: sampleText,
    })

    return { ok: true, message: `Email de test envoyé avec succès à ${testEmail}` }
  }

  let template
  if (id) {
    template = await prisma.emailTemplate.update({
      where: { id },
      data: { name, subject, bodyHtml, bodyText, scenarioStep, isActive },
    })
  } else {
    template = await prisma.emailTemplate.create({
      data: { name, subject, bodyHtml, bodyText, scenarioStep, isActive },
    })
  }

  try {
    await writeAuditLog({
      action: id ? 'UPDATE_EMAIL_TEMPLATE' : 'CREATE_EMAIL_TEMPLATE',
      entityType: 'EmailTemplate',
      entityId: template.id,
      metadata: { id: template.id, scenarioStep },
    })
  } catch {}

  return { ok: true, template }
})
