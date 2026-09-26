export function getSafeRedirectPath(redirect: string | null, origin: string): string | null {
  if (!redirect || !redirect.startsWith('/') || redirect.startsWith('//')) return null;

  const destination = new URL(redirect, origin);
  if (destination.origin !== origin) return null;
  return `${destination.pathname}${destination.search}${destination.hash}`;
}

export function getAuthCallbackUrl(redirect: string | null, origin: string): string {
  const callbackUrl = new URL('/auth/callback', origin);
  const redirectPath = getSafeRedirectPath(redirect, origin);
  if (redirectPath) callbackUrl.searchParams.set('redirect', redirectPath);
  return callbackUrl.toString();
}
