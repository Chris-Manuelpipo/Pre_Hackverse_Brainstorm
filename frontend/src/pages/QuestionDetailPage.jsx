import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { questionsApi } from '../api/questions.api';
import { reponsesApi } from '../api/reponses.api';
import { votesApi } from '../api/votes.api';
import useAuthStore from '../store/authStore';
import { useGlobalToast } from '../components/ui/Toast';
import { Button, Avatar, Badge, Textarea, Skeleton } from '../components/ui';
import VoteButtons from '../components/reponse/VoteButtons';
import ReponseCard from '../components/reponse/ReponseCard';

const QuestionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const { addToast } = useGlobalToast();
  const [newReponse, setNewReponse] = useState('');

  // ── Question ─────────────────────────────────────────────────────────────
  const { data: question, isLoading: qLoading, error: qError } = useQuery({
    queryKey: ['question', id],
    queryFn: () => questionsApi.getById(id),
    staleTime: 60000,
  });

  // ── Réponses ─────────────────────────────────────────────────────────────
  const { data: reponses = [], isLoading: rLoading } = useQuery({
    queryKey: ['reponses', id],
    queryFn: () => reponsesApi.getByQuestion(id),
    enabled: !!id,
    staleTime: 30000,
  });

  // ── Poster une réponse ────────────────────────────────────────────────────
  const submitMutation = useMutation({
    mutationFn: (contenu) => reponsesApi.create(id, contenu),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reponses', id] });
      queryClient.invalidateQueries({ queryKey: ['question', id] });
      setNewReponse('');
      addToast('Réponse publiée avec succès !', 'success');
    },
    onError: (err) => {
      addToast(err?.response?.data?.error || 'Erreur lors de la publication.', 'error');
    },
  });

  // ── Accepter une réponse ──────────────────────────────────────────────────
  const acceptMutation = useMutation({
    mutationFn: (reponseId) => reponsesApi.accept(reponseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reponses', id] });
      queryClient.invalidateQueries({ queryKey: ['question', id] });
      addToast('Réponse acceptée comme solution ! ✅', 'success');
    },
    onError: () => addToast('Erreur lors de l\'acceptation.', 'error'),
  });

  // ── Vote sur une réponse ──────────────────────────────────────────────────
  const voteMutation = useMutation({
    mutationFn: ({ reponseId, valeur }) => votesApi.vote(reponseId, valeur),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reponses', id] });
    },
    onError: () => addToast('Erreur lors du vote.', 'error'),
  });

  const handleSubmitReponse = (e) => {
    e.preventDefault();
    if (!newReponse.trim() || newReponse.trim().length < 10) {
      addToast('La réponse doit contenir au moins 10 caractères.', 'error');
      return;
    }
    if (!isAuthenticated) {
      addToast('Connectez-vous pour répondre.', 'info');
      navigate('/auth/login');
      return;
    }
    submitMutation.mutate(newReponse);
  };

  // ── Chargement ────────────────────────────────────────────────────────────
  if (qLoading) {
    return (
      <div className="space-y-6">
        <div className="card p-6">
          <Skeleton className="h-8 w-2/3 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    );
  }

  if (qError || !question) {
    return (
      <div className="card p-12 text-center">
        <p className="text-dark-500">Question non trouvée.</p>
        <Link to="/feed" className="text-primary-600 hover:underline mt-2 inline-block">Retour au feed</Link>
      </div>
    );
  }

  const isAuthor = user?.id === question.auteur_id;

  const sortedReponses = [...reponses].sort((a, b) => {
    if (a.est_acceptee) return -1;
    if (b.est_acceptee) return 1;
    return (b.score ?? b.votes ?? 0) - (a.score ?? a.votes ?? 0);
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-dark-500">
        <Link to="/feed" className="hover:text-primary-600">Feed</Link>
        <span>/</span>
        {question.matiere_nom && (
          <>
            <span className="hover:text-primary-600">{question.matiere_nom}</span>
            <span>/</span>
          </>
        )}
        <span className="text-dark-900 truncate max-w-[200px]">{question.titre}</span>
      </nav>

      {/* Question */}
      <article className="card p-6">
        <div className="flex gap-4">
          <div className="hidden sm:block">
            <VoteButtons
              score={question.score ?? 0}
              userVote={question.user_vote ?? null}
              disabled={!isAuthenticated}
              onVote={() => {}}
            />
          </div>

          <div className="flex-1">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {question.matiere_nom && (
                <Badge variant="default">
                  {question.matiere_icone && <span>{question.matiere_icone}</span>}{' '}
                  {question.matiere_nom}
                </Badge>
              )}
              <Badge variant={question.statut === 'résolu' ? 'success' : question.statut === 'fermé' ? 'error' : 'primary'}>
                {question.statut}
              </Badge>
              {Array.isArray(question.tags) && question.tags.filter(Boolean).map((tag, i) => (
                <Badge key={i} variant="default" className="text-xs">{tag}</Badge>
              ))}
            </div>

            {/* Titre */}
            <h1 className="text-2xl font-display font-bold text-dark-900 mb-4">{question.titre}</h1>

            {/* Description */}
            <div className="prose prose-sm max-w-none text-dark-700 whitespace-pre-wrap">
              {question.description}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-dark-100">
              <div className="flex items-center gap-4 text-sm text-dark-500">
                <span>{question.nb_vues ?? 0} vues</span>
                <span>
                  {formatDistanceToNow(new Date(question.date_creation), { addSuffix: true, locale: fr })}
                </span>
              </div>
              <Link
                to={`/profile/${question.auteur_id}`}
                className="flex items-center gap-2 hover:bg-dark-50 p-1.5 rounded-lg transition-colors"
              >
                <Avatar src={question.auteur_avatar} alt={question.auteur_pseudo} size="sm" level={question.auteur_niveau} />
                <div className="text-left">
                  <p className="text-sm font-medium text-dark-900">{question.auteur_pseudo}</p>
                  <p className="text-xs text-dark-500">Niveau {question.auteur_niveau ?? 1}</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* Réponses */}
      <div>
        <h2 className="text-lg font-semibold text-dark-900 mb-4">
          {rLoading ? '…' : `${reponses.length} ${reponses.length === 1 ? 'réponse' : 'réponses'}`}
        </h2>

        {rLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="card p-5">
                <Skeleton className="h-4 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : sortedReponses.length === 0 ? (
          <div className="card p-8 text-center">
            <svg className="w-12 h-12 text-dark-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-dark-500">Aucune réponse pour le moment. Soyez le premier à répondre !</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedReponses.map((reponse, index) => (
              <div key={reponse.id} style={{ animationDelay: `${index * 80}ms` }}>
                <ReponseCard
                  reponse={reponse}
                  isAuthor={isAuthor}
                  onAccept={() => acceptMutation.mutate(reponse.id)}
                  onVote={(valeur) => {
                    if (!isAuthenticated) {
                      addToast('Connectez-vous pour voter.', 'info');
                      return;
                    }
                    voteMutation.mutate({ reponseId: reponse.id, valeur });
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulaire de réponse */}
      <div className="card p-6">
        <h3 className="font-semibold text-dark-900 mb-4">Votre réponse</h3>
        {isAuthenticated ? (
          <form onSubmit={handleSubmitReponse}>
            <Textarea
              placeholder="Rédigez votre réponse ici… (minimum 10 caractères)"
              value={newReponse}
              onChange={(e) => setNewReponse(e.target.value)}
              rows={8}
              className="mb-4 font-mono text-sm"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-dark-400">Markdown supporté</p>
              <Button
                type="submit"
                loading={submitMutation.isPending}
                disabled={!newReponse.trim() || newReponse.trim().length < 10}
              >
                Publier la réponse
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-6">
            <p className="text-dark-500 mb-4">Connectez-vous pour poster une réponse.</p>
            <Link to="/auth/login">
              <Button>Se connecter</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDetailPage;