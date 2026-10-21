import { cn } from '@/lib/utils';

export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <section
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-panel border border-line bg-surface shadow-panel',
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <header
      className={cn(
        'z-10 flex items-center justify-between gap-3 border-b border-line bg-surface/80 p-4 backdrop-blur',
        className,
      )}
    >
      {children}
    </header>
  );
}

export function PanelTitle({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-ink">
      {icon}
      <h2 className="text-sm font-semibold">{children}</h2>
    </div>
  );
}

export function SectionLabel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h3 className={cn('text-xs font-semibold uppercase tracking-wider text-muted', className)}>
      {children}
    </h3>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('rounded-card border border-line/60 bg-canvas/40', className)}>{children}</div>
  );
}
