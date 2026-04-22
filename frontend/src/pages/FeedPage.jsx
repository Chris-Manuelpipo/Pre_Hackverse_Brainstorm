import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { questionsApi } from '../api/questions.api';
import { useDebounce } from '../hooks/useDebounce';
import { Button, Skeleton, Input } from '../components/ui';
import QuestionCard from '../components/question/QuestionCard';
import QuestionFilters from '../components/question/QuestionFilters';
import useAuthStore from '../store/authStore';

const FeedPage = () => {
  const { isAuthenticated } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(searchInput, 400);

  // Lire les filtres depuis l'URL
  const filters = {
    matiere:      searchParams.get('matiere') || '',
    statut:       searchParams.get('statut') || '',
    type_contenu: searchParams.get('type_contenu') || searchParams.get('type') || '',
    sort:         searchParams.get('sort') || 'recent',
  };

  // ── Query : liste des questions ──────────────────────────────────────────
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['questions', filters, page, debouncedSearch],
    queryFn: () => {
      if (debouncedSearch) {
        return questionsApi.search(debouncedSearch, { page, limit: 15 });
      }
      return questionsApi.getAll({ ...filters, page, limit: 15 });
    },
    keepPreviousData: true,
    staleTime: 30000,
  });

  const questions = Array.isArray(data) ? data : (data?.data ?? []);
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? questions.length;

  const updateFilter = (key, value) => {
    setPage(1);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-dark-900">Questions</h1>
          <p className="text-dark-500 mt-1">
            {isLoading ? 'Chargement…' : `${total} question${total !== 1 ? 's' : ''} disponible${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        {isAuthenticated ? (
          <Link to="/questions/new">
            <Button>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouvelle question
            </Button>
          </Link>
        ) : (
          <Link to="/auth/login">
            <Button>Se connecter pour poser</Button>
          </Link>
        )}
      </div>

      {/* Recherche */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
        </svg>
        <input
          type="search"
          placeholder="Rechercher une question…"
          value={searchInput}
          onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 border border-dark-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all"
        />
      </div>

      {/* Filters */}
      <QuestionFilters
        filters={filters}
        onFilterChange={updateFilter}
      />

      {/* Questions List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-5">
              <div className="flex gap-4">
                <div className="hidden sm:flex flex-col gap-3 w-[60px]">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="card p-12 text-center">
          <svg className="w-16 h-16 text-dark-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-dark-900 mb-2">Aucune question trouvée</h3>
          <p className="text-dark-500 mb-6">
            {searchInput ? `Aucun résultat pour "${searchInput}"` : 'Soyez le premier à poser une question !'}
          </p>
          {isAuthenticated && (
            <Link to="/questions/new">
              <Button>Poser une question</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={question.id} style={{ animationDelay: `${index * 40}ms` }}>
              <QuestionCard question={question} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !isLoading && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Précédent
          </Button>
          <span className="text-sm text-dark-500">
            Page {page} / {totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={page >= totalPages || isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant →
          </Button>
        </div>
      )}
    </div>
  );
};

export default FeedPage;