# Images des questions (mode geste visuel)

Ce dossier contient les images pour le **QCM visuel** des questions en mode geste.
Quand les 4 images d'un geste sont présentes, la page de question bascule
automatiquement en mode QCM visuel (à 4 vignettes). Sinon, elle reste en mode
auto-évaluation texte (GesteCard).

## ⚡ Mutualisation des images

**Beaucoup de questions partagent le même geste** (Q1 ≡ Q65, Q3 ≡ Q67, etc.). On
range donc les images par **clé de geste**, pas par numéro de question. Une seule
fournée de 4 photos sert souvent à 2-3 questions à la fois.

Le mapping `question id → clé de geste` est défini dans
[`src/lib/gesteImages.js`](../../../src/lib/gesteImages.js).

## Convention de nommage

Pour chaque clé de geste (ex. `reglage-hauteur-feux`), créer un dossier
contenant 4 fichiers :

```
public/images/questions/reglage-hauteur-feux/
├── correct.jpg     ← la bonne réponse (à montrer pour ce geste)
├── d1.jpg          ← distracteur 1 (emplacement voisin, plausible)
├── d2.jpg          ← distracteur 2
└── d3.jpg          ← distracteur 3
```

## Formats acceptés

`.jpg`, `.jpeg`, `.png`, `.webp` (le composant essaie chaque extension dans cet
ordre et prend la première qui charge).

## Recommandations

- **Format paysage** ~4:3 ou 16:9 (les vignettes sont affichées avec
  `aspect-ratio: 4/3`).
- **Taille raisonnable** : 600×450 px suffit, max ~150 ko par image.
- **Cadrage** : montrer l'emplacement de manière claire et identifiable.
- **Distracteurs plausibles** : choisir des emplacements proches (autres
  commandes du tableau de bord pour un geste intérieur) plutôt que des objets
  très différents — c'est plus formateur.

## Liste des 59 gestes uniques à photographier

À photographier (ordre alphabétique) :

### Intérieur (VI)
- `actionner-feux-detresse` (Q31, Q85)
- `air-pare-brise` (Q21, Q79)
- `allumer-brouillard-arriere` (Q43, Q91)
- `allumer-feux-route` (Q51, Q95)
- `attestation-assurance` (Q41)
- `avertisseur-sonore` (Q35)
- `certificat-immatriculation` (Q9)
- `constat-amiable` (Q53)
- `degivrage-lunette-arriere` (Q13, Q73)
- `desactivation-airbag` (Q37, Q87)
- `ethylotest` (Q17, Q77)
- `gilet-visibilite` (Q7, Q71)
- `indicateur-carburant` (Q11)
- `limiteur-vitesse` (Q57)
- `recyclage-air` (Q49, Q93)
- `reglage-appui-tete` (Q45)
- `reglage-hauteur-feux` (Q1, Q65)
- `reglage-volant` (Q19)
- `regulateur-vitesse` (Q33)
- `retroviseur-nuit` (Q3, Q67)
- `voyant-ceinture` (Q39, Q89)
- `voyant-defaut-batterie` (Q23)
- `voyant-portiere` (Q29)
- `voyant-pression-huile` (Q15, Q75)
- `voyant-pression-pneu` (Q63, Q99)
- `voyant-temperature` (Q27, Q83)

### Extérieur (VE)
- `ampoule-arriere` (Q58, Q98)
- `ampoule-avant` (Q56, Q96)
- `balais-essuie-glace` (Q10)
- `capot-ouverture` (Q48, Q64)
- `clignotants-trottoir` (Q14, Q74)
- `coffre-ouverture` (Q60, Q62)
- `dispositifs-reflechissants` (Q28)
- `eclairage-plaque` (Q40)
- `emplacement-batterie` (Q24)
- `essuie-glace-arriere` (Q59, Q97)
- `essuie-glaces-avant` (Q5, Q69)
- `feux-brouillard-arriere-controle` (Q16)
- `feux-croisement` (Q26, Q82)
- `feux-detresse-controle` (Q18, Q76)
- `feux-diurnes` (Q52, Q92)
- `feux-position` (Q30)
- `feux-recul` (Q44)
- `feux-route-controle` (Q20, Q78)
- `feux-stop` (Q46, Q90)
- `flanc-pneu` (Q4, Q68)
- `gicleurs-lave-glace` (Q66, Q100)
- `isofix` (Q61)
- `niveau-huile-moteur` (Q22, Q80)
- `niveau-liquide-frein` (Q8, Q70)
- `plaque-pression-pneu` (Q38, Q86)
- `plaques-immatriculation` (Q6)
- `remplissage-huile` (Q36)
- `remplissage-lave-glace` (Q2, Q50)
- `remplissage-refroidissement` (Q12, Q72)
- `securite-enfant` (Q42, Q88)
- `temoin-usure-pneu` (Q32, Q84)
- `trappe-carburant` (Q34)
- `triangle-presignalisation` (Q54, Q94)

**Total : 59 gestes × 4 photos = 236 photos** au lieu de 384.

## Questions sans photo (mode QCM couleur)

Les questions **Q25, Q47, Q55, Q81** sont en mode QCM couleur (rouge/orange/jaune/vert)
et n'ont pas besoin de photos — elles utilisent le composant QcmCard standard.
