import { Link } from 'react-router-dom';
import QuestionForm from '../components/question/QuestionForm';

const NewQuestionPage = () => {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-dark-500 mb-4">
          <Link to="/feed" className="hover:text-primary-600">Feed</Link>
          <span>/</span>
          <span className="text-dark-900">Nouvelle question</span>
        </nav>
        <h1 className="text-2xl font-display font-bold text-dark-900">Poser une question</h1>
        <p className="text-dark-500 mt-1">
          Obtenez de l'aide sur vos exercices, cours ou projets académiques
        </p>
      </div>

      {/* Form */}
      <QuestionForm />
    </div>
  );
};

export default NewQuestionPage;