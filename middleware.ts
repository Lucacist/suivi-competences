import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. On vérifie si l'utilisateur a le cookie "auth_token"
  const authToken = request.cookies.get('auth_token');
  
  // 2. On regarde sur quelle page il est
  const isLoginPage = request.nextUrl.pathname === '/login';

  // SCÉNARIO A : Il n'est pas connecté et essaie d'aller ailleurs que sur /login
  if (!authToken && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // SCÉNARIO B : Il est déjà connecté mais essaie de retourner sur /login
  if (authToken && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Sinon, on le laisse passer
  return NextResponse.next();
}

// Configuration : sur quelles routes le middleware doit s'activer
export const config = {
  // On exclut les fichiers statiques (images, css, api, favicon) pour ne pas bloquer le chargement du site
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};