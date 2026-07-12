import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

async function main() {
  const programmes = await prisma.programme.findMany()

  for (const programme of programmes) {
    const nouveauSlug = slugify(programme.slug)

    if (nouveauSlug !== programme.slug) {
      console.log(`${programme.slug} -> ${nouveauSlug}`)

      await prisma.programme.update({
        where: { id: programme.id },
        data: { slug: nouveauSlug },
      })

      await prisma.bourse.updateMany({
        where: {
          programmeId: programme.id,
        },
        data: {
          slug: `bourse-${nouveauSlug}`,
        },
      })
    }
  }

  console.log('Slugs mis à jour.')
}

main()
  .finally(() => prisma.$disconnect())