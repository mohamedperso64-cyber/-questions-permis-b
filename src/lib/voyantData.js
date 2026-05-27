/**
 * voyantData.js
 * Données complètes des voyants du tableau de bord.
 * Organisées en 4 catégories selon le classement DEKRA / Sécurité Routière.
 *
 * color : 'red' | 'orange' | 'blue' | 'green' | 'yellow'
 * questions : IDs des questions de l'examen liées à ce voyant (facultatif)
 */

export const VOYANT_CATEGORIES = [
  {
    id: 'feux',
    label: 'Feux',
    subtitle: 'Signalisation lumineuse — fonctionnement normal',
    accent: '#1B6BA0',
    voyants: [
      {
        id: 'feux-position',
        color: 'green',
        name: 'Feux de position',
        desc: 'Les feux de position (feux de stationnement) sont allumés. Voyant vert.',
        questions: [],
      },
      {
        id: 'feux-croisement',
        color: 'green',
        name: 'Feux de croisement',
        desc: 'Les feux de croisement (codes) sont allumés. Voyant vert.',
        questions: [],
      },
      {
        id: 'feux-route',
        color: 'blue',
        name: 'Feux de route',
        desc: 'Les pleins phares (feux de route) sont allumés. Voyant bleu.',
        questions: [20, 51, 78, 95],
      },
      {
        id: 'antibrouillard-avant',
        color: 'green',
        name: 'Anti-brouillard avant',
        desc: 'Les projecteurs anti-brouillard avant sont activés. Voyant vert/jaune.',
        questions: [],
      },
      {
        id: 'antibrouillard-arriere',
        color: 'orange',
        name: 'Anti-brouillard arrière',
        desc: 'Le feu de brouillard arrière est allumé. Voyant orange. À éteindre dès que la visibilité dépasse 50 m.',
        questions: [43, 91],
      },
      {
        id: 'feux-detresse',
        color: 'red',
        name: 'Feux de détresse',
        desc: 'Les feux de détresse (warnings) sont activés. Voyant rouge clignotant. Tous les clignotants s\'allument simultanément.',
        questions: [18, 31, 76, 85],
      },
      {
        id: 'ampoule-defaillante',
        color: 'orange',
        name: 'Ampoule défaillante',
        desc: 'Une ampoule de feux extérieurs est grillée (phare, stop, clignotant…). À remplacer dès que possible.',
        questions: [],
      },
    ],
  },
  {
    id: 'roues-freins',
    label: 'Roues et freins',
    subtitle: 'Anomalies détectées — arrêt ou vigilance requis',
    accent: '#C0392B',
    voyants: [
      {
        id: 'freins',
        color: 'red',
        name: 'Défaillance freinage',
        desc: 'Défaillance du système de freinage (niveau liquide, circuit…). DANGER — s\'arrêter immédiatement en sécurité.',
        questions: [25, 55, 81],
      },
      {
        id: 'frein-main',
        color: 'red',
        name: 'Frein de parking serré',
        desc: 'Le frein à main (frein de stationnement) est encore serré ou le niveau de liquide de frein est bas.',
        questions: [],
      },
      {
        id: 'abs',
        color: 'orange',
        name: 'ABS défaillant',
        desc: 'L\'ABS (système anti-blocage des roues) est en panne. Le freinage reste possible mais sans assistance électronique.',
        questions: [],
      },
      {
        id: 'plaquettes',
        color: 'orange',
        name: 'Plaquettes usées',
        desc: 'Usure anormale des plaquettes de frein avant. À contrôler rapidement chez un garagiste.',
        questions: [],
      },
      {
        id: 'pression-pneu',
        color: 'orange',
        name: 'Pression pneu anormale',
        desc: 'La pression d\'un ou plusieurs pneus est insuffisante (TPMS). Regonfler dès que possible. Risque d\'aquaplanage.',
        questions: [63, 99],
      },
      {
        id: 'antipatinage',
        color: 'orange',
        name: 'Antipatinage (ESP/ASR)',
        desc: 'Dysfonctionnement ou désactivation du contrôle de traction / ESP. Vigilance accrue sur sol glissant.',
        questions: [],
      },
    ],
  },
  {
    id: 'moteur-batterie',
    label: 'Moteur et batterie',
    subtitle: 'Anomalies moteur — réagir vite pour éviter la casse',
    accent: '#E67E22',
    voyants: [
      {
        id: 'pression-huile',
        color: 'red',
        name: 'Pression d\'huile insuffisante',
        desc: 'La pression d\'huile moteur est trop basse. S\'arrêter immédiatement et couper le moteur pour éviter une casse grave.',
        questions: [15, 75],
      },
      {
        id: 'temperature',
        color: 'red',
        name: 'Température refroidissement',
        desc: 'Température anormale du liquide de refroidissement — moteur en surchauffe. S\'arrêter dès que possible.',
        questions: [27, 83],
      },
      {
        id: 'surchauffe-huile',
        color: 'red',
        name: 'Surchauffe huile moteur',
        desc: 'L\'huile moteur est en surchauffe. Arrêter le moteur rapidement pour éviter une avarie.',
        questions: [],
      },
      {
        id: 'niveau-huile',
        color: 'orange',
        name: 'Niveau d\'huile bas',
        desc: 'Le niveau d\'huile moteur est insuffisant. Faire l\'appoint rapidement. Ne pas conduire longtemps sans refaire le niveau.',
        questions: [],
      },
      {
        id: 'batterie',
        color: 'red',
        name: 'Charge batterie insuffisante',
        desc: 'La batterie ne se recharge pas (alternateur en panne). Le véhicule peut s\'arrêter à court terme.',
        questions: [23],
      },
      {
        id: 'injection',
        color: 'orange',
        name: 'Défaut injection / dépollution',
        desc: 'Dysfonctionnement du système d\'allumage, d\'injection ou de dépollution (antipollution). Entretien à planifier.',
        questions: [],
      },
      {
        id: 'prechauffage',
        color: 'yellow',
        name: 'Préchauffage diesel',
        desc: 'Moteur diesel en cours de préchauffage. Attendre l\'extinction du voyant avant de démarrer.',
        questions: [],
      },
      {
        id: 'antidemarrage',
        color: 'yellow',
        name: 'Antidémarrage (immo)',
        desc: 'Antidémarrage codé activé — clé non reconnue ou clé non électronique utilisée.',
        questions: [],
      },
    ],
  },
  {
    id: 'securite-carburant',
    label: 'Sécurité et carburant',
    subtitle: 'Sécurité passive et réserves',
    accent: '#8E44AD',
    voyants: [
      {
        id: 'ceinture',
        color: 'red',
        name: 'Ceinture non bouclée',
        desc: 'Une ceinture de sécurité n\'est pas attachée (conducteur ou passager). Obligatoire dès le démarrage.',
        questions: [39, 89],
      },
      {
        id: 'airbag',
        color: 'red',
        name: 'Airbag défaillant',
        desc: 'Dysfonctionnement ou désactivation de l\'airbag conducteur ou passager. Contrôle obligatoire en atelier.',
        questions: [],
      },
      {
        id: 'direction-assistee',
        color: 'orange',
        name: 'Direction assistée',
        desc: 'La direction assistée est défaillante. La direction reste utilisable mais demande plus d\'effort.',
        questions: [],
      },
      {
        id: 'portiere',
        color: 'orange',
        name: 'Portière / coffre ouvert',
        desc: 'Une portière, le coffre ou le capot n\'est pas correctement fermé. Vérifier avant de rouler.',
        questions: [29],
      },
      {
        id: 'carburant',
        color: 'orange',
        name: 'Réserve de carburant',
        desc: 'La réserve de carburant est atteinte. Il reste environ 5 à 10 L selon le véhicule. Faire le plein rapidement.',
        questions: [11],
      },
      {
        id: 'degivrage',
        color: 'green',
        name: 'Dégivrage lunette arrière',
        desc: 'Le dégivrage de la lunette arrière est en fonctionnement. Voyant qui s\'éteint automatiquement.',
        questions: [13, 73],
      },
      {
        id: 'eau-gazoil',
        color: 'orange',
        name: 'Eau dans le filtre gazoil',
        desc: 'Présence d\'eau dans le filtre à gazoil (véhicules diesel). Vidanger le filtre dès que possible.',
        questions: [],
      },
    ],
  },
]

// Couleurs par catégorie de voyant
export const VOYANT_COLORS = {
  red:    { bg: '#FF3B30', label: 'Rouge — DANGER', urgency: 3 },
  orange: { bg: '#FF9500', label: 'Orange — Alerte', urgency: 2 },
  yellow: { bg: '#FFD60A', label: 'Jaune — Info', urgency: 1 },
  green:  { bg: '#34C759', label: 'Vert — Normal', urgency: 0 },
  blue:   { bg: '#007AFF', label: 'Bleu — Signalisation', urgency: 0 },
}
