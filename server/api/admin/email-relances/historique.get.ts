import { prisma } from '../../../utils/prisma'
import { requireRole } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const query = getQuery(event)
  const search = (query.search as string || '').toLowerCase().trim()
  const channelFilter = (query.channel as string || 'ALL').toUpperCase()

  // 1. Fetch EmailRelanceLogs
  const emailLogs = await prisma.emailRelanceLog.findMany({
    orderBy: { sentAt: 'desc' },
    include: {
      template: true,
      candidature: {
        include: {
          programme: { include: { etablissement: true } },
          paiement: true,
        },
      },
    },
    take: 100,
  })

  // 2. Fetch AutoRelanceLogs
  const autoLogs = await prisma.autoRelanceLog.findMany({
    orderBy: { sentAt: 'desc' },
    include: {
      candidature: {
        include: {
          programme: { include: { etablissement: true } },
          paiement: true,
        },
      },
    },
    take: 100,
  })

  // 3. Fetch CRM Relance Notes
  const crmNotes = await prisma.candidatureNote.findMany({
    where: {
      OR: [
        { content: { contains: '[AUTOMATION' } },
        { content: { contains: '[RELANCE' } },
        { exchangeType: { in: ['EMAIL', 'WHATSAPP', 'SMS'] } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      candidature: {
        include: {
          programme: { include: { etablissement: true } },
          paiement: true,
        },
      },
    },
    take: 100,
  })

  const unifiedList: Array<{
    id: string
    candidateId: string
    candidateName: string
    candidateEmail: string
    candidatePhone: string
    formation: string
    ecole: string
    channel: 'EMAIL' | 'WHATSAPP' | 'SMS' | 'BOTH'
    subject: string
    messageContent: string
    scenarioStep?: number | null
    scenarioName?: string
    sentAt: Date
    status: string
    isPaid: boolean
    recoveredAmount?: number | null
  }> = []

  const seenKeys = new Set<string>()

  // Map EmailLogs
  for (const log of emailLogs) {
    if (!log.candidature) continue
    const key = `EMAIL_${log.id}`
    seenKeys.add(key)
    unifiedList.push({
      id: log.id,
      candidateId: log.candidatureId,
      candidateName: log.candidature.fullName,
      candidateEmail: log.candidature.email,
      candidatePhone: log.candidature.phone || 'N/A',
      formation: log.candidature.programme?.titre || 'N/A',
      ecole: log.candidature.programme?.etablissement?.nom || 'N/A',
      channel: 'EMAIL',
      subject: log.subject || 'Relance Email BourseFi',
      messageContent: log.template?.bodyHtml || log.subject,
      scenarioStep: log.template?.scenarioStep || null,
      scenarioName: log.template?.name || 'Campagne E-mail',
      sentAt: log.sentAt,
      status: log.status,
      isPaid: !!log.candidature.paiement,
      recoveredAmount: log.recoveredAmount,
    })
  }

  // Map AutoLogs
  for (const log of autoLogs) {
    if (!log.candidature) continue
    const key = `AUTO_${log.id}`
    if (seenKeys.has(key)) continue
    seenKeys.add(key)

    const ch = (log.channel as 'EMAIL' | 'WHATSAPP' | 'BOTH') || 'EMAIL'
    unifiedList.push({
      id: log.id,
      candidateId: log.candidatureId,
      candidateName: log.candidature.fullName,
      candidateEmail: log.candidature.email,
      candidatePhone: log.candidature.phone || 'N/A',
      formation: log.candidature.programme?.titre || 'N/A',
      ecole: log.candidature.programme?.etablissement?.nom || 'N/A',
      channel: ch,
      subject: `Relance Automatique Scénario ${log.scenarioStep}`,
      messageContent: `Relance automatique déclenchée pour l'étape ${log.scenarioStep} via ${ch}.`,
      scenarioStep: log.scenarioStep,
      scenarioName: `Scénario ${log.scenarioStep}`,
      sentAt: log.sentAt,
      status: log.status,
      isPaid: !!log.candidature.paiement,
      recoveredAmount: log.recoveredAmount,
    })
  }

  // Map CRM Notes
  for (const note of crmNotes) {
    if (!note.candidature) continue
    const key = `NOTE_${note.id}`
    if (seenKeys.has(key)) continue
    seenKeys.add(key)

    unifiedList.push({
      id: note.id,
      candidateId: note.candidatureId,
      candidateName: note.candidature.fullName,
      candidateEmail: note.candidature.email,
      candidatePhone: note.candidature.phone || 'N/A',
      formation: note.candidature.programme?.titre || 'N/A',
      ecole: note.candidature.programme?.etablissement?.nom || 'N/A',
      channel: (note.exchangeType as 'EMAIL' | 'WHATSAPP' | 'SMS') || 'EMAIL',
      subject: `Échange CRM (${note.exchangeType})`,
      messageContent: note.content,
      sentAt: note.createdAt,
      status: 'SENT',
      isPaid: !!note.candidature.paiement,
    })
  }

  // Sort chronologically descending
  unifiedList.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())

  // Apply Search & Channel Filters
  let filtered = unifiedList

  if (search) {
    filtered = filtered.filter(
      (item) =>
        item.candidateName.toLowerCase().includes(search) ||
        item.candidateEmail.toLowerCase().includes(search) ||
        item.candidatePhone.toLowerCase().includes(search) ||
        item.formation.toLowerCase().includes(search) ||
        item.ecole.toLowerCase().includes(search)
    )
  }

  if (channelFilter !== 'ALL') {
    filtered = filtered.filter((item) => item.channel === channelFilter || item.channel === 'BOTH')
  }

  return {
    ok: true,
    total: filtered.length,
    historique: filtered.slice(0, 50),
  }
})
