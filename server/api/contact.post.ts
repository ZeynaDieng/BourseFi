import { z } from 'zod'
import { prisma } from '../utils/prisma'

const contactSchema = z.object({
  senderName: z.string().min(2, 'Le nom est trop court'),
  email: z.string().email('Email invalide'),
  subject: z.string().min(3, 'Le sujet est trop court'),
  message: z.string().min(10, 'Le message est trop court')
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = contactSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Données de contact invalides',
      data: parsed.error.format()
    })
  }

  try {
    const contactMessage = await prisma.contactMessage.create({
      data: {
        senderName: parsed.data.senderName,
        email: parsed.data.email,
        subject: parsed.data.subject,
        message: parsed.data.message
      }
    })

    return {
      success: true,
      message: 'Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais.',
      id: contactMessage.id
    }
  } catch (error) {
    console.error('[CONTACT_ERROR]', error)
    throw createError({
      statusCode: 500,
      statusMessage: "Une erreur est survenue lors de l'envoi du message."
    })
  }
})
