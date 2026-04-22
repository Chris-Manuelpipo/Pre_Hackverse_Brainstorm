import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Avatar, Badge } from '../ui';
import VoteButtons from './VoteButtons';

/**
 * ReponseCard — adapté aux données réelles du backend.
 * Le backend renvoie : auteur_pseudo, auteur_avatar, auteur_id, auteur_niveau,
 * contenu, est_acceptee, score_votes, user_vote/mon_vote, date_creation.
 */
const ReponseCard = ({ reponse, isAuthor, onAccept, onVote, questionId }) => {
  // Support des deux formats (mock et API)
  const pseudo  = reponse.auteur_pseudo || reponse.auteur?.pseudo || 'Anonyme';
  const avatar  = reponse.auteur_avatar || reponse.auteur?.avatar_url || null;
  const auteurId = reponse.auteur_id || reponse.auteur?.id;
  const niveau  = reponse.auteur_niveau || reponse.auteur?.niveau || 1;
  const score   = reponse.score_votes ?? reponse.score ?? reponse.votes ?? 0;
  const userVote = reponse.user_vote ?? reponse.mon_vote ?? null;
  const createdAt = reponse.date_creation || reponse.created_at;

  return (
    <article className={`card p-5 ${reponse.est_acceptee ? 'border-2 border-green-300 bg-green-50/30' : ''} animate-fade-in`}>
      <div className="flex gap-4">
        {/* Colonne votes */}
        <div className="flex flex-col items-center gap-2">
          <VoteButtons
            reponseId={reponse.id}
            score={score}
            userVote={userVote}
            questionId={questionId}
            onVote={onVote}
          />

          {reponse.est_acceptee ? (
            <div className="mt-2 text-green-600" title="Solution acceptée">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : isAuthor ? (
            <button
              onClick={onAccept}
              className="mt-2 p-2 rounded-lg text-dark-300 hover:text-green-600 hover:bg-green-50 transition-colors"
              title="Marquer comme solution"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          ) : null}
        </div>

        {/* Colonne contenu */}
        <div className="flex-1 min-w-0">
          {reponse.est_acceptee && (
            <Badge variant="success" className="mb-3">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Solution acceptée
            </Badge>
          )}

          {/* Contenu avec rendu Markdown simplifié */}
          <div className="prose prose-sm max-w-none text-dark-700 whitespace-pre-wrap">
            {(reponse.contenu || '').split('\n').map((line, i) => {
              if (line.startsWith('## '))
                return <h3 key={i} className="font-semibold text-dark-900 mt-4 mb-2">{line.slice(3)}</h3>;
              if (line.startsWith('```')) return null;
              if (line.startsWith('`') && line.endsWith('`'))
                return <code key={i} className="bg-dark-100 px-1 rounded text-sm">{line.slice(1, -1)}</code>;
              if (line.trim()) return <p key={i} className="my-1">{line}</p>;
              return <br key={i} />;
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-100">
            <div className="text-xs text-dark-500">
              {createdAt && (
                <span>
                  {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: fr })}
                </span>
              )}
            </div>
            <Link
              to={auteurId ? `/profile/${auteurId}` : '#'}
              className="flex items-center gap-2 hover:bg-dark-50 p-1 -m-1 rounded-lg transition-colors"
            >
              <Avatar src={avatar} alt={pseudo} size="xs" level={niveau} />
              <span className="text-sm text-dark-600">{pseudo}</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ReponseCard;