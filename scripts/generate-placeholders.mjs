#!/usr/bin/env node
/**
 * generate-placeholders.mjs
 *
 * Génère des placeholders SVG pour les 59 gestes uniques du permis.
 * Chaque geste reçoit un dossier avec 4 fichiers :
 *   correct.svg  — la bonne réponse (label + emoji du geste)
 *   d1.svg       — distracteur 1 (autre geste de la même catégorie)
 *   d2.svg       — distracteur 2
 *   d3.svg       — distracteur 3
 *
 * Usage : node scripts/generate-placeholders.mjs
 *
 * ⚠️  Ces SVG sont des PLACEHOLDERS de développement.
 *     Ils seront remplacés par de vraies photos avec le script Pexels.
 */

import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
const ROOT       = path.resolve(__dirname, '..')
const DEST       = path.join(ROOT, 'public', 'images', 'questions')

// ===================================================================
// Catalogue complet des 59 gestes
// cat: 'int' = vérification intérieure (VI)
//      'ext' = vérification extérieure (VE)
// ===================================================================

const GESTES = {
  // --- Intérieur (VI) ---
  'actionner-feux-detresse':           { label: 'Actionner feux de détresse',      emoji: '🚨', cat: 'int' },
  'air-pare-brise':                    { label: 'Désembuage pare-brise',            emoji: '💨', cat: 'int' },
  'allumer-brouillard-arriere':        { label: 'Allumer brouillard arrière',       emoji: '🌫️', cat: 'int' },
  'allumer-feux-route':                { label: 'Allumer feux de route',            emoji: '💡', cat: 'int' },
  'attestation-assurance':             { label: 'Attestation d\'assurance',         emoji: '📄', cat: 'int' },
  'avertisseur-sonore':                { label: 'Avertisseur sonore (klaxon)',      emoji: '📯', cat: 'int' },
  'certificat-immatriculation':        { label: 'Carte grise',                      emoji: '📋', cat: 'int' },
  'constat-amiable':                   { label: 'Constat amiable',                  emoji: '✍️', cat: 'int' },
  'degivrage-lunette-arriere':         { label: 'Dégivrage lunette arrière',        emoji: '❄️', cat: 'int' },
  'desactivation-airbag':              { label: 'Désactivation airbag passager',    emoji: '🛡️', cat: 'int' },
  'essuie-glace-arriere':              { label: 'Essuie-glace arrière',             emoji: '🌧️', cat: 'int' },
  'essuie-glaces-avant':               { label: 'Essuie-glaces avant',              emoji: '🌧️', cat: 'int' },
  'ethylotest':                        { label: 'Éthylotest',                       emoji: '🧪', cat: 'int' },
  'feux-brouillard-arriere-controle':  { label: 'Contrôle brouillard arrière',      emoji: '🔴', cat: 'int' },
  'feux-croisement':                   { label: 'Feux de croisement',               emoji: '🔆', cat: 'int' },
  'feux-detresse-controle':            { label: 'Contrôle feux de détresse',        emoji: '⚠️', cat: 'int' },
  'feux-diurnes':                      { label: 'Feux diurnes (DRL)',               emoji: '☀️', cat: 'int' },
  'feux-position':                     { label: 'Feux de position',                 emoji: '🟡', cat: 'int' },
  'feux-recul':                        { label: 'Feux de recul',                    emoji: '⬅️', cat: 'int' },
  'feux-route-controle':               { label: 'Contrôle feux de route',           emoji: '🔦', cat: 'int' },
  'feux-stop':                         { label: 'Feux stop',                        emoji: '🔴', cat: 'int' },
  'gilet-visibilite':                  { label: 'Gilet de visibilité',              emoji: '🦺', cat: 'int' },
  'indicateur-carburant':              { label: 'Indicateur de carburant',          emoji: '⛽', cat: 'int' },
  'isofix':                            { label: 'Fixations ISOFIX',                 emoji: '🔒', cat: 'int' },
  'limiteur-vitesse':                  { label: 'Limiteur de vitesse',              emoji: '🚦', cat: 'int' },
  'recyclage-air':                     { label: 'Recyclage air habitacle',          emoji: '🔄', cat: 'int' },
  'reglage-appui-tete':                { label: 'Réglage appui-tête',               emoji: '🪑', cat: 'int' },
  'reglage-hauteur-feux':              { label: 'Réglage hauteur des feux',         emoji: '🔦', cat: 'int' },
  'reglage-volant':                    { label: 'Réglage colonne de direction',     emoji: '🎯', cat: 'int' },
  'regulateur-vitesse':                { label: 'Régulateur de vitesse',            emoji: '⚙️', cat: 'int' },
  'retroviseur-nuit':                  { label: 'Rétroviseur antiéblouissant',      emoji: '🌙', cat: 'int' },
  'securite-enfant':                   { label: 'Sécurité enfant portière',         emoji: '👶', cat: 'int' },
  'triangle-presignalisation':         { label: 'Triangle de présignalisation',     emoji: '⛺', cat: 'int' },
  'voyant-ceinture':                   { label: 'Voyant ceinture de sécurité',      emoji: '🔔', cat: 'int' },
  'voyant-defaut-batterie':            { label: 'Voyant défaut batterie',           emoji: '🔋', cat: 'int' },
  'voyant-portiere':                   { label: 'Voyant portière ouverte',          emoji: '🚪', cat: 'int' },
  'voyant-pression-huile':             { label: 'Voyant pression huile',            emoji: '🛢️', cat: 'int' },
  'voyant-pression-pneu':              { label: 'Voyant pression des pneus',        emoji: '🛞', cat: 'int' },
  'voyant-temperature':                { label: 'Voyant température moteur',        emoji: '🌡️', cat: 'int' },

  // --- Extérieur (VE) ---
  'ampoule-arriere':                   { label: 'Ampoule feu arrière',              emoji: '💡', cat: 'ext' },
  'ampoule-avant':                     { label: 'Ampoule feu avant',                emoji: '💡', cat: 'ext' },
  'balais-essuie-glace':               { label: 'Balais d\'essuie-glace',           emoji: '🧹', cat: 'ext' },
  'capot-ouverture':                   { label: 'Ouverture du capot',               emoji: '🔧', cat: 'ext' },
  'clignotants-trottoir':              { label: 'Clignotants côté trottoir',        emoji: '🔆', cat: 'ext' },
  'coffre-ouverture':                  { label: 'Ouverture du coffre',              emoji: '📦', cat: 'ext' },
  'dispositifs-reflechissants':        { label: 'Dispositifs réfléchissants',       emoji: '🔆', cat: 'ext' },
  'eclairage-plaque':                  { label: 'Éclairage de la plaque arrière',   emoji: '🔢', cat: 'ext' },
  'emplacement-batterie':              { label: 'Emplacement de la batterie',       emoji: '🔋', cat: 'ext' },
  'flanc-pneu':                        { label: 'Flanc du pneu',                    emoji: '🛞', cat: 'ext' },
  'gicleurs-lave-glace':               { label: 'Gicleurs lave-glace',              emoji: '💦', cat: 'ext' },
  'niveau-huile-moteur':               { label: 'Niveau huile moteur',              emoji: '🛢️', cat: 'ext' },
  'niveau-liquide-frein':              { label: 'Niveau liquide de frein',          emoji: '🛑', cat: 'ext' },
  'plaque-pression-pneu':              { label: 'Plaque pression recommandée',      emoji: '📊', cat: 'ext' },
  'plaques-immatriculation':           { label: 'Plaques d\'immatriculation',       emoji: '🚗', cat: 'ext' },
  'remplissage-huile':                 { label: 'Remplissage huile moteur',         emoji: '🛢️', cat: 'ext' },
  'remplissage-lave-glace':            { label: 'Remplissage lave-glace',           emoji: '💧', cat: 'ext' },
  'remplissage-refroidissement':       { label: 'Liquide de refroidissement',       emoji: '🌊', cat: 'ext' },
  'temoin-usure-pneu':                 { label: 'Témoin d\'usure des pneus',        emoji: '🛞', cat: 'ext' },
  'trappe-carburant':                  { label: 'Trappe carburant',                 emoji: '⛽', cat: 'ext' },
}

