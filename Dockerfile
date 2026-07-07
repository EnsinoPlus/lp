# Easypanel / Docker: build injeta VITE_* no bundle; o runtime é o worker TanStack Start via Wrangler.
# No painel, defina as mesmas variáveis no passo de build (Build Args / env do build), não só em runtime.

FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_CHECKOUT_URL
ARG VITE_PONTO_MAGICO_SIGNUP_URL
ARG VITE_PONTO_MAGICO_APP_URL
ARG VITE_SUITEPLUS_CREDITS_CHECKOUT_URL
ARG VITE_GTM_ID
ENV VITE_CHECKOUT_URL=$VITE_CHECKOUT_URL
ENV VITE_PONTO_MAGICO_SIGNUP_URL=$VITE_PONTO_MAGICO_SIGNUP_URL
ENV VITE_PONTO_MAGICO_APP_URL=$VITE_PONTO_MAGICO_APP_URL
ENV VITE_SUITEPLUS_CREDITS_CHECKOUT_URL=$VITE_SUITEPLUS_CREDITS_CHECKOUT_URL
ENV VITE_GTM_ID=$VITE_GTM_ID

RUN npm run build

FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --include=optional

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8787

EXPOSE 8787

# Easypanel costuma definir PORT; mapeie a porta publicada para a mesma.
CMD ["npm", "start"]
