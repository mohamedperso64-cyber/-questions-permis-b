#!/usr/bin/env node
/**
 * replace-images.mjs
 * Remplace uniquement les correct.jpg marqués à remplacer,
 * avec des termes de recherche plus précis.
 */

import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
const ROOT       = path.resolve(__dirname, '..')
const DEST       = path.join(ROOT, 'public', 'images', 'questions')

const PEXELS_KEY = process.env.PEXELS_KEY
  || 'oIGRpgsGATlli84h1Bkbb95DIk9xznBakKrB3CKfxiYMTWDnpo7KKP1z'

const DELAY_MS = 400

// Termes de recherche améliorés pour les 46 images à remplacer
const TO_REPLACE = {
  'air-pare-brise':                   'car dashboard hvac windshield defrost button',
  'allumer-brouillard-arriere':       'car fog light switch button interior dashboard close',
  'allumer-feux-route':               'car headlight stalk lever steering column high beam',
  'avertisseur-sonore':               'car horn button center steering wheel close up',
  'certificat-immatriculation':       'vehicle registration card document France grey',
  'constat-amiable':                  'european accident statement form car insurance',
  'degivrage-lunette-arriere':        'rear window demister button car dashboard',
  'desactivation-airbag':             'passenger airbag deactivation key switch car',
  'essuie-glaces-avant':              'windshield wiper stalk lever car steering column close',
  'ethylotest':                       'breathalyzer car kit road safety device',
  'feux-brouillard-arriere-controle': 'rear fog light warning indicator orange dashboard car',
  'feux-croisement':                  'headlight rotary switch car dashboard dipped beam',
  'feux-detresse-controle':           'hazard warning triangle button red dashboard car',
  'feux-diurnes':                     'daytime running lights DRL car front close up',
  'feux-position':                    'parking sidelight switch car dashboard interior',
  'feux-recul':                       'reverse white light car exterior rear',
  'feux-route-controle':              'blue high beam indicator light car dashboard',
  'feux-stop':                        'brake light red stop lamp car exterior rear',
  'isofix':                           'ISOFIX anchor point bracket car rear seat',
  'limiteur-vitesse':                 'speed limiter set button dashboard car steering',
  'recyclage-air':                    'air recirculation button car climate control panel',
  'reglage-appui-tete':               'car seat headrest height adjustment close up',
  'reglage-hauteur-feux':             'headlight beam leveling rotary dial switch car',
  'reglage-volant':                   'steering column tilt telescopic lever adjustment car',
  'retroviseur-nuit':                 'interior rearview mirror anti-dazzle night lever flip',
  'securite-enfant':                  'child safety lock switch car door interior panel',
  'triangle-presignalisation':        'red reflective warning triangle road safety car kit',
  'voyant-defaut-batterie':           'battery warning light red car dashboard instrument',
  'voyant-portiere':                  'door open warning light car dashboard instrument cluster',
  'voyant-pression-huile':            'oil pressure warning light red car dashboard',
  'voyant-pression-pneu':             'TPMS tyre pressure warning light car dashboard',
  'voyant-temperature':               'engine coolant temperature warning light car dashboard',
  'ampoule-arriere':                  'car rear tail light bulb H21W socket close up',
  'ampoule-avant':                    'car headlight H7 bulb replacement halogen',
  'clignotants-trottoir':             'car amber turn signal indicator light flashing',
  'dispositifs-reflechissants':       'car rear reflector red plastic safety bumper',
  'eclairage-plaque':                 'number plate light lamp car rear white',
  'emplacement-batterie':             'car battery 12V engine bay compartment close up',
  'gicleurs-lave-glace':              'windscreen washer jet nozzle car bonnet hood',
  'niveau-huile-moteur':              'engine oil dipstick yellow level check car',
  'niveau-liquide-frein':             'brake fluid reservoir transparent cap level car',
  'plaque-pression-pneu':             'tyre pressure placard sticker car door jamb label',
  'plaques-immatriculation':          'car number plate registration plate close up Europe',
  'remplissage-huile':                'pouring engine oil funnel car motor top up',
  'remplissage-lave-glace':           'filling windshield washer fluid reservoir car blue',
  'remplissage-refroidissement':      'coolant antifreeze reservoir car engine fill cap',
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function searchPexels(query) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`
  try {
    const res  = await fetch(url, { headers: { Authorization: PEXELS_KEY } })
    if (!res.ok) { console.error(`  ⚠ Pexels ${res.status}`); return null }
    const data = await res.json()
    return data.photos?.[0]?.src?.large ?? null
  } catch (e) { console.error(`  ⚠ Réseau : ${e.message}`); return null }
}

async function downloadImage(url, destPath) {
  const res    = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  await fs.writeFile(destPath, buffer)
}

async function main() {
  const keys = Object.keys(TO_REPLACE)
  console.log(`\n🔄  Remplacement de ${keys.length} images\n`)

  let ok = 0, fail = 0

  for (const key of keys) {
    const query = TO_REPLACE[key]
    const dir   = path.join(DEST, key)
    await fs.mkdir(dir, { recursive: true })

    // Supprimer l'ancienne
    const jpg = path.join(dir, 'correct.jpg')
    try { await fs.unlink(jpg) } catch {}

    const imgUrl = await searchPexels(query)
    if (imgUrl) {
      await downloadImage(imgUrl, jpg)
      process.stdout.write(`  ✓  ${key}\n`)
      ok++
    } else {
      process.stdout.write(`  ✗  ${key} — aucun résultat (SVG conservé)\n`)
      fail++
    }

    await sleep(DELAY_MS)
  }

  // Mise à jour des distracteurs pour les clés remplacées
  console.log(`\n── Mise à jour des distracteurs ──`)
  // Recalcule pickDistractors pour les gestes affectés
  const allKeys = (await fs.readdir(DEST)).filter(n => !n.endsWith('.md') && !n.endsWith('.html'))

  function pickDistractors(correctKey, all) {
    // Catégorie basée sur le nom : les gestes extérieurs connus
    const EXT = new Set(['ampoule-arriere','ampoule-avant','balais-essuie-glace','capot-ouverture',
      'clignotants-trottoir','coffre-ouverture','dispositifs-reflechissants','eclairage-plaque',
      'emplacement-batterie','flanc-pneu','gicleurs-lave-glace','niveau-huile-moteur',
      'niveau-liquide-frein','plaque-pression-pneu','plaques-immatriculation','remplissage-huile',
      'remplissage-lave-glace','remplissage-refroidissement','temoin-usure-pneu','trappe-carburant'])
    const cat     = EXT.has(correctKey) ? 'ext' : 'int'
    const samecat = all.filter(k => k !== correctKey && (EXT.has(k) ? 'ext' : 'int') === cat)
    const other   = all.filter(k => k !== correctKey && (EXT.has(k) ? 'ext' : 'int') !== cat)
    const idx     = all.indexOf(correctKey)
    const pool    = [...samecat, ...other]
    return [0, 1, 2].map(i => pool[(idx + i * 7 + 1) % pool.length])
  }

  for (const key of keys) {
    const distKeys = pickDistractors(key, allKeys)
    for (let i = 0; i < 3; i++) {
      const src = path.join(DEST, distKeys[i], 'correct.jpg')
      const dst = path.join(DEST, key, `d${i + 1}.jpg`)
      try { await fs.unlink(dst) } catch {}
      try { await fs.copyFile(src, dst) } catch {}
    }
    process.stdout.write(`  ✓  ${key} — d1/d2/d3\n`)
  }

  console.log(`\n✅  ${ok} images remplacées · ${fail} échecs`)
  console.log(`   Actualise review.html pour vérifier.\n`)
}

main().catch(e => { console.error('❌', e.message); process.exit(1) })
