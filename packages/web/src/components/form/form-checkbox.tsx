import type { ComponentProps, ReactNode } from 'react';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { Checkbox } from '@/components/base/checkbox/checkbox';

type FormCheckboxProps<TFieldValues extends FieldValues> = Omit<
  ComponentProps<typeof Checkbox>,
  'isSelected' | 'onChange' | 'onBlur' | 'name' | 'isInvalid'
> & {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  hint?: ReactNode;
};

export function FormCheckbox<TFieldValues extends FieldValues>({
  name,
  control,
  hint,
  ...checkboxProps
}: FormCheckboxProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Checkbox
          {...checkboxProps}
          name={field.name}
          isSelected={Boolean(field.value)}
          onChange={field.onChange}
          onBlur={field.onBlur}
          hint={hint}
        />
      )}
    />
  );
}
