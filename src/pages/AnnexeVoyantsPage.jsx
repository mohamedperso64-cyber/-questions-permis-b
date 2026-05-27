import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'

// Questions de l'examen liées à un voyant, groupées par voyant
const EXAM_LINKS = [
  {
    name: 'Feux de route',
    color: '#007AFF',
    questions: [20, 51, 78, 95],
  },
  {
    name: 'Anti-brouillard arrière',
    color: '#FF9500',
    questions: [43, 91],
  },
  {
    name: 'Feux de détresse',
    color: '#FF6B35',
    questions: [18, 31, 76, 85],
  },
  {
    name: 'Défaillance freinage',
    color: '#FF3B30',
    questions: [25, 55, 81],
  },
  {
    name: 'Pression pneu (TPMS)',
    color: '#FF9500',
    questions: [63, 99],
  },
  {
    name: 'Pression huile',
    color: '#FF3B30',
    questions: [15, 75],
  },
  {
    name: 'Température refroidissement',
    color: '#FF3B30',
    questions: [27, 83],
  },
  {
    name: 'Batterie',
    color: '#FF3B30',
    questions: [23],
  },
  {
    name: 'Ceinture',
    color: '#FF3B30',
    questions: [39, 89],
  },
  {
    name: 'Portière ouverte',
    color: '#FF9500',
    questions: [29],
  },
  {
    name: 'Carburant',
    color: '#FF9500',
    questions: [11],
  },
  {
    name: 'Dégivrage lunette arrière',
    color: '#34C759',
    questions: [13, 73],
  },
]

export default function AnnexeVoyantsPage() {
  return (
    <div className="app-shell">
      <SiteHeader />

      <section className="hero" style={{ paddingBottom: 'var(--space-4)' }}>
        <div className="hero__eyebrow">— Fiche de révision —</div>
        <h2 className="hero__title">
          Les voyants du <em>tableau de bord</em>
        </h2>
        <p className="hero__lead">
          Mémorise les symboles, leur couleur et leur signification.
          Les badges <strong>Q</strong> renvoient directement vers la question de l'examen associée.
        </p>
      </section>

      {/* ── Infographie DEKRA ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="annexe-infographie">
          <img
            src="/images/temoins-tableau-bord.png"
            alt="Les voyants du tableau de bord — infographie DEKRA"
            className="annexe-infographie__img"
          />
        </div>
      </section>

      {/* ── Questions de l'examen liées ── */}
      <section className="section">
        <div className="annexe-category__header" style={{ '--cat-accent': '#1B6BA0' }}>
          <h3 className="annexe-category__title">Questions de l'examen liées</h3>
          <p className="annexe-category__subtitle">
            Ces voyants apparaissent dans les 100 questions officielles — clique pour réviser directement.
          </p>
        </div>

        <div className="annexe-qlinks-grid">
          {EXAM_LINKS.map((v) => (
            <div key={v.name} className="annexe-qlinks-row">
              <span
                className="annexe-qlinks-dot"
                style={{ background: v.color }}
                aria-hidden="true"
              />
              <span className="annexe-qlinks-name">{v.name}</span>
              <span className="annexe-voyant__qlinks">
                {v.questions.map((qid) => (
                  <Link
                    key={qid}
                    to={`/question/${qid}`}
                    className="annexe-voyant__qbadge"
                    title={`Aller à la question ${qid}`}
                  >
                    Q{String(qid).padStart(2, '0')}
                  </Link>
                ))}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="hero__cta" style={{ marginBottom: 'var(--space-8)' }}>
        <Link to="/mode/theme/voyants" className="btn btn--primary">
          ✦ Réviser les questions voyants →
        </Link>
        <Link to="/" className="btn btn--ghost">← Retour à l'accueil</Link>
      </div>
    </div>
  )
}
