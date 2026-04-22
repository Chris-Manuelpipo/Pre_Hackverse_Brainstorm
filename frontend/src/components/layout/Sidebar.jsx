import { useSearchParams, NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '../../store/authStore';
import { referentielApi } from '../../api/referentiel.api';
import { Avatar } from '../ui';

const Sidebar = () => {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();

  // Matières depuis l'API
  const { data: matieres = [], isLoading: mLoading } = useQuery({
    queryKey: ['matieres'],
    queryFn: referentielApi.getMatieres,
    staleTime: Infinity,
  });

  // Tags depuis l'API
  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: referentielApi.getTags,
    staleTime: Infinity,
  });

  const topTags = tags.slice(0, 8);

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block">
      <div className="sticky top-20 space-y-6">
        {/* User Stats Card */}
        {user && (
          <div className="card p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar src={user.avatar_url} alt={user.pseudo} size="md" level={user.niveau_confiance ?? user.niveau} />
              <div>
                <p className="font-medium text-dark-900">{user.pseudo}</p>
                <p className="text-xs text-dark-500">Niveau {user.niveau_confiance ?? user.niveau ?? 1}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-dark-50 rounded-lg p-2">
                <p className="text-lg font-bold text-primary-600">{user.nb_questions ?? user.questions ?? 0}</p>
                <p className="text-xs text-dark-500">Questions</p>
              </div>
              <div className="bg-dark-50 rounded-lg p-2">
                <p className="text-lg font-bold text-accent-600">{user.nb_reponses ?? user.reponses ?? 0}</p>
                <p className="text-xs text-dark-500">Réponses</p>
              </div>
              <div className="bg-dark-50 rounded-lg p-2">
                <p className="text-lg font-bold text-success-600">{user.nb_solutions_acceptees ?? user.nb_solutions ?? user.solutions ?? 0}</p>
                <p className="text-xs text-dark-500">Solutions</p>
              </div>
            </div>
          </div>
        )}

        {/* Matières */}
        <div className="card p-4">
          <h3 className="font-semibold text-dark-900 mb-3">Matières</h3>
          {mLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 bg-dark-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <nav className="space-y-1">
              <NavLink
                to="/feed"
                end
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive && !searchParams.get('matiere')
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-dark-600 hover:bg-dark-50 hover:text-dark-900'
                  }`
                }
              >
                <span>Toutes</span>
              </NavLink>
              {matieres.map((m) => (
                <NavLink
                  key={m.id}
                  to={`/feed?matiere=${encodeURIComponent(m.nom)}`}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-dark-600 hover:bg-dark-50 hover:text-dark-900'
                    }`
                  }
                >
                  <span className="flex items-center gap-2">
                    {m.icone && <span>{m.icone}</span>}
                    {m.nom}
                  </span>
                  {m.nb_questions > 0 && (
                    <span className="text-xs bg-dark-100 px-2 py-0.5 rounded-full">{m.nb_questions}</span>
                  )}
                </NavLink>
              ))}
            </nav>
          )}
        </div>

        {/* Tags populaires */}
        {topTags.length > 0 && (
          <div className="card p-4">
            <h3 className="font-semibold text-dark-900 mb-3">Tags populaires</h3>
            <div className="flex flex-wrap gap-2">
              {topTags.filter(Boolean).map((tag) => (
                <span
                  key={tag.id ?? tag.nom}
                  className="inline-flex items-center px-2.5 py-1 bg-dark-100 text-dark-600 hover:bg-dark-200 text-xs rounded-full cursor-pointer transition-colors"
                >
                  {tag.nom}
                  {tag.nb_utilisations > 0 && (
                    <span className="ml-1 text-dark-400">×{tag.nb_utilisations}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Liens rapides */}
        <div className="card p-4">
          <nav className="space-y-1">
            <NavLink
              to="/feed"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-primary-50 text-primary-700' : 'text-dark-600 hover:bg-dark-50'}`
              }
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Feed
            </NavLink>
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;