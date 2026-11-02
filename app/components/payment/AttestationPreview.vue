<script setup lang="ts">
/**
 * Aperçu verrouillé de l'attestation, affiché avant paiement.
 * Reproduit à l'identique la mise en page de server/api/attestations/[candidatureId].get.ts,
 * réduite à la largeur disponible. Seuls nom, e-mail et téléphone sont réels :
 * toutes les autres valeurs sont factices (aucune donnée réelle n'est envoyée au navigateur)
 * et la signature / le cachet officiels ne sont jamais chargés.
 */
const props = defineProps<{
  fullName: string
  email: string
  phone?: string | null
}>()

// Largeur d'une page A4 (210mm) en px CSS
const A4_WIDTH_PX = 793.7

const frameRef = ref<HTMLElement | null>(null)
const scale = ref(0)
let observer: ResizeObserver | undefined

function updateScale() {
  const width = frameRef.value?.clientWidth ?? 0
  scale.value = width / A4_WIDTH_PX
}

onMounted(() => {
  updateScale()
  if (typeof ResizeObserver !== 'undefined' && frameRef.value) {
    observer = new ResizeObserver(updateScale)
    observer.observe(frameRef.value)
  }
})

onUnmounted(() => observer?.disconnect())

const contact = computed(() => `${props.email} | ${props.phone || 'N/A'}`)
</script>

<template>
  <div ref="frameRef" class="preview-frame" aria-hidden="true">
    <div class="a4-page" :style="{ transform: `scale(${scale})`, visibility: scale > 0 ? 'visible' : 'hidden' }">
      <div class="outer-border" />
      <div class="inner-border" />
      <div class="content-wrapper">
        <div class="document-body">
          <header class="header">
            <div class="header-logo">
              <img src="/boursefi-logo.png" alt="" />
              <div class="header-subtext">Plateforme de gestion de bourses</div>
            </div>
            <div class="meta-bar veil">
              <div class="meta-item">
                <div class="meta-label">Référence</div>
                <div class="meta-value">BF-ATT-XXXX-XXXXXX</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Date d’émission</div>
                <div class="meta-value">XX xxxxxxx XXXX</div>
              </div>
            </div>
          </header>
          <section class="title-block">
            <h1 class="doc-title">Attestation de Bourse</h1>
            <div class="title-line" />
          </section>
          <div class="intro-text veil">
            Xxxxxxxx Xxxxxxx xxxxxxx xxx xx xxxxxxxx xxx x’xxxxxxxx(x) xxxxxxx(x) xx-xxxxxxx
            x xxx xxxxx(x) xxxx xx xxxxx xx xxx xxxxxxxxx xx xxxxxxx xx xxxxxxxx x’xxx
            xxxxxx x’xxxxxx xxxxxx xx x’xxxxxxxxxxxxx xxxxxxxxxx xxxxxxx xxxx xx xxxxxxx xxxxxxxx.
          </div>
          <section class="beneficiary-card">
            <div class="card-header">
              <div class="card-header-title">Informations du bénéficiaire</div>
              <div class="card-header-accent" />
            </div>
            <div class="info-grid">
              <div class="info-group">
                <div class="info-label">Bénéficiaire</div>
                <div class="info-val">{{ fullName }}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Contact</div>
                <div class="info-val">{{ contact }}</div>
              </div>
              <div class="info-group veil">
                <div class="info-label">Établissement d’accueil</div>
                <div class="info-val">Xxxxx Xxxxxxxxx xx Xxxxxxx</div>
              </div>
              <div class="info-group veil">
                <div class="info-label">Formation</div>
                <div class="info-val">Xxxxxxx xx Xxxxxxx Xxxxxxxx</div>
              </div>
              <div class="info-group veil">
                <div class="info-label">Niveau &amp; Modalité</div>
                <div class="info-val">Xxxxxxx (Xxxxxxxxx)</div>
              </div>
              <div class="info-group veil">
                <div class="info-label">Type de Bourse</div>
                <div class="info-val" style="color: #C28F0E; font-weight: 800;">Xxxxxx XX%</div>
              </div>
              <div class="info-group veil">
                <div class="info-label">Année académique</div>
                <div class="info-val">XXXX-XXXX</div>
              </div>
            </div>
          </section>
          <section class="decision-box veil">
            <div class="decision-sub">Xxxxxxxx xx xxxxxx</div>
            <div class="decision-main">XXXXXX XXX XXXXXXXX</div>
            <p class="decision-desc">Xxxx xx xxxxx xx xxxxxxxxx xx xxxxxxx XxxxxxXx Xxxxxxx.</p>
          </section>
          <div class="admin-formula veil">
            Xx xxxxxxxx xxxxxxxxxxx xxx xxxxxxxx x x’xxxxxxxx(x) xxxx xxxxxx xx xxxxxx xx xxx xx xxxxx
            xxxxxx xx xxxxxxx xxx xxxxxxxxxxxx xx xx xx xxxxxxxx xx <strong>Xxxxx Xxxxxxxxx</strong>.
          </div>
        </div>
        <section class="signature-section">
          <div class="signature-grid veil">
            <div class="signatory">
              <p class="sign-title">Xx Xxxxxxxxx</p>
              <div class="sign-sub">Xxxxxxxxx xxx Xxxxxxxxxx &amp; Xxxxxxx<br>XxxxxxXx Xxxxxxx</div>
              <div class="signature-placeholder" />
            </div>
            <div class="stamp-wrapper">
              <div class="stamp-placeholder" />
            </div>
          </div>
          <div class="doc-footer">BourseFi Sénégal • Plateforme de gestion de bourses</div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles repris de server/api/attestations/[candidatureId].get.ts — ne pas diverger du modèle */
