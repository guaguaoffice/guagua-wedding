export function toNum(d: unknown): number {
  if (d === null || d === undefined) return 0;
  return Number(d.toString());
}

export function toNumOrNull(d: unknown): number | null {
  if (d === null || d === undefined) return null;
  return Number(d.toString());
}
