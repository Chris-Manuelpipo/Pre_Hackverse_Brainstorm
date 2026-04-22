import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { votesApi } from '../../api/votes.api';

/**
 * Boutons de vote avec optimistic update.
 * Props:
 *  - reponseId  : ID de la réponse (pour les mutations API)
 *  - score      : Score initial
 *  - userVote   : Vote actuel de l'utilisateur (1 / -1 / null)
 *  - disabled   : Désactiver (non connecté)
 *  - onVote     : Callback optionnel après vote
 *  - questionId : Pour invalider le cache des réponses de la question
 */
const VoteButtons = ({ reponseId, score = 0, userVote = null, disabled = false, onVote, questionId }) => {
  const queryClient = useQueryClient();
  const [localScore, setLocalScore] = useState(score);
  const [currentVote, setCurrentVote] = useState(userVote);

  const mutation = useMutation({
    mutationFn: ({ val }) => {
      if (val === 0) return votesApi.unvote(reponseId);
      return votesApi.vote(reponseId, val);
    },
    onSuccess: () => {
      if (questionId) {
        queryClient.invalidateQueries({ queryKey: ['reponses', String(questionId)] });
      }
    },
    onError: () => {
      // Rollback optimiste
      setLocalScore(score);
      setCurrentVote(userVote);
    },
  });

  const handleVote = (value) => {
    if (disabled || mutation.isPending) return;

    // Optimistic update
    const newVote = currentVote === value ? 0 : value;
    const diff = newVote - (currentVote ?? 0);
    setCurrentVote(newVote);
    setLocalScore((prev) => prev + diff);

    if (reponseId) {
      mutation.mutate({ val: newVote });
    }
    onVote?.(newVote);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => handleVote(1)}
        disabled={disabled || mutation.isPending}
        title={disabled ? 'Connectez-vous pour voter' : 'Upvote'}
        className={`p-2 rounded-lg transition-all ${
          currentVote === 1
            ? 'bg-primary-100 text-primary-600'
            : 'text-dark-400 hover:bg-dark-50 hover:text-dark-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      <span className={`text-lg font-semibold tabular-nums ${
        localScore > 0 ? 'text-primary-600' : localScore < 0 ? 'text-red-500' : 'text-dark-600'
      }`}>
        {localScore}
      </span>

      <button
        onClick={() => handleVote(-1)}
        disabled={disabled || mutation.isPending}
        title={disabled ? 'Connectez-vous pour voter' : 'Downvote'}
        className={`p-2 rounded-lg transition-all ${
          currentVote === -1
            ? 'bg-red-100 text-red-600'
            : 'text-dark-400 hover:bg-dark-50 hover:text-dark-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
};

export default VoteButtons;