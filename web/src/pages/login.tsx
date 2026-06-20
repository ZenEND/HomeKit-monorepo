import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Mail01, Lock01 } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { FormCheckbox } from '@/components/form/form-checkbox';
import { FormInput } from '@/components/form/form-input';
import { useTranslation } from '@/lib/i18n/use-translation';
import {
  createLoginSchema,
  type LoginFormValues,
} from '@/lib/validations/login-schema';

export function Login() {
  const { t } = useTranslation();
  const loginSchema = useMemo(() => createLoginSchema(t), [t]);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      await new Promise((resolve) => setTimeout(resolve, 1200));
      console.log('Login submitted:', values);
    } catch {
      setSubmitError(t('login.error'));
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-secondary bg-primary p-8 shadow-xs">
        <div className="mb-8 text-center">
          <h1 className="text-display-xs font-semibold text-primary">{t('login.title')}</h1>
          <p className="mt-2 text-md text-tertiary">{t('login.subtitle')}</p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormInput
            control={control}
            name="email"
            type="email"
            label={t('login.email')}
            placeholder={t('login.emailPlaceholder')}
            icon={Mail01}
            isRequired
            autoComplete="email"
          />

          <FormInput
            control={control}
            name="password"
            type="password"
            label={t('login.password')}
            placeholder={t('login.passwordPlaceholder')}
            icon={Lock01}
            isRequired
            autoComplete="current-password"
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
            {t('login.signIn')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-tertiary">
          {t('login.noAccount')}{' '}
          <Button href="#" color="link-color" size="sm">
            {t('login.signUp')}
          </Button>
        </p>
      </div>
    </div>
  );
}
