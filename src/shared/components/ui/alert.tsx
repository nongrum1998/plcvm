import { createContext, useContext } from 'react';
import { View, Text, ViewProps, TextProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@utils/helpers/cn';

type Variant = 'default' | 'destructive' | 'success' | 'warning' | 'info';

const AlertContext = createContext<{ variant: Variant }>({ variant: 'default' });

const alertVariants = cva('relative w-full rounded-xl border p-4 flex-row items-start gap-3', {
  variants: {
    variant: {
      default: 'bg--50 border-gray-200',
      destructive: 'bg-red-50 border-red-200',
      success: 'bg-emerald-50 border-emerald-200',
      warning: 'bg-amber-50 border-amber-200',
      info: 'bg-blue-50 border-blue-200',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const alertTitleVariants = cva('text-sm font-semibold leading-none tracking-tight mb-1', {
  variants: {
    variant: {
      default: 'text-gray-900',
      destructive: 'text-red-900',
      success: 'text-emerald-900',
      warning: 'text-amber-900',
      info: 'text-blue-900',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const alertDescriptionVariants = cva('text-sm leading-relaxed font-normal', {
  variants: {
    variant: {
      default: 'text-gray-600',
      destructive: 'text-red-700',
      success: 'text-emerald-700',
      warning: 'text-amber-700',
      info: 'text-blue-700',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface AlertProps extends ViewProps, VariantProps<typeof alertVariants> {
  className?: string;
}

export function Alert({ className, variant = 'default', children, ...props }: AlertProps) {
  return (
    <AlertContext.Provider value={{ variant: variant || 'default' }}>
      <View className={cn(alertVariants({ variant }), className)} {...props}>
        {children}
      </View>
    </AlertContext.Provider>
  );
}

export function AlertTitle({ className, children, ...props }: TextProps & { className?: string }) {
  const { variant } = useContext(AlertContext);
  return (
    <Text className={cn(alertTitleVariants({ variant }), className)} {...props}>
      {children}
    </Text>
  );
}

export function AlertDescription({
  className,
  children,
  ...props
}: TextProps & { className?: string }) {
  const { variant } = useContext(AlertContext);
  return (
    <Text className={cn(alertDescriptionVariants({ variant }), className)} {...props}>
      {children}
    </Text>
  );
}
