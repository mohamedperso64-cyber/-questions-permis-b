/**
 * Mapping question id → clé de geste (= nom de dossier d'images).
 *
 * Plusieurs questions partagent souvent EXACTEMENT le même geste/emplacement
 * (typiquement Q1 ≡ Q65, Q3 ≡ Q67, etc.). En les regroupant, on évite de
 * dupliquer les photos : un seul jeu de 4 photos sert pour 2 ou 3 questions.
 *
 * Total : ~59 gestes uniques pour 96 questions geste (4 questions sont
 * en mode QCM couleur — Q25, Q47, Q55, Q81 — et ne sont pas listées ici).
 *
 * Convention de dossier : public/images/questions/<cle>/correct.jpg + d1/d2/d3.
 */

export const GESTE_KEYS = {
  // === Q1–Q50 ===
  1:  'reglage-hauteur-feux',
  2:  'remplissage-lave-glace',
  3:  'retroviseur-nuit',
  4:  'flanc-pneu',
  5:  'essuie-glaces-avant',
  6:  'plaques-immatriculation',
  7:  'gilet-visibilite',
  8:  'niveau-liquide-frein',
  9:  'certificat-immatriculation',
  10: 'balais-essuie-glace',
  11: 'indicateur-carburant',
  12: 'remplissage-refroidissement',
  13: 'degivrage-lunette-arriere',
  14: 'clignotants-trottoir',
  15: 'voyant-pression-huile',
  16: 'feux-brouillard-arriere-controle',
  17: 'ethylotest',
  18: 'feux-detresse-controle',
  19: 'reglage-volant',
  20: 'feux-route-controle',
  21: 'air-pare-brise',
  22: 'niveau-huile-moteur',
  23: 'voyant-defaut-batterie',
  24: 'emplacement-batterie',
  // 25 → QCM couleur (pas de photo nécessaire)
  26: 'feux-croisement',
  27: 'voyant-temperature',
  28: 'dispositifs-reflechissants',
  29: 'voyant-portiere',
  30: 'feux-position',
  31: 'actionner-feux-detresse',
  32: 'temoin-usure-pneu',
  33: 'regulateur-vitesse',
  34: 'trappe-carburant',
  35: 'avertisseur-sonore',
  36: 'remplissage-huile',
  37: 'desactivation-airbag',
  38: 'plaque-pression-pneu',
  39: 'voyant-ceinture',
  40: 'eclairage-plaque',
  41: 'attestation-assurance',
  42: 'securite-enfant',
  43: 'allumer-brouillard-arriere',
  44: 'feux-recul',
  45: 'reglage-appui-tete',
  46: 'feux-stop',
  // 47 → QCM couleur
  48: 'capot-ouverture',
  49: 'recyclage-air',
  50: 'remplissage-lave-glace',     // ≡ Q2

  // === Q51–Q100 (variantes, partagent souvent avec la première moitié) ===
  51: 'allumer-feux-route',          // VI (allumer) — différent de Q20 (VE contrôler)
  52: 'feux-diurnes',
  53: 'constat-amiable',
  54: 'triangle-presignalisation',
  // 55 → QCM couleur
  56: 'ampoule-avant',
  57: 'limiteur-vitesse',
  58: 'ampoule-arriere',
  59: 'essuie-glace-arriere',
  60: 'coffre-ouverture',
  61: 'isofix',
  62: 'coffre-ouverture',            // ≡ Q60
  63: 'voyant-pression-pneu',
  64: 'capot-ouverture',             // ≡ Q48
  65: 'reglage-hauteur-feux',        // ≡ Q1
  66: 'gicleurs-lave-glace',         // ≠ Q2 (orifice/réservoir, pas gicleurs)
  67: 'retroviseur-nuit',            // ≡ Q3
  68: 'flanc-pneu',                  // ≡ Q4
  69: 'essuie-glaces-avant',         // ≡ Q5
  70: 'niveau-liquide-frein',        // ≡ Q8
  71: 'gilet-visibilite',            // ≡ Q7
  72: 'remplissage-refroidissement', // ≡ Q12
  73: 'degivrage-lunette-arriere',   // ≡ Q13
  74: 'clignotants-trottoir',        // ≡ Q14
  75: 'voyant-pression-huile',       // ≡ Q15
  76: 'feux-detresse-controle',      // ≡ Q18
  77: 'ethylotest',                  // ≡ Q17
  78: 'feux-route-controle',         // ≡ Q20
  79: 'air-pare-brise',              // ≡ Q21
  80: 'niveau-huile-moteur',         // ≡ Q22
  // 81 → QCM couleur
  82: 'feux-croisement',             // ≡ Q26
  83: 'voyant-temperature',          // ≡ Q27
  84: 'temoin-usure-pneu',           // ≡ Q32
  85: 'actionner-feux-detresse',     // ≡ Q31
  86: 'plaque-pression-pneu',        // ≡ Q38
  87: 'desactivation-airbag',        // ≡ Q37
  88: 'securite-enfant',             // ≡ Q42
  89: 'voyant-ceinture',             // ≡ Q39
  90: 'feux-stop',                   // ≡ Q46
  91: 'allumer-brouillard-arriere',  // ≡ Q43
  92: 'feux-diurnes',                // ≡ Q52
  93: 'recyclage-air',               // ≡ Q49
  94: 'triangle-presignalisation',   // ≡ Q54
  95: 'allumer-feux-route',          // ≡ Q51
  96: 'ampoule-avant',               // ≡ Q56
  97: 'essuie-glace-arriere',        // ≡ Q59
  98: 'ampoule-arriere',             // ≡ Q58
  99: 'voyant-pression-pneu',        // ≡ Q63
  100: 'gicleurs-lave-glace',        // ≡ Q66
}

/** Retourne la clé de geste d'une question, ou null (mode non-geste). */
export function gesteKeyFor(qid) {
  return GESTE_KEYS[qid] || null
}

/** Renvoie la liste des questions qui partagent un même geste. */
export function questionsForGesteKey(key) {
  return Object.entries(GESTE_KEYS)
    .filter(([, k]) => k === key)
    .map(([id]) => parseInt(id, 10))
    .sort((a, b) => a - b)
}

/** Liste complète des clés uniques (utile pour générer la grille de dossiers à remplir). */
export function listAllGesteKeys() {
  return [...new Set(Object.values(GESTE_KEYS))].sort()
}
