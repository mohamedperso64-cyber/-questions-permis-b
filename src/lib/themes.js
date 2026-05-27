/**
 * Catégorisation thématique des 100 questions.
 *
 * Chaque question est rattachée à UN thème principal (le plus pertinent
 * pour la vérification — VI ou VE).
 *
 * Si tu veux changer la catégorisation d'une question, modifie juste
 * la valeur dans QUESTION_THEMES.
 */

export const THEMES = {
  feux: {
    label: 'Feux et signalisation',
    icon: '🔦',
    description: 'Feux de croisement, route, position, brouillard, stop, recul, clignotants, etc.',
  },
  voyants: {
    label: 'Voyants tableau de bord',
    icon: '🚨',
    description: 'Voyants d\'alerte : huile, batterie, freinage, température, ceinture, etc.',
  },
  liquides: {
    label: 'Liquides moteur',
    icon: '💧',
    description: 'Niveaux et remplissage : huile moteur, liquide de frein, refroidissement, lave-glace.',
  },
  pneus: {
    label: 'Pneus',
    icon: '🛞',
    description: 'Flanc, pression, témoin d\'usure, aquaplanage.',
  },
  securite: {
    label: 'Sécurité et équipements',
    icon: '🦺',
    description: 'Gilet, triangle, éthylotest, sécurité enfant, Isofix, airbag, ceinture, appui-tête.',
  },
  habitacle: {
    label: 'Habitacle et commandes',
    icon: '🪑',
    description: 'Volant, rétroviseur, recyclage d\'air, désembuage, essuie-glaces, régulateur, avertisseur.',
  },
  carrosserie: {
    label: 'Carrosserie',
    icon: '🚗',
    description: 'Capot, coffre, plaques d\'immatriculation, dispositifs réfléchissants, trappe carburant.',
  },
  documents: {
    label: 'Documents',
    icon: '📋',
    description: 'Carte grise, attestation d\'assurance, constat amiable.',
  },
}

export const QUESTION_THEMES = {
  // Q1–Q50 (première moitié de la banque)
  1: 'feux',         2: 'liquides',     3: 'habitacle',    4: 'pneus',
  5: 'habitacle',    6: 'carrosserie',  7: 'securite',     8: 'liquides',
  9: 'documents',   10: 'habitacle',   11: 'habitacle',   12: 'liquides',
  13: 'habitacle',  14: 'feux',        15: 'voyants',     16: 'feux',
  17: 'securite',   18: 'feux',        19: 'habitacle',   20: 'feux',
  21: 'habitacle',  22: 'liquides',    23: 'voyants',     24: 'voyants',
  25: 'voyants',    26: 'feux',        27: 'voyants',     28: 'carrosserie',
  29: 'voyants',    30: 'feux',        31: 'feux',        32: 'pneus',
  33: 'habitacle',  34: 'carrosserie', 35: 'habitacle',   36: 'liquides',
  37: 'securite',   38: 'pneus',       39: 'securite',    40: 'feux',
  41: 'documents',  42: 'securite',    43: 'feux',        44: 'feux',
  45: 'securite',   46: 'feux',        47: 'voyants',     48: 'carrosserie',
  49: 'habitacle',  50: 'liquides',

  // Q51–Q100 (variantes de la première moitié)
  51: 'feux',        52: 'feux',        53: 'documents',   54: 'securite',
  55: 'voyants',     56: 'feux',        57: 'habitacle',   58: 'feux',
  59: 'habitacle',   60: 'carrosserie', 61: 'securite',    62: 'carrosserie',
  63: 'voyants',     64: 'carrosserie', 65: 'feux',        66: 'liquides',
  67: 'habitacle',   68: 'pneus',       69: 'habitacle',   70: 'liquides',
  71: 'securite',    72: 'liquides',    73: 'habitacle',   74: 'feux',
  75: 'voyants',     76: 'feux',        77: 'securite',    78: 'feux',
  79: 'habitacle',   80: 'liquides',    81: 'voyants',     82: 'feux',
  83: 'voyants',     84: 'pneus',       85: 'feux',        86: 'pneus',
  87: 'securite',    88: 'securite',    89: 'securite',    90: 'feux',
  91: 'feux',        92: 'feux',        93: 'habitacle',   94: 'securite',
  95: 'feux',        96: 'feux',        97: 'habitacle',   98: 'feux',
  99: 'voyants',    100: 'liquides',
}

/** Retourne le thème d'une question (ou 'autre' si pas trouvé). */
export function themeOf(qid) {
  return QUESTION_THEMES[qid] || 'autre'
}

/** Retourne la liste des IDs de questions d'un thème donné. */
export function questionsInTheme(themeKey) {
  return Object.entries(QUESTION_THEMES)
    .filter(([, t]) => t === themeKey)
    .map(([id]) => parseInt(id, 10))
    .sort((a, b) => a - b)
}
