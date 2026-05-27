/**
 * Barre de progression à 3 étapes pour la page question.
 * Affiche un point/segment par sous-partie (Vérif · QSER · Secours).
 */
export default function SubPartProgress({ parts, activeIdx, results }) {
  return (
    <div className="subpart-progress" role="status" aria-label="Progression de la question">
      {parts.map((p, i) => {
        const result = results[i]
        let state = 'pending'
        if (i < activeIdx || (result !== null && result !== undefined)) {
          state = result?.wasCorrect ? 'done-ok' : result ? 'done-ko' : 'done'
        }
        if (i === activeIdx && !result) state = 'active'

        return (
          <div key={p.key} className={`subpart-progress__step subpart-progress__step--${state}`}>
            <div className="subpart-progress__dot">
              {state === 'done-ok' && '✓'}
              {state === 'done-ko' && '✕'}
              {state === 'active' && (i + 1)}
              {state === 'pending' && (i + 1)}
            </div>
            <div className="subpart-progress__label">{p.label}</div>
            {i < parts.length - 1 && <div className="subpart-progress__line" aria-hidden="true" />}
          </div>
        )
      })}
    </div>
  )
}
