import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '../store/authStore';
import { useGlobalToast } from '../components/ui/Toast';
import { Button, Input } from '../components/ui';

const LoginPage = () => {
  const navigate = useNavigate();
  const { loginAsync, isLoading, error } = useAuthStore();
  const { addToast } = useGlobalToast();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const result = await loginAsync(data.email, data.password);
    if (result.success) {
      addToast('Connexion réussie ! Bienvenue 👋', 'success');
      navigate('/feed');
    } else {
      addToast(result.error, 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-glow">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </Link>
          <h1 className="text-2xl font-display font-bold text-dark-900">Connexion</h1>
          <p className="text-dark-500 mt-1">Accédez à votre compte EntraideAc</p>
        </div>

        <div className="card p-8">
          {/* Erreur globale */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="vous@exemple.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email obligatoire',
                pattern: { value: /^\S+@\S+$/, message: 'Email invalide' },
              })}
            />

            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password', {
                required: 'Mot de passe obligatoire',
                minLength: { value: 6, message: 'Au moins 6 caractères' },
              })}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-dark-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-dark-600">Se souvenir</span>
              </label>
              <Link to="/auth/reset" className="text-primary-600 hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>

            <Button type="submit" loading={isLoading} className="w-full">
              Se connecter
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-dark-500 mt-6">
          Pas encore de compte ?{' '}
          <Link to="/auth/register" className="text-primary-600 hover:underline font-medium">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;