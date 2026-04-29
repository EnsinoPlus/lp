FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=80

EXPOSE 80

CMD ["sh", "-c", "npm run dev -- --host ${HOST} --port ${PORT} --strictPort"]
