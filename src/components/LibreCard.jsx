import { useState } from 'react'
import { evaluate } from '../lib/matching'

/**
 * Carte pour les sous-parties en mode libre.
 *
 * L'utilisateur tape sa réponse en texte libre, puis clique « Valider ».
 * Le moteur de matching ([[src/lib/matching.js]]) évalue la réponse
 * contre les mots-clés essentiels et rend l'un des 3 verdicts :
 *
 *   • excellent  → tous les mots-clés trouvés
 *   • proche     → au moins 1 mais pas tous (on liste les manquants)
 *   • horssujet  → aucun (on affiche la réponse modèle)
 */
export default function LibreCard({ data, onComplete }) {
  const [userInput, setUserInput] = useState('')
  const [result, setResult] = useState(null)

  function handleValidate() {
    const trimmed = userInput.trim()
    if (!trimmed) return
    const evalResult = evaluate(trimmed, data.mots_cles || [])
    setResult(evalResult)
  }

  function handleContinue() {
    // wasCorrect = true seulement si « excellent ». « proche » et
    // « horssujet » comptent comme à revoir.
    const wasCorrect = result?.verdict === 'excellent'
    onComplete(wasCorrect)
  }

  if (!result) {
    return (
      <div className="libre-input">
        <label className="libre-input__label" htmlFor="libre-textarea">
          Ta réponse — tape-la avec tes propres mots
        </label>
        <textarea
          id="libre-textarea"
          className="libre-input__textarea"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Réponds librement, les mots-clés seront détectés automatiquement…"
          rows={4}
          autoFocus
        />
        <div className="libre-input__hint">
          💡 Pas besoin de la formulation exacte du PDF — fautes de frappe, accents et conjugaisons sont tolérés.
        </div>
        <div className="libre-input__cta">
          <button
            className="btn btn--primary"
            type="button"
            onClick={handleValidate}
            disabled={!userInput.trim()}
          >
            Valider ma réponse
          </button>
        </div>
      </div>
    )
  }

  return <LibreVerdict result={result} userInput={userInput} modeleReponse={data.reponse} onContinue={handleContinue} />
}

function LibreVerdict({ result, userInput, modeleReponse, onContinue }) {
  const { verdict, found, missing, total } = result

  let headIcon, headText, headClass, helpText
  if (verdict === 'excellent') {
    headIcon = '✓'
    headText = 'Excellent !'
    headClass = 'verdict--ok'
    helpText = `Tu as identifié tous les éléments essentiels (${total}/${total}).`
  } else if (verdict === 'proche') {
    headIcon = '~'
    headText = 'Proche'
    headClass = 'verdict--mid'
    helpText = `Tu as trouvé ${found.length}/${total} mots-clés essentiels. Il en manque quelques-uns.`
  } else {
    headIcon = '✕'
    headText = 'Hors sujet'
    headClass = 'verdict--ko'
    helpText = `Aucun des ${total} mots-clés essentiels n'a été reconnu dans ta réponse.`
  }

  return (
    <div className="libre-verdict">
      <div className={`verdict ${headClass}`}>
        <div className="verdict__head">{headIcon} {headText}</div>
        <div className="verdict__text">{helpText}</div>

        {(found.length > 0 || missing.length > 0) && (
          <div className="libre-verdict__chips">
            {found.length > 0 && (
              <div className="memo">
                <span className="memo__label">Trouvés</span>
                {found.map((k) => (
                  <span key={k} className="memo__chip memo__chip--ok">✓ {k}</span>
                ))}
              </div>
            )}
            {missing.length > 0 && (
              <div className="memo">
                <span className="memo__label">Manquants</span>
                {missing.map((k) => (
                  <span key={k} className="memo__chip memo__chip--ko">✕ {k}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ta réponse rappelée */}
      <div className="libre-userinput">
        <div className="libre-userinput__label">Ta réponse</div>
        <div className="libre-userinput__text">« {userInput} »</div>
      </div>

      {/* Réponse modèle (toujours affichée pour apprendre) */}
      {modeleReponse && (
        <div className="subpart-modele">
          <div className="subpart-modele__label">Réponse modèle</div>
          <div className="subpart-modele__text">{modeleReponse}</div>
        </div>
      )}

      <div className="qcm-verdict__cta">
        <button className="btn btn--primary" type="button" onClick={onContinue}>
          Continuer →
        </button>
      </div>
    </div>
  )
}
