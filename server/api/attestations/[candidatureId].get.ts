import { prisma } from '../../utils/prisma'
import { getSessionUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const candidatureId = getRouterParam(event, 'candidatureId')
  if (!candidatureId) {
    throw createError({ statusCode: 400, statusMessage: 'ID de candidature manquant.' })
  }

  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Non authentifié.' })
  }

  const candidature = await prisma.candidature.findUnique({
    where: { id: candidatureId },
    include: {
      user: true,
      programme: {
        include: {
          etablissement: true,
          tarifs: true,
        },
      },
      bourse: true,
      partner: true,
      paiement: true,
    },
  })

  if (!candidature) {
    throw createError({ statusCode: 404, statusMessage: 'Candidature introuvable.' })
  }

  // Vérification d'accès : Seul le candidat concerné, l'admin ou le partenaire peut accéder à l'attestation
  const isOwner = candidature.userId === user.id
  const isAdmin = user.role === 'ADMIN'
  const isPartner = user.role === 'PARTNER' && user.partnerId === candidature.partnerId

  if (!isOwner && !isAdmin && !isPartner) {
    throw createError({ statusCode: 403, statusMessage: 'Accès non autorisé.' })
  }

  // RÈGLE MÉTIER SÉCURITÉ : L'attestation n'est téléchargeable QUE SI les frais de dossier ont été réglés (ou s'il s'agit d'une formation sans frais de dossier).
  if (isOwner && !isAdmin && !isPartner) {
    const hasPaid = Boolean(candidature.paiement && candidature.paiement.status === 'Valide')
    const catalogFrais = (candidature.programme.fraisDossier !== undefined && candidature.programme.fraisDossier !== null)
      ? candidature.programme.fraisDossier
      : (candidature.programme.etablissement?.fraisDossier ?? 0)

    const effectiveFrais = (candidature.montantFinal !== null && candidature.montantFinal !== undefined)
      ? candidature.montantFinal
      : catalogFrais

    const isPendingPayment = candidature.status === 'EN_ATTENTE_PAIEMENT' || (effectiveFrais > 0 && !hasPaid && candidature.status !== 'DOCUMENT_EMIS' && candidature.status !== 'ACCEPTE')

    if (isPendingPayment) {
      throw createError({
        statusCode: 402,
        statusMessage: 'Veuillez d\'abord régler les frais de dossier pour accéder à votre attestation officielle.',
      })
    }
  }

  // Génération automatique du numéro d'attestation s'il n'existe pas encore
  let attestationNum = candidature.attestationNumber
  if (!attestationNum) {
    attestationNum = `BF-ATT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
    await prisma.candidature.update({
      where: { id: candidature.id },
      data: {
        attestationNumber: attestationNum,
        attestationIssuedAt: new Date(),
      },
    })
  }

  const issueDate = (candidature.attestationIssuedAt || new Date()).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const ecoleName = candidature.programme.etablissement.nom
  const ecoleSlug = candidature.programme.etablissement.slug
  const programmeTitle = candidature.programme.titre
  const niveau = candidature.programme.niveau
  const modalite = candidature.programme.modalites || 'Non précisée'
  const typeBourseLabel = ecoleSlug === 'hecm-dakar' ? 'BOURSE ENTIÈRE' : (ecoleSlug === 'isca' ? 'FORFAIT BOURSE' : (candidature.bourse?.coveragePercent ? `Bourse ${candidature.bourse.coveragePercent}%` : 'Bourse d\'études'))
  const studentName = candidature.fullName || `${candidature.firstName} ${candidature.lastName}`
  const anneeAcademique = candidature.programme.tarifs?.[0]?.anneeAcademique || 'Année académique en cours'
  const isDirect = candidature.programme.etablissement.isDirectPartner

  const formatCurrency = (val: number | null | undefined) =>
    val ? `${val.toLocaleString('fr-FR')} FCFA` : 'N/A'

  // Conversion des assets officiels BourseFi (Logo, Signature, Cachet) en Base64 pour un rendu PDF/print 100% autonome
  let logoSrc = '/boursefi-logo.png'
  let signSrc = '/signature-officielle.png'
  let stampSrc = '/cachet-officiel.png'

  try {
    const fs = await import('node:fs')
    const path = await import('node:path')

    const logoPath = path.resolve(process.cwd(), 'public/boursefi-logo.png')
    if (fs.existsSync(logoPath)) {
      logoSrc = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`
    }

    const signPath = path.resolve(process.cwd(), 'public/signature-officielle.png')
    if (fs.existsSync(signPath)) {
      signSrc = `data:image/png;base64,${fs.readFileSync(signPath).toString('base64')}`
    }

    const stampPath = path.resolve(process.cwd(), 'public/cachet-officiel.png')
    if (fs.existsSync(stampPath)) {
      stampSrc = `data:image/png;base64,${fs.readFileSync(stampPath).toString('base64')}`
    }
  } catch {
    // Fallback
  }

  // Rendu HTML imprimable / PDF — modèle institutionnel BourseFi
  setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8')

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Attestation de Bourse - ${attestationNum}</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

    html, body {
      margin: 0; padding: 0; width: 100%; min-height: 100%;
      font-family: Arial, Helvetica, sans-serif; color: #27364D; background: #EEF2F6;
    }
    body { display:flex; flex-direction:column; align-items:center; }

    .no-print-bar {
      width:210mm; display:flex; justify-content:space-between; align-items:center;
      padding:12px 14mm; margin:10px 0 0;
    }
    .btn-back { color:#475569; text-decoration:none; font-size:13px; font-weight:700; }
    .btn-print { border:0; border-radius:7px; padding:10px 18px; background:#123A72; color:#fff; font-size:13px; font-weight:800; cursor:pointer; }

    .a4-page {
      position:relative; width:210mm; height:297mm; margin:0 auto 24px;
      padding:13mm 15mm 11mm; background:#fff; overflow:hidden;
      box-shadow:0 16px 35px rgba(15,23,42,.12);
    }
    .outer-border,.inner-border { position:absolute; pointer-events:none; z-index:1; }
    .outer-border { inset:6mm; border:1.5px solid #123A72; }
    .inner-border { inset:7.5mm; border:.7px solid #D6A21D; }

    .content-wrapper {
      position:relative; z-index:2; height:100%; padding:2mm 4mm 0;
      display:flex; flex-direction:column; justify-content:space-between;
    }

    .header { text-align:center; }
    .header-logo { display:flex; flex-direction:column; align-items:center; }
    .header-logo img {
      display:block; width:auto; height:27mm; max-width:72mm; object-fit:contain;
    }
    .header-subtext {
      margin-top:1mm; color:#64748B; font-size:9.5px; font-weight:700;
      letter-spacing:1.6px; text-transform:uppercase;
    }
    .meta-bar {
      margin-top:5mm; padding:0 1mm 3mm; display:grid;
      grid-template-columns:1fr 1fr; column-gap:15mm; border-bottom:1px solid #CBD5E1;
    }
    .meta-item:last-child { text-align:right; }
    .meta-label { color:#64748B; font-size:8.5px; font-weight:800; letter-spacing:1px; text-transform:uppercase; }
    .meta-value { margin-top:1.2mm; color:#0B2C57; font-size:12px; font-weight:800; }

    .title-block { text-align:center; margin:6mm 0 3mm; }
    .doc-title {
      margin:0; color:#123A72; font-family:Georgia,"Times New Roman",serif;
      font-size:24px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase;
    }
    .title-line { width:34mm; height:1.2px; margin:2.5mm auto 0; background:#D6A21D; }

    .intro-text {
      width:93%; margin:3mm auto 4mm; text-align:center;
      color:#3F4C5F; font-family:Georgia,"Times New Roman",serif;
      font-size:11.5px; line-height:1.55;
    }

    .beneficiary-card {
      margin:0 0 4mm; padding:4mm 5mm 5mm; background:#F8FAFC;
      border:1px solid #DCE3EC; border-radius:3mm;
    }
    .card-header { margin-bottom:4mm; padding-bottom:2mm; border-bottom:1px dashed #C8D2DE; }
    .card-header-title { margin:0; color:#123A72; font-size:10.5px; font-weight:800; letter-spacing:1px; text-transform:uppercase; }
    .card-header-accent { width:35mm; height:1.1px; margin-top:1.8mm; background:#D6A21D; }

    .info-grid {
      display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr);
      column-gap:12mm; row-gap:4mm;
    }
    .info-group { min-width:0; }
    .info-label {
      margin-bottom:1mm; color:#68758A; font-size:8.5px; font-weight:800;
      letter-spacing:.75px; text-transform:uppercase;
    }
    .info-val {
      max-width:100%; color:#1F2D40; font-size:11.5px; font-weight:700;
      line-height:1.35; overflow-wrap:anywhere; word-break:break-word;
    }

    .decision-box {
      margin:0 0 4mm; padding:4mm 5mm; text-align:center;
      background:#FBF6E8; border:1px solid #E5CE8B; border-radius:3mm;
    }
    .decision-sub { color:#0B2C57; font-size:8.5px; font-weight:800; letter-spacing:1.1px; text-transform:uppercase; }
    .decision-main {
      margin:1.5mm 0 1mm; color:#C28F0E; font-family:Georgia,"Times New Roman",serif;
      font-size:19px; font-weight:700; letter-spacing:.7px; text-transform:uppercase;
    }
    .decision-desc { margin:0; color:#68758A; font-size:9.5px; }

    .admin-formula {
      width:93%; margin:0 auto; text-align:center; color:#4B5563;
      font-family:Georgia,"Times New Roman",serif; font-size:11px; line-height:1.5;
    }

    .signature-section { margin-top:4mm; padding-top:3mm; border-top:1px solid #D8E0EA; }
    .signature-grid {
      display:grid; grid-template-columns:1fr 1fr; align-items:end;
      column-gap:12mm; min-height:30mm;
    }
    .signatory { padding-left:2mm; }
    .sign-title { margin:0; color:#0B2C57; font-size:11.5px; font-weight:800; }
    .sign-sub { margin-top:1mm; color:#68758A; font-size:8.5px; line-height:1.4; }
    .signature-image {
      display:block; width:auto; height:18mm; max-width:48mm; margin-top:1mm;
      object-fit:contain; object-position:left bottom;
    }
    .stamp-wrapper { display:flex; justify-content:flex-end; align-items:flex-end; min-height:30mm; padding-right:2mm; }
    .stamp-image { display:block; width:32mm; height:32mm; object-fit:contain; transform:rotate(-3deg); }

    .doc-footer {
      margin-top:4mm; padding:2.5mm 3mm; text-align:center; color:#fff; background:#0B2C57;
      border-radius:1mm; font-size:8.5px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase;
    }

    @media print {
      html,body { width:210mm!important; height:297mm!important; min-height:297mm!important; background:#fff!important; overflow:hidden!important; }
      .no-print-bar { display:none!important; }
      .a4-page {
        width:210mm!important; height:297mm!important; margin:0!important;
        padding:13mm 15mm 11mm!important; box-shadow:none!important;
        page-break-after:avoid!important; page-break-inside:avoid!important; overflow:hidden!important;
      }
    }
</style>
</head>
<body>

  <div class="no-print-bar">
    <a href="/etudiant/documents" class="btn-back">← Retour à mes documents</a>
    <button onclick="window.print()" class="btn-print">🖨️ Télécharger en PDF / Imprimer</button>
  </div>

  <main class="a4-page">
    <div class="outer-border"></div>
    <div class="inner-border"></div>

    <div class="content-wrapper">
      <div class="document-body">

        <header class="header">
          <div class="header-logo">
            <img src="${logoSrc}" alt="Logo BourseFi" />
            <div class="header-subtext">Plateforme de gestion de bourses</div>
          </div>

          <div class="meta-bar">
            <div class="meta-item">
              <div class="meta-label">Référence</div>
              <div class="meta-value">${attestationNum}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Date d’émission</div>
              <div class="meta-value">${issueDate}</div>
            </div>
          </div>
        </header>

        <section class="title-block">
          <h1 class="doc-title">Attestation de Bourse</h1>
          <div class="title-line"></div>
        </section>

        <div class="intro-text">
          BourseFi Sénégal atteste par la présente que l’étudiant(e) désigné(e) ci-dessous
          a été admis(e) dans le cadre de son programme de bourses et bénéficie d’une
          bourse d’études auprès de l’établissement partenaire indiqué dans le présent document.
        </div>

        <section class="beneficiary-card">
          <div class="card-header">
            <div class="card-header-title">Informations du bénéficiaire</div>
            <div class="card-header-accent"></div>
          </div>

          <div class="info-grid">
            <div class="info-group">
              <div class="info-label">Bénéficiaire</div>
              <div class="info-val">${studentName}</div>
            </div>

            <div class="info-group">
              <div class="info-label">Contact</div>
              <div class="info-val">${candidature.email} | ${candidature.phone || 'N/A'}</div>
            </div>

            <div class="info-group">
              <div class="info-label">Établissement d’accueil</div>
              <div class="info-val">${ecoleName}</div>
            </div>

            <div class="info-group">
              <div class="info-label">Formation</div>
              <div class="info-val">${programmeTitle}</div>
            </div>

            <div class="info-group">
              <div class="info-label">Niveau &amp; Modalité</div>
              <div class="info-val">${niveau} (${modalite})</div>
            </div>

            <div class="info-group">
              <div class="info-label">Type de Bourse</div>
              <div class="info-val" style="color: #C28F0E; font-weight: 800;">${typeBourseLabel}</div>
            </div>

            <div class="info-group">
              <div class="info-label">Année académique</div>
              <div class="info-val">${anneeAcademique}</div>
            </div>
          </div>
        </section>

        <section class="decision-box">
          <div class="decision-sub">Décision de bourse</div>
          <div class="decision-main">${typeBourseLabel} ACCORDÉE</div>
          <p class="decision-desc">Dans le cadre du programme de bourses BourseFi Sénégal.</p>
        </section>

        <div class="admin-formula">
          La présente attestation est délivrée à l’intéressé(e) pour servir et valoir ce que de droit
          auprès du service des inscriptions et de la scolarité de <strong>${ecoleName}</strong>.
        </div>
      </div>

      <section class="signature-section">
        <div class="signature-grid">
          <div class="signatory">
            <p class="sign-title">La Directrice</p>
            <div class="sign-sub">Direction des Admissions &amp; Bourses<br>BourseFi Sénégal</div>
            <img class="signature-image" src="${signSrc}" alt="Signature officielle" />
          </div>

          <div class="stamp-wrapper">
            <img class="stamp-image" src="${stampSrc}" alt="Cachet officiel" />
          </div>
        </div>

        <div class="doc-footer">
          BourseFi Sénégal • Plateforme de gestion de bourses
        </div>
      </section>
    </div>
  </main>

</body>
</html>`
})
