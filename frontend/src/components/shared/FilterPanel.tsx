interface FilterPanelProps {
  children: React.ReactNode;
  baslik?: string;
}

export function FilterPanel({ children, baslik = 'Filtreler' }: FilterPanelProps) {
  return (
    <div className="rounded-xl border border-border bg-bg-primary p-4 shadow-sm shadow-black/[0.04]">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">{baslik}</p>
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );
}