.preview-frame {
  position: relative; width: 100%; aspect-ratio: 210 / 297; overflow: hidden;
  background: #fff; user-select: none; pointer-events: none;
}
.preview-frame * { box-sizing: border-box; }
.veil { filter: blur(6px); }
.a4-page {
  position: absolute; top: 0; left: 0; transform-origin: 0 0;
  width: 210mm; height: 297mm; padding: 13mm 15mm 11mm;
  background: #fff; overflow: hidden;
  font-family: Arial, Helvetica, sans-serif; color: #27364D;
}
.outer-border, .inner-border { position: absolute; pointer-events: none; z-index: 1; }
.outer-border { inset: 6mm; border: 1.5px solid #123A72; }
.inner-border { inset: 7.5mm; border: .7px solid #D6A21D; }
.content-wrapper {
  position: relative; z-index: 2; height: 100%; padding: 2mm 4mm 0;
  display: flex; flex-direction: column; justify-content: space-between;
}
.header { text-align: center; }
.header-logo { display: flex; flex-direction: column; align-items: center; }
.header-logo img { display: block; width: auto; height: 27mm; max-width: 72mm; object-fit: contain; }
.header-subtext {
  margin-top: 1mm; color: #64748B; font-size: 9.5px; font-weight: 700;
  letter-spacing: 1.6px; text-transform: uppercase;
}
.meta-bar {
  margin-top: 5mm; padding: 0 1mm 3mm; display: grid;
  grid-template-columns: 1fr 1fr; column-gap: 15mm; border-bottom: 1px solid #CBD5E1; text-align: left;
}
.meta-item:last-child { text-align: right; }
.meta-label { color: #64748B; font-size: 8.5px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
.meta-value { margin-top: 1.2mm; color: #0B2C57; font-size: 12px; font-weight: 800; }
.title-block { text-align: center; margin: 6mm 0 3mm; }
.doc-title {
  margin: 0; color: #123A72; font-family: Georgia, "Times New Roman", serif;
  font-size: 24px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase;
}
.title-line { width: 34mm; height: 1.2px; margin: 2.5mm auto 0; background: #D6A21D; }
.intro-text {
  width: 93%; margin: 3mm auto 4mm; text-align: center;
  color: #3F4C5F; font-family: Georgia, "Times New Roman", serif;
  font-size: 11.5px; line-height: 1.55;
}
.beneficiary-card {
  margin: 0 0 4mm; padding: 4mm 5mm 5mm; background: #F8FAFC;
  border: 1px solid #DCE3EC; border-radius: 3mm;
}
.card-header { margin-bottom: 4mm; padding-bottom: 2mm; border-bottom: 1px dashed #C8D2DE; }
.card-header-title { margin: 0; color: #123A72; font-size: 10.5px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
.card-header-accent { width: 35mm; height: 1.1px; margin-top: 1.8mm; background: #D6A21D; }
.info-grid {
  display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  column-gap: 12mm; row-gap: 4mm;
}
.info-group { min-width: 0; }
.info-label {
  margin-bottom: 1mm; color: #68758A; font-size: 8.5px; font-weight: 800;
  letter-spacing: .75px; text-transform: uppercase;
}
.info-val {
  max-width: 100%; color: #1F2D40; font-size: 11.5px; font-weight: 700;
  line-height: 1.35; overflow-wrap: anywhere; word-break: break-word;
}
.decision-box {
  margin: 0 0 4mm; padding: 4mm 5mm; text-align: center;
  background: #FBF6E8; border: 1px solid #E5CE8B; border-radius: 3mm;
}
.decision-sub { color: #0B2C57; font-size: 8.5px; font-weight: 800; letter-spacing: 1.1px; text-transform: uppercase; }
.decision-main {
  margin: 1.5mm 0 1mm; color: #C28F0E; font-family: Georgia, "Times New Roman", serif;
  font-size: 19px; font-weight: 700; letter-spacing: .7px; text-transform: uppercase;
}
.decision-desc { margin: 0; color: #68758A; font-size: 9.5px; }
.admin-formula {
  width: 93%; margin: 0 auto; text-align: center; color: #4B5563;
  font-family: Georgia, "Times New Roman", serif; font-size: 11px; line-height: 1.5;
}
.signature-section { margin-top: 4mm; padding-top: 3mm; border-top: 1px solid #D8E0EA; }
.signature-grid {
  display: grid; grid-template-columns: 1fr 1fr; align-items: end;
  column-gap: 12mm; min-height: 30mm;
}
.signatory { padding-left: 2mm; }
.sign-title { margin: 0; color: #0B2C57; font-size: 11.5px; font-weight: 800; }
.sign-sub { margin-top: 1mm; color: #68758A; font-size: 8.5px; line-height: 1.4; }
.signature-placeholder { width: 40mm; height: 18mm; margin-top: 1mm; border-bottom: 2px solid #94A3B8; }
.stamp-wrapper { display: flex; justify-content: flex-end; align-items: flex-end; min-height: 30mm; padding-right: 2mm; }
.stamp-placeholder { width: 30mm; height: 30mm; border: 3px solid #94A3B8; border-radius: 999px; }
.doc-footer {
  margin-top: 4mm; padding: 2.5mm 3mm; text-align: center; color: #fff; background: #0B2C57;
  border-radius: 1mm; font-size: 8.5px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase;
}
</style>
