/**
 * V5 — Fuite de champs internes dans `/api/bourses` et `/api/etablissements`.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { resetEnv, db, call, createUser, sessionCookieFor } from '../helpers/server'

const NOW = new Date('2026-01-01T00:00:00Z')

function contact(over: Record<string, unknown> = {}) {
  return {
    id: 'ct1', etablissementId: 'et1', type: 'PHONE', valeur: '+221330000000', label: 'Accueil',
    isPrincipal: true, isWhatsapp: false, status: 'TO_VERIFY', source: 'OFFICIAL_WEBSITE',
    isActive: true, createdAt: NOW, updatedAt: NOW, ...over,
  }
}

function etab(over: Record<string, unknown> = {}) {
  return {
    id: 'et1', slug: 'ecole-test', nom: 'École Test', ville: 'Dakar', adresse: 'Plateau', accreditation: 'ANAQ',
    site: 'https://ecole.test', phone: '+221330000000', phoneSecondary: null, whatsapp: null, email: 'contact@ecole.test',
    status: 'ACTIVE', contactStatus: 'VERIFIED', contactVerifiedAt: NOW, source: 'Scraping interne v2',
    isDirectPartner: true, fraisDossier: 10000, resume: 'Résumé', coverImageUrl: '/c.jpg', logoUrl: '/l.png',
    typeLabel: 'Privé', notesInternes: 'commission 12 %', commissionRate: 12, createdAt: NOW, updatedAt: NOW,
    contacts: [contact()],
    programmes: [{
      slug: 'licence-info', titre: 'Licence Info', fraisDossier: 15000, fraisDossierEtranger: null, devise: 'FCFA',
      duree: '3 ans', niveau: 'Licence', placement: '85%', partner: { name: 'Partenaire A', slug: 'pa' }, bourses: [{ id: 'b1' }],
    }],
    ...over,
  }
}

function bourse(over: Record<string, unknown> = {}) {
  return {
    id: 'b1', slug: 'bourse-licence-info', titre: 'Bourse Licence Info', programmeId: 'prog1', partnerId: 'partner-secret-id',
    coveragePercent: 50, montantMax: 500000, quota: 20, placesRestantes: 7, dateDebut: NOW, dateLimite: new Date('2026-12-31'),
    conditions: 'Bac', documentsRequis: 'CNI', metaTitle: null, metaDescription: null, ogImageUrl: null,
    isActive: true, status: 'ACTIVE', createdAt: NOW, updatedAt: NOW,
    programme: {
      slug: 'licence-info', titre: 'Licence Info', ville: 'Dakar', duree: '3 ans', niveau: 'Licence', placement: '85%',
      description: 'Desc', eligibilite: null, brochureUrl: null, perspectives: null, objectifs: null, competences: null,
      programmePedagogique: null, debouches: null, secteurs: null, conditionsAdmission: null, documentsRequis: null,
      modalites: null, stage: null, examens: null, poursuiteEtudes: null, sourceType: 'SCRAPED',
      sourceUrl: 'https://intranet.boursefi.local/import/42', verifiedAt: NOW, metaTitle: null, metaDescription: null,
      ogImageUrl: null, fraisDossier: 15000, fraisDossierEtranger: null, devise: 'FCFA', status: 'ACTIVE',
      tarifs: [{
        id: 't1', anneeAcademique: '2026-2027', montant: 1000000, montantBourse: 500000, fraisInscription: 50000,
        mensualite: 100000, nombreMois: 10, fraisSoutenance: null, fraisUniforme: null, autresFrais: null,
        frequence: 'ANNUEL', devise: 'FCFA', label: null, isDefault: true, isVerified: false, status: 'ACTIVE',
        programmeId: 'prog1', createdAt: NOW, updatedAt: NOW, notes: 'négocié -20 %',
      }],
      etablissement: { ...etab(), contacts: [contact(), contact({ id: 'ct2', isActive: false, valeur: 'perso@interne' })] },
    },
    partner: { id: 'partner-secret-id', name: 'Partenaire A', slug: 'pa', logoUrl: null, commissionRate: 15, email: 'compta@partner.test' },
    ...over,
  }
}

const FORBIDDEN = [
  'partnerId', 'contactVerifiedAt', 'etablissementContactVerifiedAt', 'source', 'sourceType', 'sourceUrl',
  'programmeSourceType', 'programmeSourceUrl', 'verifiedAt', 'isVerified', 'createdAt', 'updatedAt', 'etablissementId',
  'notesInternes', 'notes', 'commissionRate', 'placesRestantes', 'passwordHash', 'status',
]

function collectKeys(v: unknown, acc = new Set<string>()): Set<string> {
  if (Array.isArray(v)) v.forEach((x) => collectKeys(x, acc))
  else if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v)) { acc.add(k); collectKeys(x, acc) }
  }
  return acc
}

describe('V5 — API publiques : liste blanche des champs', () => {
  beforeEach(() => {
    resetEnv()
    db().bourses.push(bourse(), bourse({ id: 'b2', slug: 'bourse-inactive', isActive: false, status: 'INACTIVE' }))
    db().etablissements.push(etab(), etab({ id: 'et2', slug: 'ecole-archivee', status: 'ARCHIVED' }))
  })

  it('V5.1 /api/bourses ne contient aucun champ interne', async () => {
    const r = await call('GET', '/api/bourses')
    expect(r.status).toBe(200)
    const keys = collectKeys(r.body)
    for (const k of FORBIDDEN) expect(keys.has(k), `champ interne "${k}" exposé`).toBe(false)
    expect(r.rawBody).not.toContain('intranet.boursefi.local')
    expect(r.rawBody).not.toContain('perso@interne') // contact inactif
  })

  it('V5.2 /api/bourses conserve les données nécessaires à l’interface publique', async () => {
    const r = await call('GET', '/api/bourses')
    const b = r.body[0]
    for (const k of ['id', 'slug', 'titre', 'programmeId', 'programmeSlug', 'etablissement', 'etablissementSlug',
      'partnerName', 'ville', 'coveragePercent', 'fraisDossier', 'devise', 'dateLimite', 'isActive', 'tarifs', 'quota']) {
      expect(b, k).toHaveProperty(k)
    }
    expect(b.tarifs[0]).toMatchObject({ id: 't1', montant: 1000000, anneeAcademique: '2026-2027', isDefault: true })
  })

  it('V5.3 /api/bourses/[slug] applique la même liste blanche', async () => {
    const r = await call('GET', '/api/bourses/bourse-licence-info')
    expect(r.status).toBe(200)
    const keys = collectKeys(r.body)
    for (const k of FORBIDDEN) expect(keys.has(k), k).toBe(false)
    expect(r.body.slug).toBe('bourse-licence-info')
  })

  it('V5.4 /api/etablissements ne contient aucun champ interne', async () => {
    const r = await call('GET', '/api/etablissements')
    expect(r.status).toBe(200)
    const keys = collectKeys(r.body)
    for (const k of FORBIDDEN) expect(keys.has(k), `champ interne "${k}" exposé`).toBe(false)
    expect(r.rawBody).not.toContain('commission 12')
    expect(r.rawBody).not.toContain('Scraping interne')
  })

  it('V5.5 /api/etablissements conserve les données publiques (cartes, contacts, programmes)', async () => {
    const r = await call('GET', '/api/etablissements')
    const e = r.body[0]
    for (const k of ['id', 'slug', 'nom', 'ville', 'logoUrl', 'coverImageUrl', 'isDirectPartner', 'contactStatus',
      'formationsCount', 'boursesCount', 'tauxInsertion', 'partenairePrincipal', 'programmes', 'contacts']) {
      expect(e, k).toHaveProperty(k)
    }
    expect(e.contacts[0]).toEqual({ type: 'PHONE', valeur: '+221330000000', label: 'Accueil', isPrincipal: true, isWhatsapp: false })
    expect(e.programmes[0]).toMatchObject({ slug: 'licence-info', titre: 'Licence Info', fraisDossier: 15000 })
  })

  it('V5.6 ?active=false anonyme ne révèle pas les éléments inactifs / archivés', async () => {
    const b = await call('GET', '/api/bourses?active=false')
    expect(b.body.map((x: any) => x.slug)).not.toContain('bourse-inactive')
    const e = await call('GET', '/api/etablissements?active=false')
    expect(e.body.map((x: any) => x.slug)).not.toContain('ecole-archivee')
  })

  it('V5.7 ?active=false reste disponible pour un administrateur', async () => {
    const admin = await createUser({ email: 'admin.v5@example.test', role: 'ADMIN' })
    const cookie = await sessionCookieFor(admin.id)
    const b = await call('GET', '/api/bourses?active=false', { cookie })
    expect(b.body.map((x: any) => x.slug)).toContain('bourse-inactive')
  })
})
