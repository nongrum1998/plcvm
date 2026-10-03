import * as React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { cn } from '@utils/helpers/cn';

interface InputProps extends TextInputProps {
  className?: string;
  /** Shows error styling when true. */
  error?: boolean;
}

/**
 * Text input following HP design system.
 *
 * - `{rounded.md}` (4px) corners — buttons and inputs share the same sharp radius
 * - 44px height per HP touch-target spec
 * - `{colors.steel}` (`#c2c2c2`) border default; `{colors.ink}` border on focus
 * - Padding: `{spacing.sm} {spacing.md}` (12px vertical, 16px horizontal)
 *
 * @example
 * ```tsx
 * <Input placeholder="Search products..." />
 * <Input error placeholder="This field is required" />
 * ```
 */
const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({ className, error, multiline, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <TextInput
        ref={ref}
        className={cn(
          'text-body-md w-full rounded-md border bg-background px-4 py-3 text-foreground',
          'min-h-14',
          isFocused ? 'border-primary' : 'border-gray-300',
          error ? 'bg-destructive/5 border-destructive' : '',
          multiline && 'min-h-[100px]',
          className
        )}
        placeholderClassName="text-gray-200"
        textAlignVertical={multiline ? 'top' : 'center'}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
