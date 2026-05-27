import { Link } from 'react-router-dom'

export default function SiteHeader() {
  return (
    <header className="app-header">
      <Link to="/" className="app-header__logo" aria-label="Retour à l'accueil">
        <div className="app-header__logo-mark" aria-hidden="true" />
        <div>
          <h1 className="app-header__title">Permis Révision</h1>
          <div className="app-header__subtitle">Banque officielle · 2023</div>
        </div>
      </Link>
      <nav className="app-header__actions" aria-label="Navigation principale">
        <Link to="/styleguide" className="btn btn--ghost" title="Référence de design interne">
          Style guide
        </Link>
        <button className="btn btn--ghost" type="button" disabled title="Bascule de thème — à venir">
          ☀ Thème
        </button>
      </nav>
    </header>
  )
}
