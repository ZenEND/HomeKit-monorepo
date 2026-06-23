import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ArrowLeft, Mail01, Lock01 } from '@untitledui/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/base/buttons/button';
import { FormCheckbox } from '@/components/form/form-checkbox';
import { FormInput } from '@/components/form/form-input';
import { useTranslation } from '@/lib/i18n/use-translation';
import {
  createLoginSchema,
  type LoginFormValues,
} from '@/lib/validations/login-schema';
import { useUserStore } from '@/store/useUserStore';

function openAuthPage(path: '/login' | '/sign-up') {
  window.location.assign(path);
}

export function Login() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const login = useUserStore((state) => state.login);
  const register = useUserStore((state) => state.register);
  const loginSchema = useMemo(() => createLoginSchema(t), [t]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isSignUp = location.pathname === '/sign-up';
  const from = (location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null)?.from;
  const redirectTo = `${from?.pathname ?? '/storage'}${from?.search ?? ''}${from?.hash ?? ''}`;

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError(null);

    try {
      if (isSignUp) {
        await register(values.email, values.password);
      } else {
        await login(values.email, values.password);
      }

      navigate(redirectTo, { replace: true });
    } catch {
      setSubmitError(t('login.error'));
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-secondary bg-primary p-8 shadow-xs">
        <Button href="/" color="link-gray" size="sm" iconLeading={ArrowLeft} className="mb-6">
          {t('login.backToLanding')}
        </Button>

        <div className="mb-8 text-center">
          <h1 className="text-display-xs font-semibold text-primary">
            {t(isSignUp ? 'login.signUpTitle' : 'login.title')}
          </h1>
          <p className="mt-2 text-md text-tertiary">
            {t(isSignUp ? 'login.signUpSubtitle' : 'login.subtitle')}
          </p>
        </div>

        <form
          key={isSignUp ? 'sign-up' : 'login'}
          className="flex flex-col gap-5"
          autoComplete="on"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <FormInput
            control={control}
            name="email"
            type="email"
            label={t('login.email')}
            placeholder={t('login.emailPlaceholder')}
            icon={Mail01}
            isRequired
            autoComplete="username"
          />

          <FormInput
            control={control}
            name="password"
            type="password"
            label={t('login.password')}
            placeholder={t('login.passwordPlaceholder')}
            icon={Lock01}
            isRequired
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
          />

          <FormCheckbox
            control={control}
            name="rememberMe"
            label={t('login.remember')}
            hint={t('login.rememberHint')}
          />

          {submitError && (
            <p className="text-sm text-error-primary" role="alert">
              {submitError}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
            {t(isSignUp ? 'login.createAccount' : 'login.signIn')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-tertiary">
          {t(isSignUp ? 'login.hasAccount' : 'login.noAccount')}{' '}
          <Button
            color="link-color"
            size="sm"
            onPress={() => openAuthPage(isSignUp ? '/login' : '/sign-up')}
          >
            {t(isSignUp ? 'login.signIn' : 'login.signUp')}
          </Button>
        </p>
      </div>
    </div>
  );
}
