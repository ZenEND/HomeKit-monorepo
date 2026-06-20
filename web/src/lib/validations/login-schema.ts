import * as yup from 'yup';
import type { TranslationValues } from '@/lib/i18n/translations';

type Translate = (key: string, values?: TranslationValues) => string;

export function createLoginSchema(t: Translate) {
  return yup.object({
  email: yup
    .string()
      .required(t('login.emailRequired'))
      .email(t('login.emailInvalid')),
  password: yup
    .string()
      .required(t('login.passwordRequired'))
      .min(8, t('login.passwordMin')),
  rememberMe: yup.boolean().default(false),
  });
}

export const loginSchema = createLoginSchema((key) => key);

export type LoginFormValues = yup.InferType<typeof loginSchema>;
