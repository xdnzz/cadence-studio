import { cn } from '@/lib/utils';

export function Field({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-control border border-line bg-canvas px-3 py-1.5 text-sm text-soft placeholder:text-faint focus:outline-none focus:ring-1 focus:ring-brand',
        className,
      )}
      {...props}
    />
  );
}
