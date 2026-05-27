import { useState, useMemo } from 'react'

/**
 * Carte pour les sous-parties en mode QCM.
 *
 * Affiche 4 options (1 correcte + 3 distracteurs, ordre randomisé).
 * Clic sur une option → verdict immédiat avec couleur (vert/rouge),
 * affichage des mots-clés mémo « À retenir », puis bouton « Continuer ».
 */
export default function QcmCard({ data, onComplete }) {
  // On randomise l'ordre une seule fois au montage du composant
  const options = useMemo(() => {
    const all = [
      { text: data.reponse, isCorrect: true },
      ...(data.distracteurs || []).map((t) => ({ text: t, isCorrect: false })),
    ]
    return shuffle(all)
  }, [data])

  const [selectedIdx, setSelectedIdx] = useState(null)
  const revealed = selectedIdx !== null

  function handlePick(idx) {
    if (revealed) return
    setSelectedIdx(idx)
  }

  function handleContinue() {
    const wasCorrect = options[selectedIdx]?.isCorrect ?? false
    onComplete(wasCorrect)
  }

  const wasCorrect = revealed && options[selectedIdx]?.isCorrect

  return (
    <>
      <ul className="qcm-list">
        {options.map((opt, i) => {
          let classes = 'qcm-option'
          if (revealed) {
            if (opt.isCorrect) classes += ' qcm-option--correct'
            else if (i === selectedIdx) classes += ' qcm-option--wrong'
            else classes += ' qcm-option--dim'
          }
          if (!revealed) classes += ' qcm-option--clickable'

          return (
            <li
              key={i}
              className={classes}
              onClick={() => handlePick(i)}
              role="button"
              tabIndex={revealed ? -1 : 0}
              onKeyDown={(e) => {
                if (!revealed && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  handlePick(i)
                }
              }}
            >
              <span className="qcm-option__letter">{String.fromCharCode(65 + i)}</span>
              <span className="qcm-option__text">{opt.text}</span>
              {revealed && opt.isCorrect && (
                <span className="qcm-option__marker" aria-label="bonne réponse">✓</span>
              )}
              {revealed && !opt.isCorrect && i === selectedIdx && (
                <span className="qcm-option__marker" aria-label="mauvaise réponse">✕</span>
              )}
            </li>
          )
        })}
      </ul>

      {revealed && (
        <div className="qcm-verdict">
          <div className={`qcm-verdict__head qcm-verdict__head--${wasCorrect ? 'ok' : 'ko'}`}>
            {wasCorrect ? '✓ Bonne réponse !' : '✕ Mauvaise réponse'}
          </div>

          {data.mots_cles_memo && data.mots_cles_memo.length > 0 && (
            <div className="memo qcm-verdict__memo">
              <span className="memo__label">🔑 À retenir</span>
              {data.mots_cles_memo.map((m) => (
                <span key={m} className="memo__chip">{m}</span>
              ))}
            </div>
          )}

          <div className="qcm-verdict__cta">
            <button className="btn btn--primary" type="button" onClick={handleContinue}>
              Continuer →
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// === Fisher-Yates shuffle ===
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
