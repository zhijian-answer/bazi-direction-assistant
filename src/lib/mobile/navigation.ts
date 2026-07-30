export function resolveGeneratingRoute(next: string) {
  const isMobileRoute = next === "/m" || next.startsWith("/m/");
  const isBlockedRoute = next.startsWith("/m/create") || next.startsWith("/m/generating");

  if (isMobileRoute && !isBlockedRoute) return next;
  if (next === "zodiac") return "/m/report/zodiac";
  if (next === "ziwei") return "/m/report/ziwei";
  return "/m/report/bazi";
}
