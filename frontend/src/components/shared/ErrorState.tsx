import { AlertCircle } from 'lucide-react';

export function ErrorState({ mesaj = 'Veri yüklenemedi', yenidenDene }: { mesaj?: string; yenidenDene?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <AlertCircle className="h-12 w-12 text-danger" />
      <p className="mt-3 text-sm text-text-muted">{mesaj}</p>
      {yenidenDene && (
        <button onClick={yenidenDene} className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover">
          Tekrar Dene
        </button>
      )}
    </div>
  );
}
