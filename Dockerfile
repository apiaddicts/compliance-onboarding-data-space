# ================================
# Stage 1: Build
# ================================
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

ENV VITE_API_BACK=VITE_API_BACK_VALUE
ENV VITE_CLIENT_ID_KONG=VITE_CLIENT_ID_KONG_VALUE
ENV VITE_CLIENT_SECRET_KONG=VITE_CLIENT_SECRET_KONG_VALUE
ENV VITE_COMPLIANCE_URL=VITE_COMPLIANCE_URL_VALUE

COPY . .

RUN npm run build

# ================================
# Stage 2: Production
# ================================
FROM nginx:stable-alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
