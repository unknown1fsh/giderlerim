import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  acik: boolean;
  baslik: string;
  mesaj: string;
  onayEtiket?: string;
  iptalEtiket?: string;
  onOnayla: () => void;
  onIptal: () => void;
}

export function ConfirmDialog({
  acik,
  baslik,
  mesaj,
  onayEtiket = 'Onayla',
  iptalEtiket = 'İptal',
  onOnayla,
  onIptal,
}: ConfirmDialogProps) {
  if (!acik) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-bg-primary shadow-xl p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-danger/10 p-2">
            <AlertTriangle className="h-5 w-5 text-danger" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">{baslik}</h3>
        </div>
        <p className="mt-3 text-sm text-text-muted">{mesaj}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onIptal}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-bg-secondary transition-colors"
          >
            {iptalEtiket}
          </button>
          <button
            onClick={onOnayla}
            className="rounded-lg bg-danger px-4 py-2 text-sm text-white hover:bg-red-600"
          >
            {onayEtiket}
          </button>
        </div>
      </div>
    </div>
  );
}