// ===================================================================
// Génération d'un SVG (design « Cockpit Clair »)
// ===================================================================

/**
 * Génère le SVG d'une vignette — sans texte révélateur, juste l'emoji.
 *
 * @param {string} emoji      Emoji représentatif
 * @param {boolean} isCorrect Si true, fond bleu clair (aide dev — sans texte)
 */
function makeSVG(emoji, isCorrect = false) {
  const accentColor = isCorrect ? '#1B6BA0' : '#8A9BAD'
  const bgStop1     = isCorrect ? '#F0F6FB' : '#F7F4ED'
  const bgStop2     = isCorrect ? '#DCE9F2' : '#EDE8DC'

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgStop1}"/>
      <stop offset="100%" style="stop-color:${bgStop2}"/>
    </linearGradient>
  </defs>

  <!-- Fond page -->
  <rect width="600" height="450" fill="url(#bg)"/>

  <!-- Barre accent couleur -->
  <rect width="600" height="4" fill="${accentColor}"/>

  <!-- Surface carte -->
  <rect x="40" y="55" width="520" height="340" fill="white" rx="18" opacity="0.72"/>

  <!-- Emoji centré -->
  <text x="300" y="225" text-anchor="middle" dominant-baseline="central"
        font-size="100"
        font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">${emoji}</text>
