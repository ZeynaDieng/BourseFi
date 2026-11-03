/**
 * Aperçu flouté de l'attestation, à insérer dans les emails d'un dossier en attente de paiement.
 * Image générique (public/emails/apercu-attestation.jpg) : aucune donnée réelle, ni signature ni cachet.
 */
export function attestationPreviewEmailHtml(siteUrl: string): string {
  const src = `${siteUrl.replace(/\/+$/, '')}/emails/apercu-attestation.jpg`
  return `<div style="text-align:center;margin:20px 0;">
  <img src="${src}" width="240" alt="Aperçu de votre attestation" style="display:inline-block;width:240px;max-width:100%;height:auto;border:0;border-radius:8px;" />
  <p style="margin:8px 0 0;color:#64748b;font-size:12px;">Votre attestation complète est débloquée dès le paiement des frais de dossier.</p>
</div>`
}
