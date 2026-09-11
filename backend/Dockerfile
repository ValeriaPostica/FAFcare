FROM node:22-alpine

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/ .
COPY data/ /app/data/

ENV NODE_ENV=production
EXPOSE 5000

CMD ["sh", "-c", "npm run seed && npm start"]