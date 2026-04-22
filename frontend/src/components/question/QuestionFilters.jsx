import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Select } from '../ui';
import { referentielApi } from '../../api/referentiel.api';

const sortOptions = [
  { value: 'recent', label: 'Plus récent' },
  { value: 'votes', label: 'Plus votés' },
  { value: 'vues', label: 'Plus vus' },
];

const statutOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: 'ouvert', label: 'Ouvert' },
  { value: 'résolu', label: 'Résolu' },
  { value: 'fermé', label: 'Fermé' },
];

const QuestionFilters = ({ filters = {}, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Charger les matières depuis l'API
  const { data: matieres = [] } = useQuery({
    queryKey: ['matieres'],
    queryFn: referentielApi.getMatieres,
    staleTime: Infinity,
  });

  const matiereOptions = [
    { value: '', label: 'Toutes les matières' },
    ...matieres.map((m) => ({ value: m.nom, label: `${m.icone || ''} ${m.nom}` })),
  ];

  const hasActiveFilters = filters.statut || filters.matiere;

  const handleClear = () => {
    onFilterChange('statut', '');
    onFilterChange('matiere', '');
    onFilterChange('sort', 'recent');
  };

  return (
    <div className="card p-4 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        {/* Tri */}
        <Select
          options={sortOptions}
          value={filters.sort || 'recent'}
          onChange={(v) => onFilterChange('sort', v)}
          className="w-40"
        />

        {/* Statut */}
        <Select
          options={statutOptions}
          value={filters.statut || ''}
          onChange={(v) => onFilterChange('statut', v)}
          className="w-36"
        />

        {/* Bouton filtres avancés */}
        <Button
          variant={isOpen ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtres
          {hasActiveFilters && <span className="w-2 h-2 bg-accent-500 rounded-full" />}
        </Button>

        <div className="flex-1" />

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClear} type="button">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Effacer
          </Button>
        )}
      </div>

      {/* Filtres avancés */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-dark-100">
          <div className="flex flex-wrap items-center gap-3">
            <Select
              options={matiereOptions}
              value={filters.matiere || ''}
              onChange={(v) => onFilterChange('matiere', v)}
              className="w-48"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionFilters;