export const users = [
  {
    id: 1,
    pseudo: 'MarieDupont',
    email: 'marie.dupont@email.com',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    niveau: 4,
    xp: 1250,
    questions: 23,
    reponses: 67,
    solutions: 12,
    badges: ['première_question', 'première_réponse', 'aide_modal'],
    created_at: '2024-09-15',
  },
  {
    id: 2,
    pseudo: 'AlexChen',
    email: 'alex.chen@email.com',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    niveau: 3,
    xp: 780,
    questions: 15,
    reponses: 42,
    solutions: 8,
    badges: ['première_question', 'aide_nouveau'],
    created_at: '2024-10-02',
  },
  {
    id: 3,
    pseudo: 'SofiaLopez',
    email: 'sofia.lopez@email.com',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d84?w=150&h=150&fit=crop',
    niveau: 5,
    xp: 2340,
    questions: 45,
    reponses: 123,
    solutions: 25,
    badges: ['première_question', 'première_réponse', 'aide_modal', 'mentor', 'sapeur'],
    created_at: '2024-06-20',
  },
];

export const matieres = [
  { id: 1, name: 'Mathématiques', slug: 'mathematiques', icon: '📐', color: '#3b82f6' },
  { id: 2, name: 'Informatique', slug: 'informatique', icon: '💻', color: '#8b5cf6' },
  { id: 3, name: 'Physique', slug: 'physique', icon: '⚛️', color: '#10b981' },
  { id: 4, name: 'Chimie', slug: 'chimie', icon: '🧪', color: '#f59e0b' },
  { id: 5, name: 'Biologie', slug: 'biologie', icon: '🧬', color: '#ec4899' },
  { id: 6, name: 'Économie', slug: 'economie', icon: '📊', color: '#6366f1' },
];

export const tags = [
  { id: 1, name: 'Python', slug: 'python', count: 145 },
  { id: 2, name: 'JavaScript', slug: 'javascript', count: 132 },
  { id: 3, name: 'Algorithmique', slug: 'algorithmique', count: 98 },
  { id: 4, name: 'Calcul', slug: 'calcul', count: 87 },
  { id: 5, name: 'Mécanique', slug: 'mecanique', count: 76 },
  { id: 6, name: 'SQL', slug: 'sql', count: 65 },
  { id: 7, name: 'React', slug: 'react', count: 58 },
  { id: 8, name: 'Node.js', slug: 'nodejs', count: 54 },
  { id: 9, name: ' probabilités', slug: 'probabilites', count: 48 },
  { id: 10, name: 'Algèbre', slug: 'algebre', count: 42 },
];

export const questions = [
  {
    id: 1,
    titre: "Comment résoudre une équation différentielle du premier ordre ?",
    description: `Je suis bloqué sur un exercice de mathématique. On me demande de résoudre l'équation différentielle suivante :

$$y' + 2y = e^{-x}$$

avec la condition initiale $y(0) = 1$.

Je sais qu'il faut utiliser la méthode du facteur intégrant mais je ne sais pas comment l'appliquer. Quelqu'un peut-il m'expliquer les étapes ?`,
    type: 'exercice',
    statut: 'ouvert',
    matiere_id: 1,
    auteur: users[0],
    tags: [tags[3], tags[8]],
    votes: 15,
    vues: 234,
    reponses_count: 3,
    accepted: true,
    created_at: '2024-12-15T10:30:00Z',
  },
  {
    id: 2,
    titre: "Différence entre useEffect et useLayoutEffect dans React ?",
    description: `Je commence à apprendre React et je suis confus sur la différence entre \`useEffect\` et \`useLayoutEffect\`.

J'ai lu que \`useLayoutEffect\` s'exécute de manière synchrone après les mutations du DOM, mais quand est-ce vraiment nécessaire de l'utiliser ?

Voici un exemple de code où je ne sais pas lequel utiliser :

\`\`\`jsx
useEffect(() => {
  // mon code
}, [deps]);

// ou

useLayoutEffect(() => {
  // mon code
}, [deps]);
\`\`\``,
    type: 'question',
    statut: 'résolu',
    matiere_id: 2,
    auteur: users[1],
    tags: [tags[1], tags[6]],
    votes: 28,
    vues: 456,
    reponses_count: 5,
    accepted: true,
    created_at: '2024-12-14T15:45:00Z',
  },
  {
    id: 3,
    titre: "Exercice de mécanique : calculer la force de frottement",
    description: `Bonjour, j'ai un exercice de physique qui me pose probleme.

Un bloc de masse m = 5 kg est posé sur un plan horizontal. Le coefficient de frottement statique est μs = 0.4 et le coefficient de frottement dynamique est μd = 0.3.

1. Quelle est la force de frottement maximale avant glissement ?
2. Si on applique une force horizontale F = 25 N, le bloc va-t-il glisser ?

Merci pour votre aide !`,
    type: 'exercice',
    statut: 'résolu',
    matiere_id: 3,
    auteur: users[2],
    tags: [tags[4]],
    votes: 8,
    vues: 156,
    reponses_count: 2,
    accepted: true,
    created_at: '2024-12-13T09:20:00Z',
  },
  {
    id: 4,
    titre: "Comment implémenter une recherche full-text avec PostgreSQL ?",
    description: `Je développe une application avec Node.js et PostgreSQL. Je veux implémenter une fonctionnalité de recherche full-text sur mes articles.

J'ai vu qu'on pouvait utiliser \`tsvector\` et \`tsquery\` mais je ne comprends pas comment les combiner.

Voici ma table :

\`\`\`sql
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  titre VARCHAR(255),
  contenu TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

-comment créer un index efficace ?
- comment faire la recherche ?
- comment ordonner les résultats par pertinence ?`,
    type: 'question',
    statut: 'ouvert',
    matiere_id: 2,
    auteur: users[0],
    tags: [tags[5], tags[7]],
    votes: 12,
    vues: 189,
    reponses_count: 1,
    accepted: false,
    created_at: '2024-12-12T14:00:00Z',
  },
  {
    id: 5,
    titre: "Comprendre la loi normale en probabilités",
    description: `Je prépare mon examen de probabilités et j'ai du mal à comprendre la loi normale.

Dans mon cours, on dit que si X suit une loi normale N(μ, σ²), alors :

$$P(X \\in [a,b]) = \\Phi\\left(\\frac{b-\\mu}{\\sigma}\\right) - \\Phi\\left(\\frac{a-\\mu}{\sigma}\\right)$$

Mais je ne comprends pas comment utiliser cette formule. Quelqu'un peut-il me donner un exemple concret avec des calculs ?`,
    type: 'exercice',
    statut: 'ouvert',
    matiere_id: 1,
    auteur: users[1],
    tags: [tags[8], tags[9]],
    votes: 6,
    vues: 98,
    reponses_count: 0,
    accepted: false,
    created_at: '2024-12-11T11:30:00Z',
  },
];

