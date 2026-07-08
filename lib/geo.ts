export function countryCodeToFlag(code: string): string {
  if (!code || code.length !== 2) return '🌐';
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)));
}

export function countryName(code: string): string {
  if (!code) return 'Desconhecido';
  try {
    return new Intl.DisplayNames(['pt-BR'], { type: 'region' }).of(code.toUpperCase()) || code;
  } catch {
    return code;
  }
}
