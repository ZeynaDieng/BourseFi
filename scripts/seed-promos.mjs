import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SEED_PROMOS = [
  {
    code: 'BF100',
    type: 'PERCENTAGE',
    valeur: 100,
    maxUses: null,
    isActive: true,
    expiresAt: null,
  },
  {
    code: 'BF50',
    type: 'PERCENTAGE',
    valeur: 50,
    maxUses: null,
    isActive: true,
    expiresAt: null,
  },
  {
    code: 'RENTREE2026',
    type: 'FIXED',
    valeur: 5000,
    maxUses: 100,
    isActive: true,
    expiresAt: new Date('2026-11-30T23:59:59Z'),
  },
  {
    code: 'AJS2026',
    type: 'PERCENTAGE',
    valeur: 30,
    maxUses: 50,
    isActive: true,
    expiresAt: new Date('2026-12-31T23:59:59Z'),
  }
]

async function seedPromos() {
  console.log('============================================================')
  console.log('INITIALISATION DES CODES PROMO DE DÉMONSTRATION BOURSEFI')
  console.log('============================================================')

  let createdCount = 0
  let updatedCount = 0

  for (const item of SEED_PROMOS) {
    const existing = await prisma.promoCode.findUnique({
      where: { code: item.code }
    })

    if (!existing) {
      await prisma.promoCode.create({
        data: item
      })
      createdCount++
      console.log(`+ Code promo créé : ${item.code} (${item.type === 'PERCENTAGE' ? `-${item.valeur}%` : `-${item.valeur.toLocaleString('fr-FR')} FCFA`})`)
    } else {
      await prisma.promoCode.update({
        where: { id: existing.id },
        data: item
      })
      updatedCount++
      console.log(`~ Code promo mis à jour : ${item.code}`)
    }
  }

  console.log(`\n✔ INITIALISATION TERMINÉE : ${createdCount} créés, ${updatedCount} mis à jour.`)
}

seedPromos()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error('❌ Erreur seed promo codes:', err)
    prisma.$disconnect()
    process.exit(1)
  })
