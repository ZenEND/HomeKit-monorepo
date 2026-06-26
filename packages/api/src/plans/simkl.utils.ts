const POSTER_FALLBACK_URL = 'https://wsrv.nl/?url=https://simkl.in/poster_no_pic.png';

export function buildPosterUrl(posterPath: string | null | undefined): string {
  if (!posterPath) {
    return POSTER_FALLBACK_URL;
  }

  if (posterPath.startsWith('http://') || posterPath.startsWith('https://')) {
    return `https://wsrv.nl/?url=${encodeURIComponent(posterPath)}&q=90`;
  }

  return `https://wsrv.nl/?url=https://simkl.in/posters/${posterPath}_w.webp&q=90`;
}
