import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { questionsApi } from '../../api/questions.api';
import { referentielApi } from '../../api/referentiel.api';
import { useGlobalToast } from '../ui/Toast';
import { useDebounce } from '../../hooks/useDebounce';
import { Button, Input, Textarea, Select } from '../ui';

const typeOptions = [
  { value: 'question', label: 'Question' },
  { value: 'exercice', label: 'Exercice' },
  { value: 'aide', label: "Demande d'aide" },
];

const niveauOptions = [
  { value: '', label: 'Tous les niveaux' },
  { value: 'L1', label: 'L1' },
  { value: 'L2', label: 'L2' },
  { value: 'L3', label: 'L3' },
  { value: 'M1', label: 'M1' },
  { value: 'M2', label: 'M2' },
];

const QuestionForm = () => {
  const navigate = useNavigate();
  const { addToast } = useGlobalToast();
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [showDuplicates, setShowDuplicates] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const titre = watch('titre', '');
  const debouncedTitre = useDebounce(titre, 600);

  // ── Charger les matières depuis l'API ────────────────────────────────────
  const { data: matieres = [] } = useQuery({
    queryKey: ['matieres'],
    queryFn: referentielApi.getMatieres,
    staleTime: Infinity,
  });

  const matiereOptions = [
    { value: '', label: 'Choisir une matière' },
    ...matieres.map((m) => ({ value: m.id, label: `${m.icone || ''} ${m.nom}` })),
  ];

  // ── Détection de doublons ─────────────────────────────────────────────────
  useEffect(() => {
    if (debouncedTitre.length < 15) {
      setDuplicates([]);
      setShowDuplicates(false);
      return;
    }
    questionsApi.checkDuplicates(debouncedTitre)
      .then((data) => {
        const results = Array.isArray(data) ? data : (data?.data ?? []);
        setDuplicates(results);
        setShowDuplicates(results.length > 0);
      })
      .catch(() => {});
  }, [debouncedTitre]);

  // ── Soumission ────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: (data) =>
      questionsApi.create({
        titre:        data.titre,
        description:  data.description,
        type_contenu: data.type || 'question',
        matiere_id:   data.matiere_id ? parseInt(data.matiere_id) : undefined,
        niveau_etudes: data.niveau || undefined,
        tags,
      }),
    onSuccess: (question) => {
      addToast('Question publiée avec succès ! 🎉', 'success');
      navigate(`/questions/${question.id}`);
    },
    onError: (err) => {
      addToast(err?.response?.data?.error || 'Erreur lors de la publication.', 'error');
    },
  });

  // ── Gestion des tags ──────────────────────────────────────────────────────
  const handleTagKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/,/g, '');
      if (newTag && !tags.includes(newTag) && tags.length < 5) {
        setTags((prev) => [...prev, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag) => setTags((prev) => prev.filter((t) => t !== tag));

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
      {/* 1. Infos de base */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-dark-900">1. Informations de base</h2>

        <Select
          label="Type de publication"
          options={typeOptions}
          {...register('type', { required: 'Veuillez sélectionner un type' })}
        />
        {errors.type && <p className="text-sm text-red-600">{errors.type.message}</p>}

        <Select
          label="Matière"
          options={matiereOptions}
          {...register('matiere_id')}
        />

        <Select
          label="Niveau"
          options={niveauOptions}
          {...register('niveau')}
        />
      </div>

      {/* 2. Contenu */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-dark-900">2. Contenu de votre question</h2>

        <Input
          label="Titre"
          placeholder="Ex: Comment résoudre une équation différentielle ?"
          error={errors.titre?.message}
          {...register('titre', {
            required: 'Le titre est obligatoire',
            minLength: { value: 10, message: 'Le titre doit faire au moins 10 caractères' },
            maxLength: { value: 150, message: 'Le titre doit faire moins de 150 caractères' },
          })}
        />

        {/* Avertissement doublons */}
        {showDuplicates && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="font-medium text-amber-800">Questions similaires détectées</p>
                <ul className="mt-2 space-y-1">
                  {duplicates.slice(0, 3).map((d) => (
                    <li key={d.id}>
                      <a
                        href={`/questions/${d.id}`}
                        className="text-sm text-amber-700 hover:text-amber-900 underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {d.titre}
                      </a>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="text-xs text-amber-600 mt-2 underline"
                  onClick={() => setShowDuplicates(false)}
                >
                  Ignorer et continuer
                </button>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-dark-700 mb-1.5">Description</label>
          <Textarea
            placeholder="Décrivez votre question en détail. Vous pouvez utiliser Markdown : **gras**, *italique*, `code`, $formule$"
            rows={12}
            className="font-mono text-sm"
            {...register('description', { required: 'La description est obligatoire' })}
          />
          {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
          <p className="text-xs text-dark-400 mt-1">Markdown et LaTeX supportés</p>
        </div>
      </div>

      {/* 3. Tags */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-dark-900">3. Tags (optionnel)</h2>
        <p className="text-sm text-dark-500">Ajoutez jusqu'à 5 tags pour aider les autres à trouver votre question</p>

        {/* Tags actuels */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 text-sm rounded-full border border-primary-200">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}

        {tags.length < 5 && (
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="python, algorithmique… (Entrée ou virgule pour ajouter)"
            className="w-full px-3 py-2.5 border border-dark-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all"
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
          Annuler
        </Button>
        <Button type="submit" loading={mutation.isPending}>
          Publier la question
        </Button>
      </div>
    </form>
  );
};

export default QuestionForm;