#!/usr/bin/env node
/**
 * fetch-pexels-images.mjs
 *
 * Remplace les placeholders SVG par de vraies photos Pexels.
 *
 * Stratégie :
 *   Phase 1 — 59 requêtes API, une par geste → correct.jpg
 *   Phase 2 — les distracteurs (d1/d2/d3) sont des copies des correct.jpg
 *             d'autres gestes de la même catégorie → 0 requête supplémentaire
 *
 * Coût total : 59 requêtes (limite Pexels : 200/h).
 * Délai : 400 ms entre requêtes → durée totale ≈ 4 minutes.
 *
 * Usage : node scripts/fetch-pexels-images.mjs
 *         PEXELS_KEY=xxx node scripts/fetch-pexels-images.mjs
 */

import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
const ROOT       = path.resolve(__dirname, '..')
const DEST       = path.join(ROOT, 'public', 'images', 'questions')

// Clé API — passer en variable d'env pour ne pas committer en clair
const PEXELS_KEY = process.env.PEXELS_KEY
  || 'oIGRpgsGATlli84h1Bkbb95DIk9xznBakKrB3CKfxiYMTWDnpo7KKP1z'

const DELAY_MS = 400   // ≈ 150 req/min, sous la limite Pexels de 200/h

// ===================================================================
// Termes de recherche Pexels (anglais — meilleure couverture)
// cat: 'int' = vérification intérieure  |  'ext' = extérieure
// ===================================================================

