import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Masters -> 50%
  await prisma.bourse.updateMany({
    where: {
      programme: {
        niveau: {
          contains: 'Master',
          mode: 'insensitive'
        }
      }
    },
    data: {
      coveragePercent: 50
    }
  })

  // Tous les autres -> 100%
  await prisma.bourse.updateMany({
    where: {
      NOT: {
        programme: {
          niveau: {
            contains: 'Master',
            mode: 'insensitive'
          }
        }
      }
    },
    data: {
      coveragePercent: 100
    }
  })

  console.log('Pourcentages mis à jour.')
}

main()
  .finally(() => prisma.$disconnect())