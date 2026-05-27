import { useState } from 'react'
import { gesteKeyFor } from '../lib/gesteImages'
import { GESTURE_ZONES } from '../lib/gesteZones'
import CarDiagram from './CarDiagram'

/**
 * Carte pour les sous-parties en mode geste_interieur ou geste_exterieur.
 *
 * Flow :
 *   1. Affiche la consigne (énoncé) + schéma sans surbrillance (cliquable librement)
 *   2. L'utilisateur réfléchit, peut cliquer les zones pour explorer
 *   3. Clique « Voir la réponse modèle » → révèle la réponse + met en évidence la bonne zone
 *   4. 3 boutons d'auto-éval :
 *      - Je savais ✓        → onComplete(true)
 *      - Pas sûr ~          → onComplete(false)
 *      - Pas du tout ✕     → onComplete(false)
 */
export default function GesteCard({ data, type, onComplete, qid }) {
  const [revealed, setRevealed] = useState(false)
  const [selectedZone, setSelectedZone] = useState(null)

  // Schéma annoté — disponible si la question a un geste mappé
  const gesteKey   = qid != null ? gesteKeyFor(qid) : null
  const hasZone    = gesteKey != null && GESTURE_ZONES[gesteKey] != null
  const correctZone = hasZone ? GESTURE_ZONES[gesteKey].zone : null

  function handleReveal() {
    setRevealed(true)
    if (correctZone) setSelectedZone(correctZone)
  }

  const isInterieur = data.mode === 'geste_interieur'
  const placeIcon = isInterieur ? '🪑' : '🚗'
  const placeLabel = isInterieur
    ? 'Imagine-toi au volant'
    : 'Imagine-toi autour du véhicule'

  return (
    <>
      {hasZone && (
        <CarDiagram
          gesteKey={gesteKey}
          selectedZone={selectedZone}
          onZoneClick={(id) => setSelectedZone(id)}
        />
      )}
      <div className="geste-context">
        <span className="geste-context__icon">{placeIcon}</span>
        <span className="geste-context__label">{placeLabel}</span>
      </div>

      {!revealed ? (
        <div className="geste-step geste-step--prompt">
          <p className="geste-step__hint">
            Réfléchis à ton geste, puis vérifie avec la réponse modèle.
          </p>
          <button
            className="btn btn--primary geste-step__reveal-btn"
            type="button"
            onClick={handleReveal}
          >
            👁 Voir la réponse modèle
          </button>
        </div>
      ) : (
        <div className="geste-step geste-step--revealed">
          {data.reponse ? (
            <div className="subpart-modele">
              <div className="subpart-modele__label">Réponse modèle</div>
              <div className="subpart-modele__text">{data.reponse}</div>
            </div>
          ) : (
            <div className="subpart-modele subpart-modele--empty">
              <div className="subpart-modele__label">Geste à exécuter</div>
              <div className="subpart-modele__text">
                Pour cette vérification, il n'y a pas de réponse textuelle —
                c'est un geste à montrer à l'examinateur (voir l'énoncé).
              </div>
            </div>
          )}

          <div className="geste-eval">
            <div className="geste-eval__label">Tu connaissais ce geste ?</div>
            <div className="geste-eval__buttons">
              <button
                className="btn geste-eval__btn geste-eval__btn--ok"
                type="button"
                onClick={() => onComplete(true)}
              >
                ✓ Je savais
              </button>
              <button
                className="btn geste-eval__btn geste-eval__btn--mid"
                type="button"
                onClick={() => onComplete(false)}
              >
                ~ Pas sûr
              </button>
              <button
                className="btn geste-eval__btn geste-eval__btn--ko"
                type="button"
                onClick={() => onComplete(false)}
              >
                ✕ Pas du tout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
