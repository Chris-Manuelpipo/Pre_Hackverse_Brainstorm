import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { utilisateursApi } from '../api/utilisateurs.api';
import useAuthStore from '../store/authStore';
import { Avatar, Badge, Skeleton } from '../components/ui';
import QuestionCard from '../components/question/QuestionCard';

const BADGE_LABELS = {
  premiere_question: { label: 'Première Question', icon: '❓', color: 'bg-blue-50 text-blue-700' },
  premiere_reponse: { label: 'Première Réponse', icon: '💬', color: 'bg-green-50 text-green-700' },
  aide_modale: { label: 'Aide Modale', icon: '🌟', color: 'bg-yellow-50 text-yellow-700' },
  mentor: { label: 'Mentor', icon: '🎓', color: 'bg-purple-50 text-purple-700' },
  sapeur: { label: 'Sapeur', icon: '💎', color: 'bg-pink-50 text-pink-700' },
};

const StatCard = ({ label, value, color }) => (
  <div className="card p-4 text-center">
    <p className={`text-3xl font-bold ${color}`}>{value ?? 0}</p>
    <p className="text-sm text-dark-500 mt-1">{label}</p>
  </div>
);

const ProfilePage = () => {
  const { id } = useParams();
  const { user: me } = useAuthStore();
  const isMe = me?.id === parseInt(id);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => utilisateursApi.getById(id),
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="card p-6">
          <div className="flex items-start gap-6">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="card p-12 text-center">
        <p className="text-dark-500">Profil non trouvé.</p>
        <Link to="/feed" className="text-primary-600 hover:underline mt-2 inline-block">Retour au feed</Link>
      </div>
    );
  }

  const badges = Array.isArray(profile.badges) ? profile.badges : [];
  const recentQuestions = Array.isArray(profile.questions) ? profile.questions : [];

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <div className="card p-6">
        <div className="flex items-start gap-6">
          <Avatar
            src={profile.avatar_url}
            alt={profile.pseudo}
            size="xl"
            level={profile.niveau_confiance ?? profile.niveau}
          />
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-display font-bold text-dark-900">{profile.pseudo}</h1>
              {isMe && (
                <Badge variant="primary">Vous</Badge>
              )}
              <Badge variant="default">
                Niveau {profile.niveau_confiance ?? profile.niveau ?? 1}
              </Badge>
            </div>

            <p className="text-dark-500 text-sm mt-1">
              Membre depuis{' '}
              {profile.date_inscription
                ? formatDistanceToNow(new Date(profile.date_inscription), { addSuffix: true, locale: fr })
                : 'récemment'}
            </p>

            {profile.bio && (
              <p className="text-dark-700 mt-3 max-w-lg">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Questions" value={profile.nb_questions ?? profile.questions?.length ?? 0} color="text-primary-600" />
        <StatCard label="Réponses" value={profile.nb_reponses} color="text-accent-600" />
        <StatCard label="Solutions" value={profile.nb_solutions} color="text-green-600" />
        <StatCard label="XP" value={profile.xp ?? profile.nb_votes_recus ?? 0} color="text-yellow-600" />
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-dark-900 mb-4">Badges ({badges.length})</h2>
          <div className="flex flex-wrap gap-3">
            {badges.map((badge, i) => {
              const b = BADGE_LABELS[badge] ?? { label: badge, icon: '🏅', color: 'bg-dark-50 text-dark-700' };
              return (
                <span key={i} className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-transparent ${b.color}`}>
                  <span>{b.icon}</span>
                  {b.label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Questions récentes */}
      {recentQuestions.length > 0 && (
        <div>
          <h2 className="font-semibold text-dark-900 mb-4">Questions récentes</h2>
          <div className="space-y-4">
            {recentQuestions.slice(0, 5).map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
