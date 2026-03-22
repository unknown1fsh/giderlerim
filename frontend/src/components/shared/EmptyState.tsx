import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  ikon: LucideIcon;
  baslik: string;
  aciklama: string;
  eylem?: { etiket: string; onClick: () => void };
}

export function EmptyState({ ikon: Ikon, baslik, aciklama, eylem }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-bg-secondary p-4">
        <Ikon className="h-10 w-10 text-text-muted" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary">{baslik}</h3>
      <p className="mt-1 text-sm text-text-muted">{aciklama}</p>
      {eylem && (
        <button onClick={eylem.onClick} className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover">
          {eylem.etiket}
        </button>
      )}
    </div>
  );
}
