# Easypanel / Docker: VITE_* de build (GTM etc.) ainda vão no estágio builder.
# URLs de checkout da promo são lidas em RUNTIME (env do container) via entrypoint + server fn.
# No Easypanel: defina VITE_SUITEPLUS_CREDITS_CHECKOUT_URL (ou SUITEPLUS_CREDITS_CHECKOUT_URL)
# nas variáveis de ambiente do serviço e reinicie — sem rebuild.

FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_CHECKOUT_URL
ARG VITE_PONTO_MAGICO_SIGNUP_URL
ARG VITE_PONTO_MAGICO_APP_URL
ARG VITE_GTM_ID
ENV VITE_CHECKOUT_URL=$VITE_CHECKOUT_URL
ENV VITE_PONTO_MAGICO_SIGNUP_URL=$VITE_PONTO_MAGICO_SIGNUP_URL
ENV VITE_PONTO_MAGICO_APP_URL=$VITE_PONTO_MAGICO_APP_URL
ENV VITE_GTM_ID=$VITE_GTM_ID

RUN npm run build

FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --include=optional

COPY --from=builder /app/dist ./dist
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8787

EXPOSE 8787

# Easypanel costuma definir PORT; mapeie a porta publicada para a mesma.
ENTRYPOINT ["/app/docker-entrypoint.sh"]
