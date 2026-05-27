// Tests rapides du moteur de matching.
// Lance avec : node tools/test_matching.mjs
import { matchKeyword, evaluate } from '../src/lib/matching.js'

let passed = 0, failed = 0

function assert(cond, label) {
  if (cond) { passed++; console.log('  ✅', label) }
  else      { failed++; console.log('  ❌', label) }
}

function shouldMatch(text, kw, label) {
  assert(matchKeyword(text, kw), `${label}  |  "${text}"  ⊇  "${kw}"`)
}
function shouldNotMatch(text, kw, label) {
  assert(!matchKeyword(text, kw), `${label}  |  "${text}"  ⊉  "${kw}"`)
}

console.log('\n=== Cas évidents ===')
shouldMatch('Pour ne pas éblouir les autres usagers', 'éblouir', 'mot exact')
shouldMatch('Pour ne pas éblouir les autres usagers', 'usagers', 'mot exact bis')
shouldNotMatch('Pour rouler en sécurité', 'éblouir', 'mot absent')

console.log('\n=== Accents et casse ===')
shouldMatch('POUR NE PAS EBLOUIR', 'éblouir', 'casse + accent')
shouldMatch('éblouissement', 'éblouir', 'racine (suffixe -issement)')
shouldMatch('eblouir', 'éblouir', 'sans accent')

console.log('\n=== Apostrophes ===')
shouldMatch("Le signal de fin d'alerte continu", "fin d'alerte", "apostrophe droite")
shouldMatch('Le signal de fin d’alerte continu', "fin d'alerte", 'apostrophe courbe')
shouldMatch("Le signal de fin d'alerte continu", 'fin d’alerte', 'apostrophe courbe dans le mot-clé')

console.log('\n=== Conjugaisons (stem) ===')
shouldMatch('En délimitant clairement la zone', 'délimiter', 'participe présent → infinitif')
shouldMatch('En appuyant fortement', 'appuyer', 'participe présent → infinitif bis')
shouldMatch('signal sonore qui retentit', 'retentir', 'participe présent → infinitif ter')

console.log('\n=== Fautes de frappe ===')
shouldMatch('Pour ne pas ebloouir', 'éblouir', 'lettre doublée')
shouldMatch('Pour ne pas eblouire', 'éblouir', 'mauvaise terminaison')

console.log('\n=== Mots-clés multi-mots ===')
shouldMatch('Risque de mauvaise visibilité par buée', 'mauvaise visibilité', 'expression entière')
shouldMatch("L'arrêt cardiaque est dangereux", 'arrêt cardiaque', 'expression avec accents')
shouldMatch('mauvaise vision et autres usagers', 'autres usagers', 'expression au milieu')

console.log('\n=== Mots-clés numériques ===')
shouldMatch('À partir de 10 ans', '10 ans', 'nombre + mot')
shouldMatch('À partir de 10ans', '10 ans', 'sans espace')
shouldMatch('Le 18, le 15, le 112', '18', 'numéro seul')
shouldMatch('Le 18, le 15, le 112', '112', 'numéro à 3 chiffres')
shouldMatch('0,2 g/l c\'est zéro verre', '0,2 g/l', 'concentration')
shouldMatch('0.2 g/l c\'est zéro verre', '0,2 g/l', 'virgule → point')

console.log('\n=== Cas de non-match (vérification anti-faux-positif) ===')
shouldNotMatch('Pour rouler en sécurité', 'éblouir', 'mot vraiment absent')
shouldNotMatch('rien ici', 'mauvaise visibilité', 'expression absente')
shouldNotMatch('Le code de la route', '18', 'pas de chiffre')

console.log('\n=== Evaluate() — verdicts ===')
const e1 = evaluate('Pour ne pas éblouir les autres usagers', ['éblouir', 'usagers'])
assert(e1.verdict === 'excellent', `2/2 mots-clés → excellent (got ${e1.verdict})`)
const e2 = evaluate('Pour ne pas éblouir le conducteur', ['éblouir', 'usagers'])
assert(e2.verdict === 'proche', `1/2 mots-clés → proche (got ${e2.verdict})`)
const e3 = evaluate('Rien à voir', ['éblouir', 'usagers'])
assert(e3.verdict === 'horssujet', `0/2 mots-clés → horssujet (got ${e3.verdict})`)

console.log(`\n=== Résultat : ${passed} passés / ${failed} échoués ===`)
process.exit(failed === 0 ? 0 : 1)
