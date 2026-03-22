interface ActionBarProps {
  children: React.ReactNode;
}

export function ActionBar({ children }: ActionBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-bg-tertiary p-3">
      {children}
    </div>
  );
}
