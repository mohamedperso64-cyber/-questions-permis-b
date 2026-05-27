import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import questionsData from '../data/questions_enrichies.json'
import { getMissedIds, clearMissed } from '../lib/storage'

export default function ErreursPage() {
  const navigate = useNavigate()
  const [missed, setMissed] = useState(() => new Set(getMissedIds()))

  const missedQuestions = useMemo(() => {
    return questionsData.filter((q) => missed.has(q.id))
  }, [missed])

  function handleRetryRandom() {
    if (missedQuestions.length === 0) return
    const pick = missedQuestions[Math.floor(Math.random() * missedQuestions.length)]
    navigate(`/question/${pick.id}`)
  }

  function handleClearAll() {
    if (missedQuestions.length === 0) return
    const ok = window.confirm(
      'Vider ton carnet d\'erreurs ?\n\nLes questions ratées ne te seront plus rappelées tant que tu ne les rates pas à nouveau.'
    )
    if (!ok) return
    clearMissed()
    setMissed(new Set())
  }

  // === Empty state ===
  if (missedQuestions.length === 0) {
    return (
      <div className="app-shell">
        <SiteHeader />
        <section className="hero">
          <div className="hero__eyebrow">— Mes erreurs —</div>
          <h2 className="hero__title">
            <span style={{ fontSize: '1.1em' }}>🎉</span>{' '}
            Ton carnet est <em>vide</em>
          </h2>
          <p className="hero__lead">
            Bravo, tu n'as encore aucune question à revoir.
            Les questions que tu rates pendant tes sessions apparaîtront ici
            pour faire de la révision ciblée.
          </p>
          <div className="hero__cta">
            <Link to="/" className="btn btn--primary">🎯 Tirer une question au hasard</Link>
            <Link to="/mode/liste" className="btn btn--ghost">Voir la liste complète</Link>
          </div>
        </section>
      </div>
    )
  }

  // === Filled state ===
  return (
    <div className="app-shell">
      <SiteHeader />

      <section className="hero" style={{ paddingBottom: 'var(--space-4)' }}>
        <div className="hero__eyebrow">— Mes erreurs —</div>
        <h2 className="hero__title">
          {missedQuestions.length} question{missedQuestions.length > 1 ? 's' : ''} à <em>revoir</em>
        </h2>
        <p className="hero__lead">
          Voici les questions que tu n'as pas (encore) complètement réussies.
          Reprends-les pour bien les ancrer — elles sortiront automatiquement
          de cette liste quand tu les auras réussies.
        </p>

        <div className="hero__cta">
          <button className="btn btn--primary" type="button" onClick={handleRetryRandom}>
            🎯 Reprendre une au hasard
          </button>
          <button className="btn btn--ghost" type="button" onClick={handleClearAll}>
            🗑 Vider la liste
          </button>
        </div>
      </section>

      <section className="section">
        <div className="liste-grid">
          {missedQuestions.map((q) => (
            <Link
              key={q.id}
              to={`/question/${q.id}`}
              className="liste-row liste-row--ko"
              aria-label={`Question ${q.id} à revoir`}
            >
              <span className="liste-row__num">Q{String(q.id).padStart(2, '0')}</span>
              <span className={`badge ${q.type === 'VI' ? 'badge--vi' : 'badge--ve'} liste-row__type`}>
                {q.type}
              </span>
              <span className="liste-row__preview">{q.verif.question}</span>
              <span className="liste-row__status" title="À revoir">✕</span>
            </Link>
          ))}
        </div>

        <div className="hero__cta" style={{ marginTop: 'var(--space-6)' }}>
          <Link to="/" className="btn btn--ghost">← Retour à l'accueil</Link>
        </div>
      </section>
    </div>
  )
}
