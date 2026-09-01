import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SignInForm from '../components/auth/SignInForm';
import SEOHead from '../components/SEOHead';

export default function LoginPage() {
  const { t } = useTranslation('crm');
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/crm-dashboard';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-aurora-quiet flex flex-col justify-center py-12 pt-24 sm:px-6 lg:px-8">
      <SEOHead canonical="/login" noindex={true} />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center font-display font-light text-3xl sm:text-4xl text-white">
          {t('pages.login.heading')}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <SignInForm />
      </div>
    </div>
  );
}