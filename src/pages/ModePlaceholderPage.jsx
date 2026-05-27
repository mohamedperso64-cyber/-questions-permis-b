import { useParams, Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'

const MODE_INFO = {
  aleatoire: {
    icon: '🎲',
    title: 'Tirage aléatoire',
    description: 'Le compteur tirera une question parmi les 100 disponibles, en évitant les questions tirées récemment.',
    next: 'À venir : animation slot machine sur le compteur, puis ouverture de la question.',
  },
  theme: {
    icon: '📚',
    title: 'Par thème',
    description: 'Choisir une catégorie thématique : feux, pneus, voyants, premiers secours, etc.',
    next: 'À venir : liste des thèmes avec compteur de questions par thème.',
  },
  erreurs: {
    icon: '↻',
    title: 'Mes erreurs',
    description: 'Reprendre uniquement les questions que tu as ratées lors des sessions précédentes.',
    next: 'À venir : liste des questions ratées (stockées en localStorage).',
  },
  liste: {
    icon: '☰',
    title: 'Liste complète',
    description: 'Parcourir les 100 questions dans l\'ordre, à ton rythme.',
    next: 'À venir : table des 100 questions avec leur statut (faite, ratée, vierge).',
  },
}

export default function ModePlaceholderPage() {
  const { mode } = useParams()
  const info = MODE_INFO[mode]

  if (!info) {
    return (
      <div className="app-shell">
        <SiteHeader />
        <section className="hero">
          <h2 className="hero__title">Mode inconnu</h2>
          <p className="hero__lead">Ce mode n'existe pas.</p>
          <div className="hero__cta">
            <Link to="/" className="btn btn--primary">← Retour à l'accueil</Link>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <SiteHeader />

      <section className="hero">
        <div className="hero__eyebrow">— Mode de révision —</div>
        <h2 className="hero__title">
          <span style={{ marginRight: 12 }}>{info.icon}</span>
          {info.title}
        </h2>
        <p className="hero__lead">{info.description}</p>
      </section>

      <section className="section">
        <div className="q-card" style={{ textAlign: 'center' }}>
          <div className="q-card__meta" style={{ justifyContent: 'center' }}>
            <span>Page en construction</span>
          </div>
          <p style={{ fontSize: 18, color: 'var(--text-primary)' }}>
            {info.next}
          </p>
          <div className="hero__cta" style={{ marginTop: 'var(--space-5)' }}>
            <Link to="/" className="btn btn--ghost">← Retour à l'accueil</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
