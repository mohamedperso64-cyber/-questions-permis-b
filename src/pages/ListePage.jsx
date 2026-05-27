import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import questionsData from '../data/questions_enrichies.json'
import { getAnsweredIds, getMissedIds } from '../lib/storage'

const TYPE_FILTERS = [
  { value: 'all', label: 'Toutes' },
  { value: 'VI', label: 'VI · Intérieur' },
  { value: 'VE', label: 'VE · Extérieur' },
]

const STATUS_FILTERS = [
  { value: 'all',  label: 'Tous statuts' },
  { value: 'ok',   label: '✓ Réussies' },
  { value: 'ko',   label: '✕ Ratées' },
  { value: 'todo', label: '✦ Non faites' },
]

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

function statusLabel(s) {
  if (s === 'ok') return 'Réussie'
  if (s === 'ko') return 'Ratée'
  return 'Non faite'
}

export default function ListePage() {
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Lus une fois au montage (localStorage est synchrone donc OK)
  const { answered, missed } = useMemo(() => ({
    answered: new Set(getAnsweredIds()),
    missed:   new Set(getMissedIds()),
  }), [])

  const stats = useMemo(() => {
    const total = questionsData.length
    const done  = answered.size
    const ko    = missed.size
    const ok    = done - ko
    const todo  = total - done
    return { total, done, ok, ko, todo }
  }, [answered, missed])

  const filtered = useMemo(() => {
    return questionsData.filter((q) => {
      if (typeFilter !== 'all' && q.type !== typeFilter) return false
      if (statusFilter !== 'all' && statusOf(q.id, answered, missed) !== statusFilter) return false
      return true
    })
  }, [typeFilter, statusFilter, answered, missed])

  return (
    <div className="app-shell">
      <SiteHeader />

      <section className="hero" style={{ paddingBottom: 'var(--space-4)' }}>
        <div className="hero__eyebrow">— Mode liste —</div>
        <h2 className="hero__title">
          Les <em>100 questions</em>
        </h2>
        <p className="hero__lead">
          Parcours toutes les questions dans l'ordre, suis ta progression
          et reviens sur celles que tu veux revoir.
        </p>
      </section>

      <section className="section">
        {/* Statistiques globales */}
        <div className="liste-stats">
          <div className="liste-stat">
            <div className="liste-stat__value">{stats.done}<span className="liste-stat__sep">/</span>{stats.total}</div>
            <div className="liste-stat__label">faites</div>
          </div>
          <div className="liste-stat liste-stat--ok">
            <div className="liste-stat__value">{stats.ok}</div>
            <div className="liste-stat__label">réussies</div>
          </div>
          <div className="liste-stat liste-stat--ko">
            <div className="liste-stat__value">{stats.ko}</div>
            <div className="liste-stat__label">ratées</div>
          </div>
          <div className="liste-stat liste-stat--todo">
            <div className="liste-stat__value">{stats.todo}</div>
            <div className="liste-stat__label">non faites</div>
          </div>
        </div>

        {/* Filtres */}
        <div className="liste-filters">
          <div className="liste-filter-group" role="radiogroup" aria-label="Filtrer par type">
            <span className="liste-filter-label">Type</span>
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                className={`liste-filter-btn ${typeFilter === f.value ? 'is-active' : ''}`}
                type="button"
                onClick={() => setTypeFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="liste-filter-group" role="radiogroup" aria-label="Filtrer par statut">
            <span className="liste-filter-label">Statut</span>
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                className={`liste-filter-btn ${statusFilter === f.value ? 'is-active' : ''}`}
                type="button"
                onClick={() => setStatusFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Compteur de résultats */}
        <div className="liste-count">
          {filtered.length === questionsData.length
            ? `${filtered.length} questions`
            : `${filtered.length} question${filtered.length > 1 ? 's' : ''} sur ${questionsData.length}`}
        </div>

        {/* Liste des questions */}
        <div className="liste-grid">
          {filtered.map((q) => {
            const status = statusOf(q.id, answered, missed)
            return (
              <Link
                key={q.id}
                to={`/question/${q.id}`}
                className={`liste-row liste-row--${status}`}
                aria-label={`Question ${q.id}, ${statusLabel(status)}`}
              >
                <span className="liste-row__num">Q{String(q.id).padStart(2, '0')}</span>
                <span className={`badge ${q.type === 'VI' ? 'badge--vi' : 'badge--ve'} liste-row__type`}>
                  {q.type}
                </span>
                <span className="liste-row__preview">{q.verif.question}</span>
                <span className="liste-row__status" title={statusLabel(status)}>
                  {statusIcon(status)}
                </span>
              </Link>
            )
          })}

          {filtered.length === 0 && (
            <div className="liste-empty">
              Aucune question ne correspond à ces filtres.
            </div>
          )}
        </div>

        <div className="hero__cta" style={{ marginTop: 'var(--space-6)' }}>
          <Link to="/" className="btn btn--ghost">← Retour à l'accueil</Link>
        </div>
      </section>
    </div>
  )
}