export const reponses = [
  {
    id: 1,
    question_id: 1,
    contenu: `Voici les étapes pour résoudre cette équation différentieille :

## Étape 1 : Identifier le facteur intégrant

L'équation est sous la forme y' + P(x)y = Q(x) avec P(x) = 2

Le facteur intégrant est :
$$\\mu(x) = e^{\int P(x) dx} = e^{\int 2 dx} = e^{2x}$$

## Étape 2 : Multiplier par le facteur intégrant

$$e^{2x}y' + 2e^{2x}y = e^{2x}e^{-x} = e^{x}$$

Le côté gauche est la dérivée de (e^{2x}y) :
$$\\frac{d}{dx}(e^{2x}y) = e^{x}$$

## Étape 3 : Intégrer

$$e^{2x}y = \int e^{x} dx = e^{x} + C$$

$$y = e^{-x} + Ce^{-2x}$$

## Étape 4 : Appliquer la condition initiale

$$y(0) = 1 = 1 + C \\Rightarrow C = 0$$

## Solution finale

$$y(x) = e^{-x}$$`,
    auteur: users[2],
    votes: 12,
    est_acceptee: true,
    created_at: '2024-12-15T12:00:00Z',
  },
  {
    id: 2,
    question_id: 1,
    contenu: `Une autre méthode consiste à utiliser la formule générale :

Pour y' + ay = b, la solution est :
$$y = Ce^{-ax} + \\frac{b}{a}$$

En appliquant y(0) = 1 :
$$1 = C + \\frac{1}{2} \\Rightarrow C = \\frac{1}{2}$$

Donc y = 0.5e^{-2x} + 0.5e^{-x}

WAIT la solution est différente ! Je vais revérifier...`,
    auteur: users[1],
    votes: -2,
    est_acceptee: false,
    created_at: '2024-12-15T13:30:00Z',
  },
  {
    id: 3,
    question_id: 2,
    contenu: `La différence principale est le moment d'exécution :

- **useEffect** : s'exécute de façon asynchrone après le rendu, ne bloque pas le navigateur
- **useLayoutEffect** : s'exécute de façon synchrone après les mutations du DOM, avant que le navigateur ne soit paint

## Quand utiliser useLayoutEffect ?

Utilise-le quand tu as besoin de :
1. Mesurer des éléments DOM (getBoundingClientRect)
2. Modifier le DOM simultanément avec un état
3.Éviter les flickers visuels

## Exemple concret

\`\`\`jsx
function Example() {
  const [height, setHeight] = useState(0);
  
  useLayoutEffect(() => {
    setHeight(ref.current.offsetHeight);
  }, [deps]);
  
  return <div ref={ref}>{height}</div>;
}
\`\`\`

Dans ce cas, useLayoutEffect évite le flicker car il mesure avant que le navigateur ne paint.`,
    auteur: users[2],
    votes: 25,
    est_acceptee: true,
    created_at: '2024-12-14T17:00:00Z',
  },
  {
    id: 4,
    question_id: 3,
    contenu: `## 1. Force de frottement maximale

La force normale N = mg = 5 × 10 = 50 N (avec g = 10 m/s²)

La force de frottement maximale :
$$F_{max} = \\mu_s N = 0.4 × 50 = 20 N$$

## 2. Le bloc va-t-il glisser ?

On compare F = 25 N à Fmax = 20 N

Puisque 25 > 20, le bloc va glisser.

La force de frottement cinétique :
$$F_k = \\mu_k N = 0.3 × 50 = 15 N$$

L'accélération du bloc :
$$a = \\frac{F - F_k}{m} = \\frac{25 - 15}{5} = 2 m/s²$$`,
    auteur: users[0],
    votes: 8,
    est_acceptee: true,
    created_at: '2024-12-13T11:00:00Z',
  },
];

export const notifications = [
  {
    id: 1,
    type: 'reponse_new',
    message: 'Sophie Martin a répondu à votre question',
    question_id: 2,
    lue: false,
    created_at: '2024-12-15T16:00:00Z',
  },
  {
    id: 2,
    type: 'vote',
    message: 'Votre réponse a reçu 10 votes !',
    lue: true,
    created_at: '2024-12-15T14:30:00Z',
  },
  {
    id: 3,
    type: 'solution',
    message: 'Votre réponse a été marquée comme solution !',
    question_id: 1,
    lue: true,
    created_at: '2024-12-15T12:00:00Z',
  },
  {
    id: 4,
    type: 'badge',
    message: 'Vous avez débloqué le badge "Première réponse" !',
    lue: false,
    created_at: '2024-12-14T10:00:00Z',
  },
];