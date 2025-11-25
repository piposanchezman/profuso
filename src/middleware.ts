import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';

const isProtectedRoute = createRouteMatcher(['/admin(.*)']);

// Variables de entorno para organización y rol permitidos
const allowedOrgId = process.env.CLERK_ALLOWED_ORG_ID || import.meta.env.CLERK_ALLOWED_ORG_ID;
const allowedRole = process.env.CLERK_ALLOWED_ROLE || import.meta.env.CLERK_ALLOWED_ROLE;

export const onRequest = clerkMiddleware((auth, context) => {
  const user = auth();

  // Verificar si la ruta es protegida
  if (!isProtectedRoute(context.request)) return;

  // Verificar si el usuario está autenticado
  if (!user.isAuthenticated) {
    // Redirigir a inicio de sesión si no está autenticado
    return user.redirectToSignIn({
      returnBackUrl: context.request.url, 
    });
  }

  // Extraer organización y rol del usuario
  const { orgId, orgRole } = user;

  // Verificar existencia de organización y rol
  if (!orgId || !orgRole) {
    return new Response('Acceso restringido: falta rol u organización', { status: 403 });
  }

  // Verificar permisos de organización y rol
  if (orgId !== allowedOrgId || orgRole !== allowedRole) {
    return new Response('No autorizado: permisos insuficientes', { status: 403 });
  }
});
