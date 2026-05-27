import { useRef, useCallback } from 'react'
import SiteHeader from '../components/SiteHeader'
import Speedometer from '../components/Speedometer'
import RoadScene from '../components/RoadScene'

const SPEED_SCALE_KMH_PER_VW_PER_S = 3
const NEEDLE_DAMPING = 0.06

const SWATCHES = [
  { name: 'Fond papier', hex: '#F7F4ED', color: '#F7F4ED' },
  { name: 'Surface', hex: '#FFFFFF', color: '#FFFFFF' },
  { name: 'Bleu océan', hex: '#1B6BA0', color: '#1B6BA0' },
  { name: 'Océan profond', hex: '#0F3F5F', color: '#0F3F5F' },
  { name: 'Anthracite', hex: '#1C2128', color: '#1C2128' },
  { name: 'Ardoise', hex: '#4A5568', color: '#4A5568' },
  { name: 'Bronze antique', hex: '#A8843A', color: '#A8843A' },
  { name: 'Succès', hex: '#2D7D32', color: '#2D7D32' },
  { name: 'Orange doux', hex: '#C8772E', color: '#C8772E' },
  { name: 'Danger', hex: '#C32A2A', color: '#C32A2A' },
]

export default function StyleguidePage() {
  const speedoRef = useRef(null)
  const displayedKmhRef = useRef(0)

  const handleRoadUpdate = useCallback(({ velocityVwPerS, distanceVw }) => {
    if (!speedoRef.current) return
    const targetKmh = velocityVwPerS * SPEED_SCALE_KMH_PER_VW_PER_S
    displayedKmhRef.current += (targetKmh - displayedKmhRef.current) * NEEDLE_DAMPING
    speedoRef.current.setSpeed(displayedKmhRef.current)
    speedoRef.current.setOdometer(distanceVw)
  }, [])

  return (
    <div className="app-shell">
      <SiteHeader />

      <section className="hero">
        <div className="hero__eyebrow">— Référence de design interne —</div>
        <h2 className="hero__title">
          Style <em>guide</em>
        </h2>
        <p className="hero__lead">
          Tous les éléments visuels du projet rassemblés en un seul endroit :
          palette, typographies, composants, animation de scène.
        </p>

        <div className="hero__speedo-wrap">
          <Speedometer ref={speedoRef} digits="00047" highlightLast={2} needleValue={0} size={340} />
        </div>
        <div className="odometer-caption">
          Aiguille et chiffres liés en temps réel à la voiture (route ci-dessous)
        </div>
      </section>

      <RoadScene onUpdate={handleRoadUpdate} />

      <section className="section">
        <h3 className="section__title">Palette</h3>
        <div className="palette">
          {SWATCHES.map((s) => (
            <div key={s.name} className="swatch">
              <div className="swatch__block" style={{ background: s.color }} />
              <div className="swatch__name">{s.name}</div>
              <div className="swatch__hex">{s.hex}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h3 className="section__title">Typographies</h3>
        <div className="type-grid">
          <div className="type-row">
            <div className="type-row__label">Titres · Playfair Display (serif)</div>
            <div className="type-row__sample--display">
              Permis <em>Révision</em>
            </div>
          </div>
          <div className="type-row">
            <div className="type-row__label">Chiffres · Roboto Mono</div>
            <div className="type-row__sample--mono">0 0 0 4 7</div>
          </div>
          <div className="type-row">
            <div className="type-row__label">Corps · Inter</div>
            <div className="type-row__sample--body">
              Pourquoi doit-on régler la hauteur des feux ? Pour ne pas éblouir
              les autres usagers — surtout lors d'un croisement nocturne.
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <h3 className="section__title">Boutons</h3>
        <div className="btn-row">
          <button className="btn btn--primary" type="button">Tirer une question</button>
          <button className="btn btn--slate" type="button">Choisir un mode</button>
          <button className="btn" type="button">Voir la réponse</button>
          <button className="btn btn--ghost" type="button">Retour</button>
        </div>
      </section>

      <section className="section">
        <h3 className="section__title">Badges</h3>
        <div className="badge-row">
          <span className="badge badge--vi">VI · Geste intérieur</span>
          <span className="badge badge--ve">VE · Geste extérieur</span>
          <span className="badge badge--qcm">QCM</span>
          <span className="badge badge--libre">Réponse libre</span>
        </div>
      </section>

      <section className="section">
        <h3 className="section__title">Carte question — mode QCM</h3>
        <div className="q-card">
          <div className="q-card__meta">
            <span>QSER · Sécurité routière</span>
            <span className="q-card__number">Q01 / 100</span>
          </div>
          <div className="q-card__question">
            Pourquoi doit-on régler la hauteur des feux ?
          </div>
          <ul className="qcm-list">
            <li className="qcm-option">
              <span className="qcm-option__letter">A</span>
              Pour mieux éclairer les panneaux de signalisation.
            </li>
            <li className="qcm-option qcm-option--correct">
              <span className="qcm-option__letter">B</span>
              Pour ne pas éblouir les autres usagers.
            </li>
            <li className="qcm-option">
              <span className="qcm-option__letter">C</span>
              Pour adapter l'éclairage selon la vitesse du véhicule.
            </li>
            <li className="qcm-option">
              <span className="qcm-option__letter">D</span>
              Pour économiser la batterie du véhicule.
            </li>
          </ul>
          <div className="memo" style={{ marginTop: 'var(--space-4)' }}>
            <span className="memo__label">À retenir</span>
            <span className="memo__chip">éblouir</span>
            <span className="memo__chip">autres usagers</span>
          </div>
        </div>
      </section>

      <section className="section">
        <h3 className="section__title">Verdicts (mode libre)</h3>
        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          <div className="verdict verdict--ok">
            <div className="verdict__head">✓ Excellent</div>
            <div className="verdict__text">Tous les mots-clés trouvés. Belle réponse.</div>
          </div>
          <div className="verdict verdict--mid">
            <div className="verdict__head">~ Proche</div>
            <div className="verdict__text">
              Tu as bien identifié la notion de « danger ». Il manquait :
              « délimiter », « sur-accident ».
            </div>
          </div>
          <div className="verdict verdict--ko">
            <div className="verdict__head">✕ Hors sujet</div>
            <div className="verdict__text">Aucun mot-clé reconnu. Voici la réponse modèle…</div>
          </div>
        </div>
      </section>

      <footer className="footer">
        Référence de design · Permis Révision · 2023
      </footer>
    </div>
  )
}
