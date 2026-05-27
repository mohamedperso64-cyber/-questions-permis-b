/**
 * Helpers de stockage local pour le site permis.
 *
 * On garde tout en localStorage sous une clé unique pour rester portable
 * et éviter la pollution. La structure :
 *   {
 *     "answered":  [1, 5, 12, ...]      // ids des questions auxquelles l'utilisateur a répondu
 *     "missed":    [12, 47]              // ids des questions ratées (à revoir)
 *     "lastDrawn": 47                    // dernière question tirée (pour reprise)
 *     "drawHistory": [3, 17, 47, ...]    // n dernières questions tirées (anti-répétition)
 *   }
 */

const STORAGE_KEY = 'permis-revision-v1'
const MAX_DRAW_HISTORY = 20  // on évite de retirer les 20 dernières questions

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function writeAll(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // localStorage indisponible (mode privé), on tombe en silence
  }
}

// --- API publique ---

export function getAnsweredIds() {
  return readAll().answered || []
}

export function getMissedIds() {
  return readAll().missed || []
}

export function getLastDrawn() {
  return readAll().lastDrawn ?? null
}

export function getDrawHistory() {
  return readAll().drawHistory || []
}

export function markAnswered(id, wasCorrect) {
  const data = readAll()
  const answered = new Set(data.answered || [])
  answered.add(id)
  data.answered = [...answered]

  const missed = new Set(data.missed || [])
  if (wasCorrect) {
    missed.delete(id)
  } else {
    missed.add(id)
  }
  data.missed = [...missed]

  writeAll(data)
}

export function recordDraw(id) {
  const data = readAll()
  data.lastDrawn = id
  const history = data.drawHistory || []
  history.unshift(id)
  data.drawHistory = history.slice(0, MAX_DRAW_HISTORY)
  writeAll(data)
}

/**
 * Tire une question au hasard parmi 1..99, en évitant celles qui sont
 * dans l'historique récent (sauf si toutes ont déjà été tirées).
 *
 * Note : on exclut la question 100 du tirage aléatoire pour que le compteur
 * affiche toujours un nombre lisible (01-99). La Q100 reste accessible via
 * la liste complète ou un lien direct /question/100.
 */
export function drawRandomQuestion() {
  const history = getDrawHistory()
  const recent = new Set(history)
  const pool = []
  for (let i = 1; i <= 99; i++) {
    if (!recent.has(i)) pool.push(i)
  }
  // Si l'historique remplit le pool, on accepte tout (1..99)
  const candidates = pool.length > 0 ? pool : Array.from({ length: 99 }, (_, i) => i + 1)
  return candidates[Math.floor(Math.random() * candidates.length)]
}

export function clearMissed() {
  const data = readAll()
  data.missed = []
  writeAll(data)
}

export function resetAll() {
  try { localStorage.removeItem(STORAGE_KEY) } catch {}
}
