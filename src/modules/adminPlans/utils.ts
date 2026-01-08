export function dollarsFromCents(cents: number | null | undefined) {
  if (typeof cents !== "number") return "";
  return (cents / 100).toFixed(2);
}

export function centsFromDollarsString(v: string | undefined) {
  const s = (v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

export function nullIfEmpty(v: string | null | undefined) {
  const t = (v ?? "").trim();
  return t.length ? t : null;
}

export function intOrNullFromString(v: string | undefined) {
  const s = (v ?? "").trim();
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}