import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-auto bg-dark-950 text-dark-300 border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(217,70,239,0.12),transparent_28%)]" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="space-y-5">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-11 h-11 bg-gradient-to-br from-primary-500 via-primary-400 to-accent-500 rounded-2xl flex items-center justify-center shadow-glow transition-transform group-hover:scale-105">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <span className="block font-display font-bold text-xl text-white leading-none">Entraide<span className="text-primary-400">Ac</span></span>
                <span className="text-xs uppercase tracking-[0.24em] text-dark-400">Plateforme académique</span>
              </div>
            </Link>

            <p className="max-w-sm text-sm leading-6 text-dark-400">
              Une interface pensée pour poser, trouver et résoudre plus vite. Des réponses claires, des outils simples, et une navigation qui laisse respirer le contenu.
            </p>

            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-dark-200 border border-white/5">Questions</span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-dark-200 border border-white/5">Réponses</span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-dark-200 border border-white/5">Communauté</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Navigation</h4>
            <nav className="space-y-2 text-sm">
              <Link to="/feed" className="footer-link">Feed</Link>
              <Link to="/questions/new" className="footer-link">Poser une question</Link>
              <Link to="/auth/login" className="footer-link">Mon espace</Link>
            </nav>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Compte</h4>
            <nav className="space-y-2 text-sm">
              <Link to="/auth/login" className="footer-link">Connexion</Link>
              <Link to="/auth/register" className="footer-link">Inscription</Link>
              <Link to="/feed" className="footer-link">Voir le feed</Link>
            </nav>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Rejoindre</h4>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
              <p className="text-sm leading-6 text-dark-300">
                Publiez une question, suivez les réponses et gardez le fil des notifications sans friction.
              </p>
              <Link to="/questions/new" className="inline-flex items-center justify-center rounded-xl bg-white text-dark-950 px-4 py-2.5 text-sm font-semibold hover:bg-dark-100 transition-colors">
                Poser une question
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-dark-400">© 2026 EntraideAc. Tous droits réservés.</p>
          <div className="flex items-center gap-3">
            <a href="#" aria-label="X" className="footer-social-link">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.9 1H22l-6.9 7.9L23 23h-6.8l-5.3-6.9L5 23H2l7.4-8.5L1 1h7l4.8 6.3L18.9 1Zm-1.2 20h1.7L7.1 2.9H5.3L17.7 21Z" />
              </svg>
            </a>
            <a href="#" aria-label="GitHub" className="footer-social-link">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.627 0-12 5.373-12 12 0 5.303 3.438 9.8 8.207 11.386.6.111.793-.26.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.835 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.666-.305-5.468-1.333-5.468-5.93 0-1.311.469-2.382 1.236-3.222-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.004-.404 1.02.005 2.046.138 3.005.404 2.292-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.222 0 4.608-2.806 5.624-5.479 5.921.43.372.824 1.102.824 2.222v3.294c0 .319.192.694.801.576C20.561 21.79 24 17.293 24 12c0-6.627-5.373-12-12-12Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;