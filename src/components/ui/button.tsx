import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 rounded-control transition-colors disabled:pointer-events-none disabled:bg-raised disabled:text-muted',
  {
    variants: {
      variant: {
        primary:
          'bg-brand font-semibold text-on-brand shadow-md hover:bg-brand-hover active:scale-95',
        secondary:
          'border border-line-strong/60 bg-raised font-medium text-ink hover:bg-raised-hover hover:text-ink-strong',
        ghost: 'font-medium text-muted hover:bg-raised hover:text-ink',
        toggle:
          'border border-transparent bg-raised font-medium text-muted hover:text-soft data-[active=true]:border-brand/30 data-[active=true]:bg-brand/10 data-[active=true]:text-brand-soft',
      },
      size: {
        sm: 'px-2.5 py-1.5 text-xs',
        md: 'px-3 py-1.5 text-xs',
        icon: 'p-2',
        'icon-lg': 'rounded-full p-2.5 shadow-lg sm:p-3',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'sm',
    },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { ref?: React.Ref<HTMLButtonElement> };

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
