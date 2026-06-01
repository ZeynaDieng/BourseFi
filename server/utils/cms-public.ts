import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { MetierPage, PrismaClient } from '@prisma/client'

const sharedDir = () => join(process.cwd(), 'shared')

export function loadDiskCmsSeed(): {
  siteContent: Record<string, unknown>
  faq: Array<{ question: string; answer: string }>
  testimonials: Array<{
    initials?: string
    name: string
    role: string
    quote: string
    avatarUrl?: string
  }>
  metiers: MetierSeedRow[]
} {
  const site = JSON.parse(readFileSync(join(sharedDir(), 'site-cms-seed.json'), 'utf8')) as {
    siteContent: Record<string, unknown>
    faq: Array<{ question: string; answer: string }>
    testimonials: Array<{
      initials?: string
      name: string
      role: string
      quote: string
      avatarUrl?: string
    }>
  }
  const metiers = JSON.parse(readFileSync(join(sharedDir(), 'metiers-seed.json'), 'utf8')) as MetierSeedRow[]
  return { siteContent: site.siteContent, faq: site.faq, testimonials: site.testimonials, metiers }
}

export type MetierSeedRow = {
  slug: string
  sortOrder: number
  published: boolean
  label: string
  shortDescription: string
  salary: string
  employability: string
  salaryNote: string
  missions: string[]
  skills: string[]
  career: { level: string; text: string }[]
  coverImageUrl?: string | null
}

export type MetierHubPublic = {
  slug: string
  label: string
  shortDescription: string
  salary: string
  employability: string
  missions: string[]
  skills: string[]
  career: { level: string; text: string }[]
  salaryNote: string
  coverImageUrl?: string | null
}

export function mergeContentDeep<T extends Record<string, unknown>>(base: T, patch: unknown): T {
  if (patch === null || patch === undefined) return base
  if (typeof patch !== 'object' || Array.isArray(patch)) return patch as T
  const out = { ...base } as Record<string, unknown>
  for (const k of Object.keys(patch as Record<string, unknown>)) {
    const pv = (patch as Record<string, unknown>)[k]
    const av = out[k]
    if (
      pv &&
      typeof pv === 'object' &&
      !Array.isArray(pv) &&
      av &&
      typeof av === 'object' &&
      !Array.isArray(av)
    ) {
      out[k] = mergeContentDeep(av as Record<string, unknown>, pv)
    } else {
      out[k] = pv
    }
  }
  return out as T
}

function finalizeResolvedUrls(content: Record<string, unknown>) {
  const va = content.visual_assets as Record<string, string> | undefined
  if (!va) return

  const hero = content.home_hero as Record<string, unknown>
  if (hero && !hero.backgroundImageUrl) {
    const key = hero.backgroundImageKey as string | undefined
    hero.backgroundImageUrl = (key && va[key]) || va.heroHome
  }

  const proc = content.home_process as { cards?: Array<Record<string, unknown>> } | undefined
  if (proc?.cards) {
    for (const c of proc.cards) {
      const ik = c.imageKey as string | undefined
      if (ik && va[ik] && !c.imageUrl) {
        c.imageUrl = va[ik]
      }
    }
  }

  const why = content.why_choose as Record<string, unknown> | undefined
  if (why) {
    const bk = why.bannerImageKey as string | undefined
    if (bk && va[bk] && !why.bannerImageUrl) {
      why.bannerImageUrl = va[bk]
    }
  }

  const mh = content.metiers_hub_page as Record<string, unknown> | undefined
  if (mh) {
    const hk = mh.heroImageKey as string | undefined
    if (hk && va[hk] && !mh.heroImageUrl) {
      mh.heroImageUrl = va[hk]
    }
  }

  const ori = content.orientation_page as Record<string, unknown> | undefined
  if (ori) {
    const hk = ori.heroImageKey as string | undefined
    if (hk && va[hk] && !ori.heroImageUrl) {
      ori.heroImageUrl = va[hk]
    }
    const ck = ori.comparisonImageKey as string | undefined
    if (ck && va[ck] && !ori.comparisonImageUrl) {
      ori.comparisonImageUrl = va[ck]
    }
  }
}

