/** Profil henüz yüklenmemişse (undefined) admin sayılmaz. */
export function adminMenuGoster(adminMi: boolean | undefined): boolean {
  return adminMi === true;
}
