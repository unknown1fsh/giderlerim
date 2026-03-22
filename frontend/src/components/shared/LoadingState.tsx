export function LoadingState({ mesaj = 'Yükleniyor...' }: { mesaj?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-accent" />
      <p className="mt-4 text-sm text-text-muted">{mesaj}</p>
    </div>
  );
}
