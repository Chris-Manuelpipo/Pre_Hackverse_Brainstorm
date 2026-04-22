import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '../../store/authStore';
import useNotificationsStore from '../../store/notificationsStore';
import useThemeStore from '../../store/themeStore';
import { Avatar, Button } from '../ui';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { unreadCount, notifications, fetchUnreadCount, fetchNotifications, markAllRead } = useNotificationsStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Rafraîchir le compteur toutes les 60s si connecté
  useQuery({
    queryKey: ['unread-count'],
    queryFn: fetchUnreadCount,
    enabled: isAuthenticated,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  // Fermer les menus au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleNotifications = () => {
    if (!showNotifications) {
      fetchNotifications();
    }
    setShowNotifications((v) => !v);
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const notifTypeLabel = {
    nouvelle_reponse: '💬',
    commentaire: '💬',
    solution_acceptee: '✅',
    upvote: '👍',
    badge: '🏆',
  };

  return (
    <header className="sticky top-0 z-50 bg-[var(--header-bg)] backdrop-blur-xl border-b border-[var(--header-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-glow">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-display font-bold text-xl text-dark-900 hidden sm:block">
              Entraide<span className="text-primary-600"> Ac</span>
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={toggleTheme}
              className="relative p-2 rounded-xl hover:bg-dark-100 transition-colors"
              aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
              title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5 text-dark-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m7-9h2M3 12H1m15.364 6.364l1.414 1.414M6.222 6.222L4.808 4.808m12.728 0-1.414 1.414M6.222 17.778l-1.414 1.414M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-dark-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9 9 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {isAuthenticated ? (
              <>
                {/* Nouvelle question */}
                <Link to="/questions/new">
                  <Button variant="primary" size="sm" className="hidden sm:flex gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Poser
                  </Button>
                </Link>
                <Link to="/questions/new" className="sm:hidden">
                  <Button variant="primary" size="sm" className="!px-2.5" aria-label="Poser une question">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </Button>
                </Link>

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={handleToggleNotifications}
                    className="relative p-2 rounded-xl hover:bg-dark-100 transition-colors"
                    aria-label="Notifications"
                  >
                    <svg className="w-5 h-5 text-dark-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-accent-500 text-white text-xs rounded-full flex items-center justify-center px-1 font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown notifications */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-1rem))] bg-[var(--surface-elevated)] rounded-2xl border border-dark-200 shadow-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-100">
                        <h3 className="font-semibold text-dark-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs text-primary-600 hover:underline"
                          >
                            Tout marquer comme lu
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-dark-50">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-sm text-dark-400 text-center">Aucune notification</p>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`flex items-start gap-3 px-4 py-3 text-sm ${n.est_lue ? 'opacity-60' : 'bg-primary-50/30'}`}
                            >
                              <span className="text-lg flex-shrink-0">{notifTypeLabel[n.type] ?? '🔔'}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-dark-700 leading-snug">{n.message || n.contenu}</p>
                                <p className="text-xs text-dark-400 mt-0.5">
                                  {formatDistanceToNow(new Date(n.date_creation), { addSuffix: true, locale: fr })}
                                </p>
                              </div>
                              {!n.est_lue && (
                                <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5" />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Menu utilisateur */}
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => { setShowUserMenu((v) => !v); setShowNotifications(false); }}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-dark-100 transition-colors"
                  >
                    <Avatar src={user?.avatar_url} alt={user?.pseudo} size="sm" level={user?.niveau_confiance ?? user?.niveau} />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-[min(13rem,calc(100vw-1rem))] bg-[var(--surface-elevated)] rounded-2xl border border-dark-200 shadow-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-dark-100">
                        <p className="font-medium text-dark-900">{user?.pseudo}</p>
                        <p className="text-xs text-dark-400">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to={`/profile/${user?.id}`}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-dark-600 hover:bg-dark-50 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Mon profil
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Se déconnecter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm">Connexion</Button>
                </Link>
                <Link to="/auth/register">
                  <Button variant="primary" size="sm">Inscription</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;