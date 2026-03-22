interface PageHeaderProps {
  baslik: string;
  altBaslik?: string;
  eylem?: React.ReactNode;
}

export function PageHeader({ baslik, altBaslik, eylem }: PageHeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{baslik}</h1>
        {altBaslik && <p className="mt-1 text-sm text-text-muted">{altBaslik}</p>}
      </div>
      {eylem && <div className="flex items-center gap-3">{eylem}</div>}
    </div>
  );
}