const GESTES = {
  // --- Intérieur (VI) ---
  'actionner-feux-detresse':          { q: 'hazard warning lights button car dashboard',          cat: 'int' },
  'air-pare-brise':                   { q: 'car defroster windshield button dashboard interior',  cat: 'int' },
  'allumer-brouillard-arriere':       { q: 'fog light switch car interior dashboard',             cat: 'int' },
  'allumer-feux-route':               { q: 'high beam headlight switch car dashboard',            cat: 'int' },
  'attestation-assurance':            { q: 'car insurance document certificate paper',            cat: 'int' },
  'avertisseur-sonore':               { q: 'car horn button steering wheel close up',             cat: 'int' },
  'certificat-immatriculation':       { q: 'vehicle registration document card',                 cat: 'int' },
  'constat-amiable':                  { q: 'car accident report form pen writing',                cat: 'int' },
  'degivrage-lunette-arriere':        { q: 'rear window defrost heater car dashboard button',     cat: 'int' },
  'desactivation-airbag':             { q: 'airbag deactivation switch car passenger seat',       cat: 'int' },
  'essuie-glace-arriere':             { q: 'rear windshield wiper lever car interior',            cat: 'int' },
  'essuie-glaces-avant':              { q: 'windshield wiper stalk car steering column',          cat: 'int' },
  'ethylotest':                       { q: 'breathalyzer device alcohol test car safety',         cat: 'int' },
  'feux-brouillard-arriere-controle': { q: 'fog light indicator lamp dashboard car',              cat: 'int' },
  'feux-croisement':                  { q: 'headlight dipped beam switch car dashboard',          cat: 'int' },
  'feux-detresse-controle':           { q: 'hazard lights warning triangle indicator car',        cat: 'int' },
  'feux-diurnes':                     { q: 'daytime running lights DRL switch car dashboard',     cat: 'int' },
  'feux-position':                    { q: 'parking sidelights switch car dashboard',             cat: 'int' },
  'feux-recul':                       { q: 'reverse gear car interior gearshift',                 cat: 'int' },
  'feux-route-controle':              { q: 'high beam blue indicator light car dashboard',        cat: 'int' },
  'feux-stop':                        { q: 'brake pedal car interior close up',                   cat: 'int' },
  'gilet-visibilite':                 { q: 'high visibility safety vest reflective yellow',       cat: 'int' },
  'indicateur-carburant':             { q: 'fuel gauge car dashboard level indicator',            cat: 'int' },
  'isofix':                           { q: 'ISOFIX child seat anchor car rear seat',              cat: 'int' },
  'limiteur-vitesse':                 { q: 'speed limiter cruise control car dashboard switch',   cat: 'int' },
  'recyclage-air':                    { q: 'air recirculation ventilation button car interior',   cat: 'int' },
  'reglage-appui-tete':               { q: 'car headrest adjustment seat close up',               cat: 'int' },
  'reglage-hauteur-feux':             { q: 'headlight leveling adjustment dial car dashboard',    cat: 'int' },
  'reglage-volant':                   { q: 'steering wheel column telescopic adjust car',         cat: 'int' },
  'regulateur-vitesse':               { q: 'cruise control lever button car steering wheel',      cat: 'int' },
  'retroviseur-nuit':                 { q: 'rearview mirror car interior anti dazzle night',      cat: 'int' },
  'securite-enfant':                  { q: 'child safety lock car door inside lever',             cat: 'int' },
  'triangle-presignalisation':        { q: 'road warning triangle reflective safety road',        cat: 'int' },
  'voyant-ceinture':                  { q: 'seatbelt warning light car dashboard indicator',      cat: 'int' },
  'voyant-defaut-batterie':           { q: 'battery warning light car dashboard alert red',       cat: 'int' },
  'voyant-portiere':                  { q: 'door ajar open warning indicator car dashboard',      cat: 'int' },
  'voyant-pression-huile':            { q: 'oil pressure warning light car dashboard red',        cat: 'int' },
  'voyant-pression-pneu':             { q: 'tire pressure TPMS warning light dashboard car',     cat: 'int' },
  'voyant-temperature':               { q: 'engine overheat temperature warning light car',       cat: 'int' },

  // --- Extérieur (VE) ---
  'ampoule-arriere':                  { q: 'car tail light bulb replacement rear lamp',           cat: 'ext' },
  'ampoule-avant':                    { q: 'car headlight bulb replacement front lamp',           cat: 'ext' },
  'balais-essuie-glace':              { q: 'windshield wiper blade rubber car close up',          cat: 'ext' },
  'capot-ouverture':                  { q: 'car hood open engine compartment outside',            cat: 'ext' },
  'clignotants-trottoir':             { q: 'car turn signal indicator amber light flashing',      cat: 'ext' },
  'coffre-ouverture':                 { q: 'car trunk boot open rear luggage space',              cat: 'ext' },
  'dispositifs-reflechissants':       { q: 'car reflector safety strip rear bumper',              cat: 'ext' },
  'eclairage-plaque':                 { q: 'license plate light car rear number plate',           cat: 'ext' },
  'emplacement-batterie':             { q: 'car battery location engine bay compartment',         cat: 'ext' },
  'flanc-pneu':                       { q: 'car tire sidewall close up tread rubber',             cat: 'ext' },
  'gicleurs-lave-glace':              { q: 'windshield washer nozzle jet spray car hood',         cat: 'ext' },
  'niveau-huile-moteur':              { q: 'engine oil dipstick check level car',                 cat: 'ext' },
  'niveau-liquide-frein':             { q: 'brake fluid reservoir level car engine bay',          cat: 'ext' },
  'plaque-pression-pneu':             { q: 'tire pressure sticker door jamb car placard',         cat: 'ext' },
  'plaques-immatriculation':          { q: 'license number plate car front close up',             cat: 'ext' },
  'remplissage-huile':                { q: 'adding pouring engine oil car funnel fill',           cat: 'ext' },
  'remplissage-lave-glace':           { q: 'windshield washer fluid fill car reservoir cap',      cat: 'ext' },
  'remplissage-refroidissement':      { q: 'coolant antifreeze fill reservoir car engine',        cat: 'ext' },
  'temoin-usure-pneu':                { q: 'tire tread wear indicator depth bar groove',          cat: 'ext' },
  'trappe-carburant':                 { q: 'car fuel cap petrol filler tank lid close up',        cat: 'ext' },
}

// ===================================================================
// Distracteurs — même logique que generate-placeholders.mjs
// ===================================================================

function pickDistractors(correctKey, allKeys) {
  const cat     = GESTES[correctKey].cat
  const samecat = allKeys.filter(k => k !== correctKey && GESTES[k].cat === cat)
  const other   = allKeys.filter(k => k !== correctKey && GESTES[k].cat !== cat)
  const idx     = allKeys.indexOf(correctKey)
  const pool    = [...samecat, ...other]
  return [0, 1, 2].map(i => pool[(idx + i * 7 + 1) % pool.length])
}

