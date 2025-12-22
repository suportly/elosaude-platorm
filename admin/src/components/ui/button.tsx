'use client';

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles = {
  primary: cn(
    'bg-primary text-primary-foreground',
    'hover:bg-primary/90',
    'focus:ring-primary/20'
  ),
  secondary: cn(
    'bg-secondary text-secondary-foreground',
    'hover:bg-secondary/90',
    'focus:ring-secondary/20'
  ),
  outline: cn(
    'border border-input bg-background text-foreground',
    'hover:bg-muted',
    'focus:ring-primary/20'
  ),
  ghost: cn(
    'bg-transparent text-foreground',
    'hover:bg-muted',
    'focus:ring-primary/20'
  ),
  destructive: cn(
    'bg-destructive text-destructive-foreground',
    'hover:bg-destructive/90',
    'focus:ring-destructive/20'
  ),
};

const sizeStyles = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium',
          'transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Icon Button variant for action buttons
export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  'aria-label': string;
}

const iconButtonSizes = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-10 w-10',
};

const iconButtonVariants = {
  ghost: cn(
    'bg-transparent text-muted-foreground',
    'hover:bg-muted hover:text-foreground',
    'focus:ring-primary/20'
  ),
  outline: cn(
    'border border-input bg-background text-muted-foreground',
    'hover:bg-muted hover:text-foreground',
    'focus:ring-primary/20'
  ),
  destructive: cn(
    'bg-transparent text-destructive',
    'hover:bg-destructive/10',
    'focus:ring-destructive/20'
  ),
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { className, variant = 'ghost', size = 'md', disabled, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-lg',
          'transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          'disabled:pointer-events-none disabled:opacity-50',
          iconButtonVariants[variant],
          iconButtonSizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
