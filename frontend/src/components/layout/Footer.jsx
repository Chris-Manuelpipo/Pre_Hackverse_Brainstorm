import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark-900 text-dark-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="font-display font-bold text-lg text-white">
                Entraide<span className="text-primary-400">Ac</span>
              </span>
            </Link>
            <p className="text-sm">
              La plateforme d'entraide académique pour les étudiants. Posez vos questions, partagez vos connaissances.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Plateforme</h4>
            <nav className="space-y-2">
              <Link to="/feed" className="block text-sm hover:text-white transition-colors">Feed</Link>
              <Link to="/questions/new" className="block text-sm hover:text-white transition-colors">Poser une question</Link>
              <Link to="/search" className="block text-sm hover:text-white transition-colors">Rechercher</Link>
            </nav>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Communauté</h4>
            <nav className="space-y-2">
              <Link to="/about" className="block text-sm hover:text-white transition-colors">À propos</Link>
              <Link to="/guidelines" className="block text-sm hover:text-white transition-colors">Règles</Link>
              <Link to="/contact" className="block text-sm hover:text-white transition-colors">Contact</Link>
            </nav>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Légal</h4>
            <nav className="space-y-2">
              <Link to="/privacy" className="block text-sm hover:text-white transition-colors">Confidentialité</Link>
              <Link to="/terms" className="block text-sm hover:text-white transition-colors">CGU</Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-dark-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">© 2025 EntraideAc. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-dark-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.49-.794 2.507-1.935 2.767-3.654-.93.534-2.023.848-3.212 1.013-1.024-1.007-2.593-1.14-3.834-.354-1.336.777-2.364 2.422-2.381 4.215-.002.126.008.25.025.375-1.885-.086-3.57-1.22-4.677-2.835-.636 1.053-1.523 1.825-2.541 2.343-1.397.766-3.077.623-4.375-.343-1.389.935-3.468 1.423-5.36 1.225-1.685-.181-3.227-.735-4.401-1.57-.834.933-2.072 1.353-3.36 1.635-1.19-.514-2.665-.654-3.925-.445-2.214.365-3.836 2.25-3.946 4.55-.01.102-.005.204.002.306 1.905 1.429 4.336 2.343 6.658 2.294 2.206-.023 4.307-1.19 5.835-2.77 1.383.893 2.98 1.367 4.562 1.222 1.584-.144 3.072-.692 4.295-1.566 1.16.566 2.52.89 3.927.732 1.502-.169 2.93-.67 4.206-1.467-.54.943-1.22 1.76-2.017 2.415z"/>
              </svg>
            </a>
            <a href="#" className="text-dark-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;