import fs from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'

// Load .env manually
const envPath = path.resolve(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8')
  envConfig.split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const equalsIdx = trimmed.indexOf('=')
      if (equalsIdx !== -1) {
        const key = trimmed.slice(0, equalsIdx).trim()
        let val = trimmed.slice(equalsIdx + 1).trim()
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1)
        }
        process.env[key] = val
      }
    }
  })
}

const apiKey = process.env.NUXT_BREVO_API_KEY || process.env.BREVO_API_KEY || ''
const host = process.env.SMTP_HOST || ''
const port = Number(process.env.SMTP_PORT || 587)
const user = process.env.SMTP_USER || ''
const pass = process.env.SMTP_PASS || ''
const fromEmail = process.env.EMAIL_FROM || 'no-reply@boursefi.sn'
const fromName = process.env.EMAIL_FROM_NAME || 'BourseFi'

console.log('============================================================')
console.log('DIAGNOSTIC DU SERVICE MAIL BOURSEFI')
console.log('============================================================')
console.log(`- Brevo API Key: ${apiKey ? '✅ Configurée (' + apiKey.slice(0, 12) + '...)' : '❌ Absente'}`)
console.log(`- Host SMTP: ${host || '❌ Absent'}`)
console.log(`- Port SMTP: ${port}`)
console.log(`- User SMTP: ${user || '❌ Absent'}`)
console.log(`- Pass SMTP: ${pass ? '✅ Configuré' : '❌ Absent'}`)
console.log(`- Email Expéditeur (FROM): "${fromName}" <${fromEmail}>`)
console.log('------------------------------------------------------------')

async function runDiagnostic() {
  let brevoOk = false
  let smtpOk = false

  // 1. Test Brevo API
  if (apiKey) {
    console.log('\n[1/2] Test de connexion Brevo via API REST HTTP...')
    try {
      // Test Brevo Account API endpoint to verify key validity
      const accountRes = await fetch('https://api.brevo.com/v3/account', {
        headers: {
          'api-key': apiKey,
          'Accept': 'application/json'
        }
      })

      if (accountRes.ok) {
        const accountData = await accountRes.json()
        console.log('  ✅ Clé API Brevo Valide !')
        console.log(`  👤 Compte: ${accountData.email}`)
        console.log(`  📊 Crédits emails restants: ${JSON.stringify(accountData.plan || {})}`)
        brevoOk = true
      } else {
        const errText = await accountRes.text()
        console.error(`  ❌ Échec validation Brevo API (HTTP ${accountRes.status}):`, errText)
      }
    } catch (err) {
      console.error('  ❌ Erreur de connexion réseau vers api.brevo.com:', err.message)
    }
  } else {
    console.log('\n[1/2] Brevo API REST non configuré (BREVO_API_KEY absent).')
  }

  // 2. Test SMTP Connection
  if (host && user && pass) {
    console.log('\n[2/2] Test de connexion SMTP (Nodemailer verify)...')
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      })

      await transporter.verify()
      console.log('  ✅ Connexion SMTP (Handshake TLS/AUTH) réussie !')
      smtpOk = true
    } catch (err) {
      console.error('  ❌ Échec connexion SMTP:', err.message)
    }
  } else {
    console.log('\n[2/2] Serveur SMTP non configuré.')
  }

  // 3. Test d'envoi réel si demandé
  const testRecipient = process.argv[2]
  if (testRecipient) {
    console.log(`\n[3/3] Envoi d'un email de test réel à : ${testRecipient}...`)
    try {
      const sendRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          sender: { email: fromEmail, name: fromName },
          to: [{ email: testRecipient }],
          subject: '🧪 Email de test - Verification Service BourseFi',
          htmlContent: '<h3>Service Email BourseFi operational !</h3><p>Ceci est un email de test pour verifier que Brevo et BourseFi fonctionnent parfaitement.</p>'
        })
      })

      if (sendRes.ok) {
        const result = await sendRes.json()
        console.log('  🎉 EMAIL ENVOYÉ AVEC SUCCÈS ! ID Message Brevo:', result.messageId)
      } else {
        const errBody = await sendRes.text()
        console.error(`  ❌ Erreur lors de l'envoi de l'email (HTTP ${sendRes.status}):`, errBody)
      }
    } catch (err) {
      console.error("  ❌ Erreur lors de l'envoi de l'email:", err.message)
    }
  } else {
    console.log('\n💡 Pour envoyer un email de test réel, relancez la commande avec un destinataire :')
    console.log('   node scripts/test-email-service.mjs votre-email@exemple.com')
  }

  console.log('\n============================================================')
  if (brevoOk || smtpOk) {
    console.log('RESULTAT GLOBAL: LE SERVICE MAIL EST OPÉRATIONNEL ✅')
  } else {
    console.log('RESULTAT GLOBAL: LE SERVICE MAIL A UN PROBLÈME DE CONFIGURATION ❌')
  }
  console.log('============================================================')
}

runDiagnostic()
