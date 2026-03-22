interface FormSectionProps {
  baslik: string;
  aciklama?: string;
  children: React.ReactNode;
}

export function FormSection({ baslik, aciklama, children }: FormSectionProps) {
  return (
    <div className="rounded-xl border border-border bg-bg-primary p-6 shadow-sm shadow-black/[0.04]">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-text-primary">{baslik}</h3>
        {aciklama && <p className="mt-1 text-sm text-text-muted">{aciklama}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
