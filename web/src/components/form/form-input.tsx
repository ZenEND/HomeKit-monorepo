import type { ComponentType, ReactNode } from 'react';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { Input, type InputProps } from '@/components/base/input/input';

type FormInputProps<TFieldValues extends FieldValues> = Omit<
  InputProps,
  'value' | 'onChange' | 'onBlur' | 'name' | 'isInvalid' | 'hint'
> & {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  hint?: ReactNode;
  icon?: ComponentType<{ className?: string }>;
};

export function FormInput<TFieldValues extends FieldValues>({
  name,
  control,
  hint,
  ...inputProps
}: FormInputProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Input
          {...inputProps}
          {...field}
          value={field.value ?? ''}
          isInvalid={Boolean(fieldState.error)}
          hint={fieldState.error?.message ?? hint}
        />
      )}
    />
  );
}
