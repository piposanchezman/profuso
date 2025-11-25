# Imagen base con Node.js 24
FROM node:24.11.1-alpine AS base

# Instalar pnpm globalmente
RUN corepack enable && corepack prepare pnpm@latest --activate

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json ./
COPY pnpm-lock.yaml* ./

# ============================================
# Etapa de dependencias
# ============================================
FROM base AS deps

# Instalar todas las dependencias (incluyendo devDependencies para el build)
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; else pnpm install; fi

# ============================================
# Etapa de construcción
# ============================================
FROM base AS builder

# Argumentos de build para variables públicas de Clerk
ARG PUBLIC_CLERK_PUBLISHABLE_KEY
ARG CLERK_SECRET_KEY
ARG PUBLIC_CLERK_SIGN_IN_URL
ARG PUBLIC_CLERK_SIGN_UP_URL

# Establecer variables de entorno para el build
ENV PUBLIC_CLERK_PUBLISHABLE_KEY=$PUBLIC_CLERK_PUBLISHABLE_KEY
ENV CLERK_SECRET_KEY=$CLERK_SECRET_KEY
ENV PUBLIC_CLERK_SIGN_IN_URL=$PUBLIC_CLERK_SIGN_IN_URL
ENV PUBLIC_CLERK_SIGN_UP_URL=$PUBLIC_CLERK_SIGN_UP_URL

# Copiar dependencias instaladas
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN pnpm run build

# ============================================
# Etapa de producción
# ============================================
FROM base AS runner

# Variables de entorno para producción
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 astro

# Copiar solo lo necesario para producción
COPY --from=builder --chown=astro:nodejs /app/dist ./dist
COPY --from=builder --chown=astro:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=astro:nodejs /app/package.json ./package.json

# Crear directorio para uploads y dar permisos
RUN mkdir -p ./dist/client/uploads/project ./dist/client/uploads/service && \
    chown -R astro:nodejs ./dist

# Cambiar a usuario no-root
USER astro

# Exponer puerto
EXPOSE 4321

# Comando de inicio
CMD ["node", "./dist/server/entry.mjs"]