</svg>`
}

// ===================================================================
// Sélection des distracteurs
// ===================================================================

/**
 * Retourne 3 clés de distracteurs pour un geste donné.
 * On prend d'abord dans la même catégorie (int/ext), puis dans l'autre
 * si pas assez disponible.
 */
function pickDistractors(correctKey, allKeys) {
  const cat = GESTES[correctKey].cat
  // Même catégorie, excl. le geste courant
  const samecat = allKeys.filter(k => k !== correctKey && GESTES[k].cat === cat)
  // Autre catégorie, si besoin
  const other   = allKeys.filter(k => k !== correctKey && GESTES[k].cat !== cat)

  // Décalage basé sur la position dans la liste pour varier les distracteurs
  const idx = allKeys.indexOf(correctKey)
  const pool = [...samecat, ...other]
  const distractors = []
  for (let i = 0; i < 3; i++) {
    distractors.push(pool[(idx + i * 7 + 1) % pool.length])
  }
  return distractors
}

// ===================================================================
// Main
// ===================================================================

async function main() {
  const allKeys = Object.keys(GESTES)
  let created = 0, skipped = 0

  console.log(`\n🎨  Génération des placeholders SVG`)
  console.log(`   Destination : ${DEST}`)
  console.log(`   Gestes : ${allKeys.length} × 4 fichiers = ${allKeys.length * 4} SVG\n`)

  for (const key of allKeys) {
    const geste = GESTES[key]
    const dir   = path.join(DEST, key)

    // Crée le dossier si besoin
    await fs.mkdir(dir, { recursive: true })

    // Génère correct.svg (fond bleu — visible en dev mais sans texte)
    const correctPath = path.join(dir, 'correct.svg')
    await fs.writeFile(correctPath, makeSVG(geste.emoji, true), 'utf-8')

    // Génère d1.svg, d2.svg, d3.svg
    const distKeys = pickDistractors(key, allKeys)
    for (let i = 0; i < 3; i++) {
      const dGeste = GESTES[distKeys[i]]
      const dPath  = path.join(dir, `d${i + 1}.svg`)
      await fs.writeFile(dPath, makeSVG(dGeste.emoji, false), 'utf-8')
    }

    created++
    process.stdout.write(`   ✓  ${key.padEnd(44)} → correct + d1/d2/d3\n`)
  }

  console.log(`\n✅  ${created * 4} fichiers SVG créés dans ${created} dossiers.`)
  console.log(`   ${skipped > 0 ? `(${skipped} dossiers ignorés — déjà complets)` : ''}`)
  console.log(`\n   Prochaine étape : lancer le script Pexels pour les vraies photos.`)
  console.log(`   Ou tester directement avec : npm run dev\n`)
}

main().catch((err) => {
  console.error('❌  Erreur :', err)
  process.exit(1)
})