// ===================================================================
// Helpers
// ===================================================================

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function fileExists(p) {
  try { await fs.access(p); return true } catch { return false }
}

/**
 * Cherche une image sur Pexels et retourne l'URL de la taille 'large' (~640px).
 * Retourne null si aucun résultat.
 */
async function searchPexels(query) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`
  try {
    const res = await fetch(url, { headers: { Authorization: PEXELS_KEY } })
    if (!res.ok) {
      console.error(`    ⚠ Pexels API ${res.status} pour : "${query}"`)
      return null
    }
    const data = await res.json()
    return data.photos?.[0]?.src?.large ?? null
  } catch (err) {
    console.error(`    ⚠ Erreur réseau : ${err.message}`)
    return null
  }
}

/** Télécharge une image depuis une URL et l'enregistre sur le disque. */
async function downloadImage(url, destPath) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} lors du téléchargement de ${url}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  await fs.writeFile(destPath, buffer)
}

// ===================================================================
// Main
// ===================================================================

async function main() {
  const allKeys = Object.keys(GESTES)

  console.log(`\n📸  Téléchargement des images Pexels`)
  console.log(`   Gestes     : ${allKeys.length}`)
  console.log(`   Requêtes   : ≤ ${allKeys.length}  (limite : 200/h)`)
  console.log(`   Durée est. : ~${Math.round(allKeys.length * DELAY_MS / 1000 / 60)} min\n`)

  // ─────────────────────────────────────────────────────────────────
  // Phase 1 : correct.jpg pour chaque geste
  // ─────────────────────────────────────────────────────────────────
  console.log('── Phase 1 : correct.jpg ─────────────────────────────────────')
  let downloaded = 0, skipped = 0, failed = 0

  for (const key of allKeys) {
    const dir        = path.join(DEST, key)
    await fs.mkdir(dir, { recursive: true })
    const correctJpg = path.join(dir, 'correct.jpg')

    if (await fileExists(correctJpg)) {
      process.stdout.write(`  ⏭  ${key}\n`)
      skipped++
      continue
    }

    const geste  = GESTES[key]
    let   imgUrl = await searchPexels(geste.q)

    // Fallback générique si le terme précis ne donne rien
    if (!imgUrl) {
      const fallback = geste.cat === 'int'
        ? 'car dashboard interior controls'
        : 'car engine exterior hood'
      imgUrl = await searchPexels(fallback)
    }

    if (imgUrl) {
      await downloadImage(imgUrl, correctJpg)
      process.stdout.write(`  ✓  ${key}\n`)
      downloaded++
    } else {
      process.stdout.write(`  ✗  ${key} — aucune image (placeholder SVG conservé)\n`)
      failed++
    }

    await sleep(DELAY_MS)
  }

  console.log(`\n   Bilan : ${downloaded} téléchargés · ${skipped} déjà présents · ${failed} échecs\n`)

  // ─────────────────────────────────────────────────────────────────
  // Phase 2 : d1/d2/d3 = copies des correct.jpg d'autres gestes
  // ─────────────────────────────────────────────────────────────────
  console.log('── Phase 2 : distracteurs ────────────────────────────────────')
  let copiedDist = 0

  for (const key of allKeys) {
    const distKeys = pickDistractors(key, allKeys)

    for (let i = 0; i < 3; i++) {
      const srcJpg = path.join(DEST, distKeys[i], 'correct.jpg')
      const dstJpg = path.join(DEST, key, `d${i + 1}.jpg`)

      if (await fileExists(dstJpg)) continue  // déjà copié

      if (await fileExists(srcJpg)) {
        await fs.copyFile(srcJpg, dstJpg)
        copiedDist++
      }
      // Si le correct.jpg source est manquant, le SVG existant sert de fallback
    }
    process.stdout.write(`  ✓  ${key}\n`)
  }

  console.log(`\n   ${copiedDist} fichiers distracteurs copiés.`)
  console.log(`\n✅  Terminé !`)
  console.log(`   Actualise ton navigateur pour voir les vraies photos.\n`)
}

main().catch(err => {
  console.error('\n❌  Erreur fatale :', err.message)
  process.exit(1)
})
