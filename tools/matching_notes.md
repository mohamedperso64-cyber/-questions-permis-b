# Notes pour l'implémentation du moteur de matching (étape 7)

## Cas à gérer absolument

### 1. Stem matching (conjugaisons / formes dérivées)
Les mots-clés sont écrits en forme **infinitive** (comme un utilisateur les taperait), mais les réponses modèles utilisent souvent des **participes présents** ou autres formes :

| Q | Mot-clé | Forme dans la réponse |
|---|---|---|
| 1, 38, 65, 86 | `délimiter` | « En **délimitant** clairement... » |
| 12, 55, 72 | `appuyer` | « En **appuyant** fortement... » |

Le matcher doit reconnaître ces variantes. Solutions :
- Racinisation (stemming) — librairies JS : `natural`, `snowball-stemmers`
- OU matching par préfixe : `délimit` matche `délimiter` ET `délimitant`
- OU distance de Levenshtein avec seuil tolérant

### 2. Normalisation des apostrophes
Les keywords utilisent `'` (droite, U+0027) mais le PDF source utilise `'` (courbe, U+2019) :

| Q | Mot-clé | Réponse |
|---|---|---|
| 3, 39, 67, 89 | `fin d'alerte` | « signal de **fin d'alerte** » |

→ Normaliser : remplacer `'` par `'` (et vice-versa) avant comparaison.

### 3. Autres normalisations à appliquer en chaîne
- **Casse** : `SNA` = `sna`
- **Accents** : `éblouir` = `eblouir` (NFD + suppression marques diacritiques)
- **Ponctuation** : ignorer virgules, points, points-virgules
- **Espaces** : collapse `  ` → ` `

### 4. Fautes de frappe tolérées
Distance de Levenshtein ≤ 2 sur les mots de longueur ≥ 4 :
- `eblouire` matche `éblouir`
- `delimité` matche `délimiter`

### 5. Cas spéciaux : numéros/codes
Les keywords numériques (`18`, `15`, `112`, `0,2 g/l`, `5 jours`, `10 ans`, `30`) doivent matcher **exactement** sans fuzzy.

### 6. Multi-mots
Les keywords comme `arrêt cardiaque` ou `mauvaise visibilité` doivent matcher si les deux mots apparaissent (de préférence consécutivement, sinon proches).

## Algorithme suggéré (pseudo-code)

```js
function matchKeyword(userText, keyword) {
  const normUser = normalize(userText);
  const normKw = normalize(keyword);
  
  // Numérique exact
  if (/^\d/.test(normKw)) {
    return normUser.includes(normKw);
  }
  
  // Multi-mot
  if (normKw.includes(' ')) {
    return normUser.includes(normKw);
  }
  
  // Stem / préfixe / fuzzy
  return matchStem(normUser, normKw) 
      || matchPrefix(normUser, normKw, 4)
      || matchFuzzy(normUser, normKw, 2);
}

function normalize(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/\p{M}/gu, '')   // remove accents
    .replace(/['']/g, "'")                       // normalize apostrophes
    .replace(/[.,;:!?]/g, ' ')                   // remove punctuation
    .replace(/\s+/g, ' ').trim();
}
```

## Verdict à afficher

- **Excellent** ✅ : tous les mots-clés trouvés
- **Proche** 🟡 : au moins 1 mais pas tous → afficher la liste des manquants
- **Hors sujet** ❌ : aucun → afficher la réponse modèle
