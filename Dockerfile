# === Stage 1: Backend Build ===
FROM eclipse-temurin:17-jdk-alpine AS backend-build

WORKDIR /app

COPY backend/pom.xml .
COPY backend/src ./src

RUN apk add --no-cache maven && \
    mvn --no-transfer-progress -DskipTests package

# === Stage 2: Frontend Build ===
# Monorepo düzeni: Next.js Turbopack yalnızca proje kökü altını çözer; frontend ile packages/shared aynı üst dizinde olmalı.
FROM node:20-alpine AS frontend-build

WORKDIR /repo

# Shared kaynak kopyalanır; node_modules kurulmaz — tüm bağımlılıklar frontend/node_modules'dan çözümlenir.
COPY packages/shared ./packages/shared/
RUN rm -rf /repo/packages/shared/node_modules

COPY frontend/package*.json ./frontend/
WORKDIR /repo/frontend
# postinstall sadece package*.json varken çalışır; scripts/ henüz yok. Shared zaten yukarıda kuruldu.
RUN npm ci --ignore-scripts

COPY frontend/ .

# Railway "Build" aşamasında değişken olarak verin (metadata / canonical URL)
ARG NEXT_PUBLIC_SITE_URL=https://giderlerim.net
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
# Boş = tarayıcı aynı origin; Next.js /api/* → Spring proxy (start.sh + next.config rewrites)
ARG NEXT_PUBLIC_API_URL=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# === Stage 3: Runtime ===
FROM node:20-alpine

RUN apk add --no-cache openjdk17-jre-headless

WORKDIR /app

# Backend JAR
COPY --from=backend-build /app/target/*.jar /app/backend/app.jar

# Frontend standalone (monorepo izlemede çıktı: .next/standalone/<paket-adı>/)
COPY --from=frontend-build /repo/frontend/.next/standalone/frontend /app/frontend
COPY --from=frontend-build /repo/frontend/.next/static /app/frontend/.next/static
COPY --from=frontend-build /repo/frontend/public /app/frontend/public

# Start script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 8080

CMD ["/app/start.sh"]
