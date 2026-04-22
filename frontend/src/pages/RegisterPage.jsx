import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '../store/authStore';
import { useGlobalToast } from '../components/ui/Toast';
import { Button, Input } from '../components/ui';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { registerAsync, isLoading, error } = useAuthStore();
  const { addToast } = useGlobalToast();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    const result = await registerAsync(data.pseudo, data.email, data.password);
    if (result.success) {
      addToast('Compte créé avec succès ! Bienvenue 🎉', 'success');
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
          <h1 className="text-2xl font-display font-bold text-dark-900">Inscription</h1>
          <p className="text-dark-500 mt-1">Créez votre compte EntraideAc</p>
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
              label="Pseudo"
              placeholder="Votre pseudo"
              error={errors.pseudo?.message}
              {...register('pseudo', {
                required: 'Pseudo obligatoire',
                minLength: { value: 3, message: 'Au moins 3 caractères' },
                maxLength: { value: 20, message: 'Maximum 20 caractères' },
              })}
            />

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
                minLength: { value: 8, message: 'Au moins 8 caractères' },
              })}
            />

            <Input
              label="Confirmation"
              type="password"
              placeholder="••••••••"
              error={errors.confirm?.message}
              {...register('confirm', {
                required: 'Confirmation obligatoire',
                validate: (value) =>
                  value === password || 'Les mots de passe ne correspondent pas',
              })}
            />

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-dark-300 text-primary-600 focus:ring-primary-500 mt-1"
                required
              />
              <span className="text-sm text-dark-600">
                J'accepte les{' '}
                <Link to="/terms" className="text-primary-600 hover:underline">CGU</Link>{' '}
                et la{' '}
                <Link to="/privacy" className="text-primary-600 hover:underline">politique de confidentialité</Link>
              </span>
            </label>

            <Button type="submit" loading={isLoading} className="w-full">
              Créer mon compte
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-dark-400">ou</span>
            </div>
          </div>

          <Button variant="secondary" className="w-full" type="button">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            S'inscrire avec Google
          </Button>
        </div>

        <p className="text-center text-sm text-dark-500 mt-6">
          Déjà un compte ?{' '}
          <Link to="/auth/login" className="text-primary-600 hover:underline font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;