export function prismaMetierToPublic(m: MetierPage): MetierHubPublic {
  return {
    slug: m.slug,
    label: m.label,
    shortDescription: m.shortDescription,
    salary: m.salary,
    employability: m.employability,
    missions: m.missions as string[],
    skills: m.skills as string[],
    career: m.career as { level: string; text: string }[],
    salaryNote: m.salaryNote,
    coverImageUrl: m.coverImageUrl
  }
}

export function diskMetierToPublic(m: MetierSeedRow): MetierHubPublic {
  return {
    slug: m.slug,
    label: m.label,
    shortDescription: m.shortDescription,
    salary: m.salary,
    employability: m.employability,
    missions: m.missions,
    skills: m.skills,
    career: m.career,
    salaryNote: m.salaryNote,
    coverImageUrl: m.coverImageUrl ?? null
  }
}

/** Liste fusionnée pour l’édition admin (fichiers shared + surcharge BDD). */
export function buildAdminSiteContentList(rows: { key: string; payload: unknown }[]) {
  const disk = loadDiskCmsSeed().siteContent
  const dbMap = Object.fromEntries(rows.map((r) => [r.key, r.payload]))
  const merged: Record<string, unknown> = { ...disk }
  for (const key of Object.keys(merged)) {
    if (dbMap[key] !== undefined) {
      merged[key] = mergeContentDeep(merged[key] as Record<string, unknown>, dbMap[key])
    }
  }
  for (const [k, v] of Object.entries(dbMap)) {
    if (!(k in merged)) {
      merged[k] = v
    }
  }
  return Object.keys(merged)
    .sort()
    .map((key) => ({ key, payload: merged[key] }))
}

export async function buildPublicSiteSnapshot(prisma: PrismaClient) {
  const disk = loadDiskCmsSeed()

  const rows = await prisma.siteContent.findMany()
  const dbMap = Object.fromEntries(rows.map((r) => [r.key, r.payload]))

  const mergedContent: Record<string, unknown> = { ...disk.siteContent }
  for (const key of Object.keys(mergedContent)) {
    if (dbMap[key] !== undefined) {
      mergedContent[key] = mergeContentDeep(mergedContent[key] as Record<string, unknown>, dbMap[key])
    }
  }
  for (const [k, v] of Object.entries(dbMap)) {
    if (!(k in mergedContent)) {
      mergedContent[k] = v
    }
  }

  finalizeResolvedUrls(mergedContent)

  const faqRows = await prisma.faqItem.findMany({
    where: { published: true },
    orderBy: { sortOrder: 'asc' }
  })
  const faq =
    faqRows.length > 0
      ? faqRows.map((r) => ({ id: r.id, q: r.question, a: r.answer }))
      : disk.faq.map((x, i) => ({ id: `disk-faq-${i}`, q: x.question, a: x.answer }))

  const testRows = await prisma.testimonialItem.findMany({
    where: { published: true },
    orderBy: { sortOrder: 'asc' }
  })
  const testimonials =
    testRows.length > 0
      ? testRows.map((t) => ({
          id: t.id,
          initials: t.initials ?? t.name.slice(0, 2).toUpperCase(),
          name: t.name,
          role: t.role,
          quote: t.quote,
          avatarUrl: t.avatarUrl
        }))
      : disk.testimonials.map((t, i) => ({
          id: `disk-t-${i}`,
          initials: t.initials ?? t.name.slice(0, 2).toUpperCase(),
          name: t.name,
          role: t.role,
          quote: t.quote,
          avatarUrl: t.avatarUrl ?? null
        }))

  const metierRows = await prisma.metierPage.findMany({
    where: { published: true },
    orderBy: { sortOrder: 'asc' }
  })

  const metiers: MetierHubPublic[] =
    metierRows.length > 0
      ? metierRows.map(prismaMetierToPublic)
      : disk.metiers.map(diskMetierToPublic)

  return {
    content: mergedContent,
    faq,
    testimonials,
    metiers
  }
}

export async function getMetierPublicBySlug(prisma: PrismaClient, slug: string): Promise<MetierHubPublic | null> {
  const row = await prisma.metierPage.findFirst({
    where: { slug, published: true }
  })
  if (row) return prismaMetierToPublic(row)
  const disk = loadDiskCmsSeed().metiers.find((m) => m.slug === slug && m.published)
  return disk ? diskMetierToPublic(disk) : null
}
