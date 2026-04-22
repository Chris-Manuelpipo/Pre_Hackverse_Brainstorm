import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Avatar, Badge } from '../ui';

/**
 * QuestionCard — compatible données API réelles ET mock.
 * Backend renvoie : auteur_pseudo, auteur_avatar, auteur_id, auteur_niveau,
 * matiere_nom, matiere_icone, nb_reponses, score, tags[], date_creation, nb_vues, statut.
 */
const QuestionCard = ({ question }) => {
  // Normalisation des champs API vs mock
  const pseudo    = question.auteur_pseudo   || question.auteur?.pseudo    || 'Anonyme';
  const avatar    = question.auteur_avatar   || question.auteur?.avatar_url || null;
  const auteurId  = question.auteur_id       || question.auteur?.id;
  const niveau    = question.auteur_niveau   || question.auteur?.niveau    || 1;
  const matNom    = question.matiere_nom     || null;
  const matIcon   = question.matiere_icone   || null;
  const nbRep     = question.nb_reponses     ?? question.reponses_count    ?? 0;
  const score     = question.score           ?? question.votes             ?? 0;
  const vues      = question.nb_vues         ?? question.vues              ?? 0;
  const createdAt = question.date_creation   || question.created_at;

  // Tags : API renvoie string[], mock renvoie [{id, name}]
  const tags = Array.isArray(question.tags)
    ? question.tags.filter(Boolean).map((t) => (typeof t === 'string' ? t : t.name || t.nom))
    : [];

  const hasAccepted = question.has_accepted_answer || question.accepted || false;

  const preview = (question.description || '')
    .replace(/[#`*$\\]/g, '')
    .slice(0, 150);

  return (
    <article className="card p-5 hover:shadow-soft hover:border-primary-200 transition-all duration-200 animate-fade-in">
      <div className="flex gap-4">
        {/* Colonne stats */}
        <div className="hidden sm:flex flex-col items-center gap-2 min-w-[60px]">
          <div className="text-center">
            <p className="text-lg font-semibold text-dark-900">{score}</p>
            <p className="text-xs text-dark-500">votes</p>
          </div>
          <div className={`text-center px-2 py-1 rounded-lg ${hasAccepted ? 'bg-green-100' : 'bg-dark-50'}`}>
            <p className={`text-lg font-semibold ${hasAccepted ? 'text-green-600' : 'text-dark-700'}`}>
              {nbRep}
            </p>
            <p className="text-xs text-dark-500">réponses</p>
          </div>
        </div>

        {/* Colonne contenu */}
        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {matNom && (
              <Badge variant="default" className="text-xs">
                {matIcon && <span>{matIcon}</span>} {matNom}
              </Badge>
            )}
            <Badge variant={
              question.statut === 'résolu' ? 'success' :
              question.statut === 'fermé'  ? 'error'   : 'primary'
            }>
              {question.statut || 'ouvert'}
            </Badge>
          </div>

          {/* Titre */}
          <Link to={`/questions/${question.id}`} className="block group">
            <h3 className="text-lg font-semibold text-dark-900 group-hover:text-primary-600 transition-colors line-clamp-2">
              {question.titre}
            </h3>
          </Link>

          {/* Aperçu */}
          {preview && (
            <p className="text-sm text-dark-500 mt-1 line-clamp-2">
              {preview}{preview.length >= 150 ? '…' : ''}
            </p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-2 py-0.5 bg-dark-100 text-dark-600 hover:bg-dark-200 text-xs rounded-full cursor-default"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-100">
            <div className="flex items-center gap-2 text-xs text-dark-500">
              <span className="sm:hidden">{score} votes · </span>
              <span>{vues} vues</span>
              {createdAt && (
                <>
                  <span>·</span>
                  <span>
                    {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: fr })}
                  </span>
                </>
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

export default QuestionCard;