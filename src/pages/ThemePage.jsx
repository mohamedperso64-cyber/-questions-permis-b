import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import questionsData from '../data/questions_enrichies.json'
import { THEMES, QUESTION_THEMES, themeOf, questionsInTheme } from '../lib/themes'
import { getAnsweredIds, getMissedIds } from '../lib/storage'

function statusOf(qid, answered, missed) {
  if (missed.has(qid)) return 'ko'
  if (answered.has(qid)) return 'ok'
  return 'todo'
}

function statusIcon(s) {
  if (s === 'ok') return '✓'
  if (s === 'ko') return '✕'
  return '✦'
}

export default function ThemePage() {
  const { themeKey } = useParams()

  if (themeKey && THEMES[themeKey]) {
    return <ThemeDetail themeKey={themeKey} />
  }

  return <ThemeOverview />
}

// ===================================================================
// Vue d'ensemble : grille de cartes de thèmes avec progression
// ===================================================================

function ThemeOverview() {
  const { answered, missed } = useMemo(() => ({
    answered: new Set(getAnsweredIds()),
    missed:   new Set(getMissedIds()),
  }), [])

  // Stats par thème
  const themeStats = useMemo(() => {
    const stats = {}
    Object.keys(THEMES).forEach((k) => {
      stats[k] = { total: 0, done: 0, ok: 0, ko: 0 }
    })
    Object.entries(QUESTION_THEMES).forEach(([id, t]) => {
      const qid = parseInt(id, 10)
      const st = stats[t]
      if (!st) return
      st.total++
      if (answered.has(qid)) st.done++
      if (missed.has(qid)) st.ko++
      else if (answered.has(qid)) st.ok++
    })
    return stats
  }, [answered, missed])

  return (
    <div className="app-shell">
      <SiteHeader />

      <section className="hero" style={{ paddingBottom: 'var(--space-4)' }}>
        <div className="hero__eyebrow">— Mode par thème —</div>
        <h2 className="hero__title">
          Réviser <em>par thème</em>
        </h2>
        <p className="hero__lead">
          Concentre-toi sur un sujet précis. Chaque thème regroupe les
          questions qui touchent au même domaine (feux, voyants, pneus…).
        </p>
      </section>

      <section className="section">
        <div className="theme-grid">
          {Object.entries(THEMES).map(([key, def]) => {
            const stats = themeStats[key] || { total: 0, done: 0, ok: 0, ko: 0 }
            const percentDone = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0
            return (
              <Link key={key} to={`/mode/theme/${key}`} className="theme-card">
                <div className="theme-card__icon" aria-hidden="true">{def.icon}</div>
                <div className="theme-card__body">
                  <div className="theme-card__title">{def.label}</div>
                  <div className="theme-card__desc">{def.description}</div>
                  <div className="theme-card__stats">
                    <span className="theme-card__count">{stats.total} questions</span>
                    {stats.done > 0 && (
                      <>
                        <span className="theme-card__sep">·</span>
                        <span className="theme-card__progress">
                          <span style={{ color: 'var(--success)' }}>{stats.ok} ✓</span>
                          {stats.ko > 0 && <> · <span style={{ color: 'var(--danger)' }}>{stats.ko} ✕</span></>}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="theme-card__progress-bar" aria-label={`${percentDone}% complété`}>
                    <div className="theme-card__progress-fill" style={{ width: `${percentDone}%` }} />
                  </div>
                </div>
                <div className="theme-card__arrow" aria-hidden="true">→</div>
              </Link>
            )
          })}
        </div>

        <div className="hero__cta" style={{ marginTop: 'var(--space-6)' }}>
          <Link to="/" className="btn btn--ghost">← Retour à l'accueil</Link>
        </div>
      </section>
    </div>
  )
}

// ===================================================================
// Vue détaillée : questions d'un thème spécifique
// ===================================================================

function ThemeDetail({ themeKey }) {
  const themeDef = THEMES[themeKey]
  const questionIds = useMemo(() => questionsInTheme(themeKey), [themeKey])
  const questions = useMemo(
    () => questionIds.map((id) => questionsData.find((q) => q.id === id)).filter(Boolean),
    [questionIds]
  )

  const { answered, missed } = useMemo(() => ({
    answered: new Set(getAnsweredIds()),
    missed:   new Set(getMissedIds()),
  }), [])

  return (
    <div className="app-shell">
      <SiteHeader />

      <section className="hero" style={{ paddingBottom: 'var(--space-4)' }}>
        <div className="hero__eyebrow">
          <Link to="/mode/theme" style={{ color: 'inherit' }}>← Tous les thèmes</Link>
        </div>
        <h2 className="hero__title">
          <span style={{ marginRight: 12 }}>{themeDef.icon}</span>
          <em>{themeDef.label}</em>
        </h2>
        <p className="hero__lead">{themeDef.description}</p>
      </section>

      <section className="section">
        <div className="liste-count">
          {questions.length} question{questions.length > 1 ? 's' : ''} dans ce thème
        </div>

        <div className="liste-grid">
          {questions.map((q) => {
            const status = statusOf(q.id, answered, missed)
            return (
              <Link
                key={q.id}
                to={`/question/${q.id}`}
                className={`liste-row liste-row--${status}`}
              >
                <span className="liste-row__num">Q{String(q.id).padStart(2, '0')}</span>
                <span className={`badge ${q.type === 'VI' ? 'badge--vi' : 'badge--ve'} liste-row__type`}>
                  {q.type}
                </span>
                <span className="liste-row__preview">{q.verif.question}</span>
                <span className="liste-row__status">{statusIcon(status)}</span>
              </Link>
            )
          })}
        </div>

        <div className="hero__cta" style={{ marginTop: 'var(--space-6)' }}>
          <Link to="/mode/theme" className="btn btn--ghost">← Autres thèmes</Link>
          <Link to="/" className="btn btn--ghost">Accueil</Link>
        </div>
      </section>
    </div>
  )
}
