import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center border', {
  variants: {
    tone: {
      neutral: 'rounded bg-raised px-1.5 py-0.5 font-mono text-[9px] text-muted sm:text-[10px]',
      success:
        'rounded-full border-success/20 bg-success/10 px-2 py-0.5 text-[11px] font-medium capitalize text-success',
      urgent:
        'rounded border-danger-line/50 bg-danger-deep/50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-danger',
      high: 'rounded border-brand-line/50 bg-brand-deep/50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand-soft',
      medium:
        'rounded border-warning-line/50 bg-warning-deep/50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-warning',
      low: 'rounded border-line-strong/50 bg-raised/50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted',
    },
  },
  defaultVariants: {
    tone: 'neutral',
  },
});

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
