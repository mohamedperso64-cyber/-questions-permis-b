import { useState, useEffect, useMemo } from 'react'
import GesteCard from './GesteCard'
import { gesteKeyFor } from '../lib/gesteImages'

/**
 * Carte « geste » en mode QCM visuel à 4 vignettes.
 *
 * Comportement :
 *   - Récupère la clé de geste de la question (qui peut être partagée
 *     entre plusieurs questions : Q1 ≡ Q65 par exemple).
 *   - Tente de charger 4 images depuis /images/questions/<cle>/
 *     (correct, d1, d2, d3 — .jpg/.jpeg/.png/.webp).
 *   - Si les 4 sont disponibles → affiche le QCM visuel.
 *   - Sinon → fallback vers le GesteCard texte (auto-éval).
 */

const EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'svg']

function tryLoadImage(gesteKey, key) {
  return new Promise((resolve) => {
    let attemptIdx = 0
    function tryNext() {
      if (attemptIdx >= EXTENSIONS.length) { resolve(null); return }
      const ext = EXTENSIONS[attemptIdx++]
      const src = `/images/questions/${gesteKey}/${key}.${ext}`
      const img = new Image()
      img.onload = () => resolve(src)
      img.onerror = tryNext
      img.src = src
    }
    tryNext()
  })
}

function shuffle(array) {
  const a = [...array]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function GesteImageCard({ qid, data, type, onComplete }) {
  const [status, setStatus] = useState('loading') // 'loading' | 'images' | 'fallback'
  const [paths, setPaths] = useState({ correct: null, distractors: [] })
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const gesteKey = gesteKeyFor(qid)
    if (!gesteKey) { setStatus('fallback'); return }

    let cancelled = false
    Promise.all([
      tryLoadImage(gesteKey, 'correct'),
      tryLoadImage(gesteKey, 'd1'),
      tryLoadImage(gesteKey, 'd2'),
      tryLoadImage(gesteKey, 'd3'),
    ]).then(([correct, d1, d2, d3]) => {
      if (cancelled) return
      if (correct && d1 && d2 && d3) {
        setPaths({ correct, distractors: [d1, d2, d3] })
        setStatus('images')
      } else {
        setStatus('fallback')
      }
    })
    return () => { cancelled = true }
  }, [qid])

  // Options mélangées pour ne pas avoir la bonne réponse toujours en première position.
  // Calculées une seule fois quand on a les chemins.
  const options = useMemo(() => {
    if (status !== 'images') return []
    return shuffle([
      { src: paths.correct, isCorrect: true },
      ...paths.distractors.map((src) => ({ src, isCorrect: false })),
    ])
  }, [status, paths])

  // === État de chargement ===
  if (status === 'loading') {
    return (
      <div className="geste-image-loading" aria-live="polite">
        <span className="geste-image-loading__spinner" aria-hidden="true" />
        Chargement…
      </div>
    )
  }

  // === Pas d'images : fallback vers l'auto-éval texte ===
  if (status === 'fallback') {
    return <GesteCard data={data} type={type} onComplete={onComplete} />
  }

  // === QCM visuel ===
  const isInterieur = data.mode === 'geste_interieur'
  const placeIcon = isInterieur ? '🪑' : '🚗'
  const placeLabel = isInterieur
    ? 'Identifie l\'emplacement à l\'intérieur du véhicule'
    : 'Identifie l\'emplacement à l\'extérieur du véhicule'

  function handlePick(opt) {
    if (revealed) return
    setSelected(opt)
    setRevealed(true)
  }

  function handleContinue() {
    onComplete(selected?.isCorrect === true)
  }

  return (
    <>
      <div className="geste-context">
        <span className="geste-context__icon">{placeIcon}</span>
        <span className="geste-context__label">{placeLabel}</span>
      </div>

      <div className="geste-image-grid">
        {options.map((opt, i) => {
          const isSelected = selected === opt
          let stateClass = ''
          if (revealed) {
            if (opt.isCorrect) stateClass = 'geste-image-option--correct'
            else if (isSelected) stateClass = 'geste-image-option--wrong'
            else stateClass = 'geste-image-option--dim'
          }
          return (
            <button
              key={i}
              type="button"
              className={`geste-image-option ${stateClass}`}
              onClick={() => handlePick(opt)}
              disabled={revealed}
              aria-label={`Proposition ${String.fromCharCode(65 + i)}`}
            >
              <img src={opt.src} alt="" loading="lazy" />
              <div className="geste-image-option__letter">{String.fromCharCode(65 + i)}</div>
              {revealed && opt.isCorrect && (
                <div className="geste-image-option__badge geste-image-option__badge--ok">✓ Bonne réponse</div>
              )}
              {revealed && isSelected && !opt.isCorrect && (
                <div className="geste-image-option__badge geste-image-option__badge--ko">✕ Ton choix</div>
              )}
            </button>
          )
        })}
      </div>

      {revealed && (
        <div className="geste-image-result">
          {selected?.isCorrect ? (
            <div className="verdict verdict--ok">
              <div className="verdict__head">✓ Bonne réponse !</div>
              <div className="verdict__text">Tu as identifié le bon emplacement.</div>
            </div>
          ) : (
            <div className="verdict verdict--ko">
              <div className="verdict__head">✕ Mauvais emplacement</div>
              <div className="verdict__text">
                Ce n'était pas la bonne vignette — vois ci-dessus quelle était la bonne.
              </div>
            </div>
          )}

          {data.reponse && (
            <div className="subpart-modele" style={{ marginTop: 'var(--space-3)' }}>
              <div className="subpart-modele__label">Réponse modèle</div>
              <div className="subpart-modele__text">{data.reponse}</div>
            </div>
          )}

          <div className="qcm-verdict__cta" style={{ marginTop: 'var(--space-4)' }}>
            <button className="btn btn--primary" type="button" onClick={handleContinue}>
              Continuer →
            </button>
          </div>
        </div>
      )}
    </>
  )
}
