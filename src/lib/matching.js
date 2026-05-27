/**
 * Moteur de matching pour le mode « réponse libre ».
 *
 * Pour chaque question en mode libre, on a une liste de mots-clés essentiels.
 * Quand l'utilisateur tape sa réponse, on vérifie combien de ces mots-clés
 * sont présents (avec tolérance pour les fautes de frappe, conjugaisons,
 * accents, apostrophes…).
 *
 * Verdict :
 *   • Tous les mots-clés trouvés        → 'excellent'
 *   • Au moins 1 trouvé, mais pas tous  → 'proche'
 *   • Aucun                              → 'horssujet'
 *
 * Approche PERMISSIVE par défaut : mieux vaut accepter une réponse correcte
 * que rejeter à tort. On affinera après les premiers tests utilisateurs.
 */

// === Normalisations ===

const APOSTROPHES_RE = /['‛`´]/g
const SMART_QUOTES_RE = /[«»“”„‟]/g
const PUNCT_RE = /[.,;:!?…—–\-(){}[\]"]/g

/**
 * Base : lowercase + accents retirés + apostrophes/guillemets unifiés.
 */
function basicNormalize(s) {
  if (!s) return ''
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')          // strip accents
    .replace(APOSTROPHES_RE, "'")     // unify apostrophes
    .replace(SMART_QUOTES_RE, '"')    // unify quotes
}

/**
 * Pour les mots-clés textuels : retire aussi la ponctuation et collapse les espaces.
 */
function textNormalize(s) {
  return basicNormalize(s)
    .replace(PUNCT_RE, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Pour les mots-clés numériques : on garde la ponctuation (utile pour "0,2 g/l").
 */
function numericNormalize(s) {
  return basicNormalize(s)
    .replace(/\s+/g, ' ')
    .trim()
}

// === Outils de comparaison ===

/** Distance de Levenshtein classique. */
function levenshtein(a, b) {
  const m = a.length, n = b.length
  if (m === 0) return n
  if (n === 0) return m
  // Optimisation mémoire : on garde seulement 2 lignes
  let prev = new Array(n + 1)
  let curr = new Array(n + 1)
  for (let j = 0; j <= n; j++) prev[j] = j
  for (let i = 1; i <= m; i++) {
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost)
    }
    [prev, curr] = [curr, prev]
  }
  return prev[n]
}

/** Tolérance fuzzy : 0 pour mots courts, jusqu'à 2 pour mots longs. */
function fuzzyThreshold(len) {
  if (len <= 3) return 0
  if (len <= 6) return 1
  return 2
}

/** Détecte si un mot-clé contient des chiffres. */
function isNumericKeyword(s) {
  return /\d/.test(s)
}

/** Longueur du préfixe commun entre 2 mots. */
function commonPrefixLen(a, b) {
  const min = Math.min(a.length, b.length)
  let i = 0
  while (i < min && a[i] === b[i]) i++
  return i
}

/**
 * Vérifie si un mot-clé est présent dans la liste de mots de l'utilisateur,
 * avec tolérance pour les conjugaisons et fautes.
 */
function matchSingleWordIn(userWords, keyword) {
  for (const word of userWords) {
    // 1. Égalité exacte
    if (word === keyword) return true

    // 2. Préfixe : le mot utilisateur commence par le mot-clé
    //    (couvre "danger" matche "dangereux", "éblouir" matche "éblouissement")
    if (word.length > keyword.length && word.startsWith(keyword)) return true

    // 3. Stem partagé : préfixe commun d'au moins 4 caractères ET
    //    couvrant presque tout le mot-clé (à 2 caractères près).
    //    Couvre "délimiter" ↔ "délimitant" (commun 7/9)
    //    et    "éblouir"  ↔ "éblouissement" (commun 6/7).
    const common = commonPrefixLen(word, keyword)
    if (common >= 4 && common >= keyword.length - 2) {
      return true
    }

    // 4. Fuzzy (Levenshtein) pour les fautes de frappe
    const maxLen = Math.max(word.length, keyword.length)
    const threshold = fuzzyThreshold(maxLen)
    if (threshold > 0 && Math.abs(word.length - keyword.length) <= threshold + 1) {
      if (levenshtein(word, keyword) <= threshold) return true
    }
  }
  return false
}

// === API publique ===

/**
 * Vérifie si un mot-clé est présent dans la réponse de l'utilisateur.
 */
export function matchKeyword(userText, keyword) {
  if (!userText || !keyword) return false

  // Mot-clé numérique : substring match avec quelques tolérances
  if (isNumericKeyword(keyword)) {
    const nuser = numericNormalize(userText)
    const nkey = numericNormalize(keyword)
    if (nuser.includes(nkey)) return true
    // Sans espaces
    if (nuser.replace(/\s/g, '').includes(nkey.replace(/\s/g, ''))) return true
    // Virgule ↔ point (pour "0,2" vs "0.2")
    if (nuser.includes(nkey.replace(/,/g, '.'))) return true
    if (nuser.includes(nkey.replace(/\./g, ','))) return true
    return false
  }

  const nuser = textNormalize(userText)
  const nkey = textNormalize(keyword)
  if (!nuser || !nkey) return false

  // Match direct (mot-clé entier présent quelque part)
  if (nuser.includes(nkey)) return true

  // Mot-clé multi-mots : si pas de match direct, on vérifie mot par mot
  const userWords = nuser.split(' ').filter(Boolean)
  if (nkey.includes(' ')) {
    const subwords = nkey.split(' ').filter(Boolean)
    return subwords.every(sw => matchSingleWordIn(userWords, sw))
  }

  return matchSingleWordIn(userWords, nkey)
}

/**
 * Évalue une réponse utilisateur contre une liste de mots-clés.
 * Retourne { verdict, found, missing, total }.
 */
export function evaluate(userText, keywords) {
  if (!keywords || keywords.length === 0) {
    return { verdict: 'horssujet', found: [], missing: [], total: 0 }
  }
  const found = []
  const missing = []
  for (const kw of keywords) {
    if (matchKeyword(userText, kw)) found.push(kw)
    else missing.push(kw)
  }
  let verdict
  if (found.length === keywords.length) verdict = 'excellent'
  else if (found.length > 0) verdict = 'proche'
  else verdict = 'horssujet'
  return { verdict, found, missing, total: keywords.length }
}

// Exporte les helpers pour les tests
export const _internals = {
  basicNormalize,
  textNormalize,
  numericNormalize,
  levenshtein,
  matchSingleWordIn,
}
