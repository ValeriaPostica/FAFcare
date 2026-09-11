FROM node:22-alpine AS build

WORKDIR /app
ENV NODE_ENV=development

COPY package*.json ./
RUN npm ci --include=dev --production=false

COPY . .
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80