import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SubPartProgress from '../components/SubPartProgress'
import GesteCard from '../components/GesteCard'
import QcmCard from '../components/QcmCard'
import LibreCard from '../components/LibreCard'
import questionsData from '../data/questions_enrichies.json'
import { drawRandomQuestion, recordDraw, markAnswered } from '../lib/storage'

const PART_DEFS = [
  { key: 'verif',   label: 'Vérification',     icon: '🔧' },
  { key: 'qser',    label: 'Sécurité routière', icon: '🛣️' },
  { key: 'secours', label: 'Premiers secours',  icon: '🏥' },
]

const MODE_LABELS = {
  geste_interieur: { label: 'Geste intérieur',  badge: 'badge--vi' },
  geste_exterieur: { label: 'Geste extérieur',  badge: 'badge--ve' },
  qcm:             { label: 'QCM',              badge: 'badge--qcm' },
  libre:           { label: 'Réponse libre',    badge: 'badge--libre' },
}

export default function QuestionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qid = parseInt(id, 10)
  const question = useMemo(() => questionsData.find((q) => q.id === qid), [qid])

  const [activeIdx, setActiveIdx] = useState(0)
  const [results, setResults] = useState([null, null, null])

  if (!question) {
    return (
      <div className="app-shell">
        <SiteHeader />
        <section className="hero">
          <h2 className="hero__title">Question introuvable</h2>
          <p className="hero__lead">La question #{id} n'existe pas dans la banque.</p>
          <div className="hero__cta">
            <Link to="/" className="btn btn--primary">← Retour à l'accueil</Link>
          </div>
        </section>
      </div>
    )
  }

  const parts = PART_DEFS.map((p) => ({ ...p, data: question[p.key] }))

  function handleComplete(wasCorrect, verdict = null) {
    const next = [...results]
    next[activeIdx] = { wasCorrect, verdict }
    setResults(next)

    if (activeIdx < parts.length - 1) {
      setTimeout(() => setActiveIdx(activeIdx + 1), 300)
    } else {
      const overallCorrect = next.every((r) => r && r.wasCorrect)
      markAnswered(qid, overallCorrect)
    }
  }

  function handleNextRandom() {
    const next = drawRandomQuestion()
    recordDraw(next)
    setActiveIdx(0)
    setResults([null, null, null])
    navigate(`/question/${next}`)
  }

  const isDone = results.every((r) => r !== null)
  const activePart = parts[activeIdx]

  return (
    <div className="app-shell">
      <SiteHeader />

      <section className="hero" style={{ paddingBottom: 'var(--space-2)' }}>
        <div className="hero__eyebrow">— Question {qid} / 100 —</div>
        <h2 className="hero__title" style={{ fontSize: 32 }}>
          {question.type === 'VI' ? 'Vérification intérieure' : 'Vérification extérieure'}
        </h2>
      </section>

      <SubPartProgress parts={parts} activeIdx={activeIdx} results={results} />

      <section className="section">
        {!isDone ? (
          <SubPartCard
            part={activePart}
            type={question.type}
            qid={qid}
            onComplete={handleComplete}
          />
        ) : (
          <RecapCard
            question={question}
            parts={parts}
            results={results}
            onNextRandom={handleNextRandom}
          />
        )}
      </section>
    </div>
  )
}

// ===================================================================
// Carte de sous-partie (placeholder — sera remplacée par les vrais
// composants GesteCard / QcmCard / LibreCard en 7c, 7d, 7e).
// ===================================================================

function SubPartCard({ part, type, onComplete, qid }) {
  const modeInfo = MODE_LABELS[part.data.mode] || { label: part.data.mode, badge: '' }

  return (
    <div className="q-card">
      <div className="q-card__meta">
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{part.icon}</span>
          <span>{part.label}</span>
          <span className={`badge ${modeInfo.badge}`}>{modeInfo.label}</span>
        </span>
        <span className="q-card__number">Q{String(part.data.question ? '' : '')} </span>
      </div>

      <div className="q-card__question">{part.data.question}</div>

      {renderModeContent(part, type, onComplete, qid)}
    </div>
  )
}

/**
 * Dispatch selon le mode de la sous-partie.
 * Pour l'instant, seul le mode `geste_*` a son vrai composant.
 * Les autres restent en placeholder en attendant 7d (QCM) et 7e (Libre).
 */
function renderModeContent(part, type, onComplete, qid) {
  const mode = part.data.mode

  // Pour le geste, on essaie d'abord le mode visuel (4 vignettes) ;
  // si pas d'images, GesteImageCard fallback automatiquement sur GesteCard.
  // On ne fait ça QUE pour la sous-partie "verif" (la seule réellement gestuelle).
  if (mode === 'geste_interieur' || mode === 'geste_exterieur') {
    return <GesteCard data={part.data} type={type} onComplete={onComplete} qid={qid} />
  }

  if (mode === 'qcm') {
    return <QcmCard data={part.data} onComplete={onComplete} />
  }

  if (mode === 'libre') {
    return <LibreCard data={part.data} onComplete={onComplete} />
  }

  // Fallback (ne devrait pas arriver — tous les modes sont gérés)
  return (
    <div className="subpart-actions__placeholder-note">
      ⚠️ Mode inconnu : <code>{mode}</code>
    </div>
  )
}

// ===================================================================
// Récap de fin de question
// ===================================================================

function RecapCard({ question, parts, results, onNextRandom }) {
  const allCorrect = results.every((r) => r.wasCorrect)
  const score = results.filter((r) => r.wasCorrect).length

  return (
    <div className="q-card recap">
      <div className="recap__head">
        <div className="recap__title">
          {allCorrect ? '🎉 Bravo !' : score === 0 ? '😬 À revoir' : '👌 Pas mal'}
        </div>
        <div className="recap__score">
          {score} / 3 sous-parties réussies
        </div>
      </div>

      <ul className="recap__list">
        {parts.map((p, i) => {
          const r = results[i]
          return (
            <li key={p.key} className={`recap__item recap__item--${r.wasCorrect ? 'ok' : 'ko'}`}>
              <span className="recap__icon">{r.wasCorrect ? '✓' : '✕'}</span>
              <span className="recap__label">{p.icon} {p.label}</span>
              <span className="recap__mode">{p.data.mode.replace('_', ' ')}</span>
            </li>
          )
        })}
      </ul>

      <div className="recap__cta">
        <button className="btn btn--primary" type="button" onClick={onNextRandom}>
          🎯 Question suivante (au hasard) →
        </button>
        <Link to="/" className="btn btn--ghost">↩ Retour à l'accueil</Link>
      </div>
    </div>
  )
}
