/** Hafif atmosfer: tek vignette + çok düşük grain (LCP / paint maliyetini sınırlar). */
export function LandingDecor() {
  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.018] motion-reduce:opacity-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(70,95,255,0.12),transparent)]" />
    </>
  );
}
