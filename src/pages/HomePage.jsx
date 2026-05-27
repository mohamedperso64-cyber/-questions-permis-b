import { useRef, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import Speedometer from '../components/Speedometer'
import RoadScene from '../components/RoadScene'
import { drawRandomQuestion, recordDraw } from '../lib/storage'

// Échelle : V_CRUISE ≈ 23.33 vw/s × 3 = 70 km/h en croisière
const SPEED_SCALE_KMH_PER_VW_PER_S = 3
const NEEDLE_DAMPING = 0.06

const MODES = [
  {
    slug: 'theme',
    icon: '📚',
    title: 'Par thème',
    description: 'Choisis ta catégorie : feux, pneus, premiers secours, etc.',
  },
  {
    slug: 'erreurs',
    icon: '↻',
    title: 'Mes erreurs',
    description: 'Reprends uniquement les questions que tu as ratées.',
  },
  {
    slug: 'liste',
    icon: '☰',
    title: 'Liste complète',
    description: 'Parcours les 100 questions dans l\'ordre, à ton rythme.',
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const speedoRef = useRef(null)
  const displayedKmhRef = useRef(0)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawnQuestion, setDrawnQuestion] = useState(null)

  const handleRoadUpdate = useCallback(({ velocityVwPerS, distanceVw }) => {
    if (!speedoRef.current) return
    const targetKmh = velocityVwPerS * SPEED_SCALE_KMH_PER_VW_PER_S
    displayedKmhRef.current += (targetKmh - displayedKmhRef.current) * NEEDLE_DAMPING
    speedoRef.current.setSpeed(displayedKmhRef.current)
    speedoRef.current.setOdometer(distanceVw)
  }, [])

  const handleDraw = useCallback(async () => {
    if (isDrawing || !speedoRef.current) return
    setIsDrawing(true)
    setDrawnQuestion(null)

    const newQid = drawRandomQuestion()
    await speedoRef.current.spinSelector(newQid)
    recordDraw(newQid)

    setDrawnQuestion(newQid)
    setIsDrawing(false)
  }, [isDrawing])

  const handleGo = useCallback(() => {
    if (drawnQuestion != null) {
      navigate(`/question/${drawnQuestion}`)
    }
  }, [drawnQuestion, navigate])

  return (
    <div className="app-shell">
      <SiteHeader />

      <section className="hero">
        <div className="hero__eyebrow">— Banque officielle DSR · 100 questions —</div>
        <h2 className="hero__title">
          Le compteur tire <em>au hasard</em>,
          <br />
          tu réponds en toute conscience.
        </h2>
        <p className="hero__lead">
          Révise les questions de l'examen pratique du permis B :
          vérifications intérieures et extérieures, sécurité routière et
          premiers secours. Aucune inscription, ta progression reste sur ton
          navigateur.
        </p>

        <div className={`hero__speedo-wrap ${isDrawing ? 'hero__speedo-wrap--spinning' : ''}`}>
          <Speedometer ref={speedoRef} digits="00047" highlightLast={2} needleValue={0} size={340} />
        </div>
        <div className="odometer-caption">
          {isDrawing
            ? 'Tirage en cours…'
            : drawnQuestion != null
              ? `Question Q${drawnQuestion} sélectionnée 🎯`
              : 'Les deux derniers chiffres dorés sélectionneront ta prochaine question'
          }
        </div>

        {/* CTA : on bascule entre « Tirer » et « C'est parti » */}
        <div className="hero__cta">
          {drawnQuestion == null ? (
            <>
              <button
                className="btn btn--primary"
                type="button"
                onClick={handleDraw}
                disabled={isDrawing}
              >
                {isDrawing ? '⏳ Tirage en cours…' : '🎯 Tirer une question'}
              </button>
              {!isDrawing && (
                <span className="hero__cta-note">
                  Le compteur sélectionne une question au hasard
                </span>
              )}
            </>
          ) : (
            <>
              <div className="draw-result">
                <button className="btn btn--primary draw-result__go" type="button" onClick={handleGo}>
                  C'est parti vers la Q{drawnQuestion} →
                </button>
                <button className="btn btn--ghost" type="button" onClick={handleDraw}>
                  ↻ Re-tirer
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      <RoadScene onUpdate={handleRoadUpdate} />

      <section className="section">
        <h3 className="section__title">Ou choisis ton mode de révision</h3>
        <div className="mode-grid">
          {MODES.map((m) => (
            <Link key={m.slug} to={`/mode/${m.slug}`} className="mode-card">
              <div className="mode-card__icon" aria-hidden="true">{m.icon}</div>
              <div className="mode-card__body">
                <div className="mode-card__title">{m.title}</div>
                <div className="mode-card__desc">{m.description}</div>
              </div>
              <div className="mode-card__arrow" aria-hidden="true">→</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <h3 className="section__title">Fiches de révision</h3>
        <div className="mode-grid">
          <Link to="/annexes/voyants" className="mode-card">
            <div className="mode-card__icon" aria-hidden="true">🔴</div>
            <div className="mode-card__body">
              <div className="mode-card__title">Voyants du tableau de bord</div>
              <div className="mode-card__desc">
                27 voyants expliqués : couleur, signification, niveau d'urgence.
              </div>
            </div>
            <div className="mode-card__arrow" aria-hidden="true">→</div>
          </Link>
        </div>
      </section>

      <footer className="footer">
        100 questions · Banque officielle DSR/BRPCE · 2023
      </footer>
    </div>
  )
}
