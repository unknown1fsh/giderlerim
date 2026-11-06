# === Stage 1: Backend Build ===
FROM eclipse-temurin:17-jdk-alpine AS backend-build

WORKDIR /app

COPY backend/pom.xml .
COPY backend/src ./src

RUN apk add --no-cache maven && \
    mvn --no-transfer-progress -DskipTests package

# === Stage 2: Frontend Build ===
FROM node:20-alpine AS frontend-build

WORKDIR /repo

# Workspace manifestlerini önce kopyalamak bağımlılık katmanını önbelleklenebilir tutar.
COPY package.json package-lock.json .npmrc ./
COPY frontend/package.json ./frontend/package.json
COPY mobile/package.json ./mobile/package.json
COPY packages/shared/package.json ./packages/shared/package.json
RUN npm ci

COPY frontend ./frontend
COPY packages/shared ./packages/shared

# Railway "Build" aşamasında değişken olarak verin (metadata / canonical URL).
ARG NEXT_PUBLIC_SITE_URL=https://giderlerim.net
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
# Boş değer tarayıcının aynı origin'i kullanmasını sağlar; /api istekleri Spring'e yönlenir.
ARG NEXT_PUBLIC_API_URL=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# Plan sayfasındaki Shopier ödeme linkleri build sırasında pakete gömülür.
ARG NEXT_PUBLIC_SHOPIER_PRO_AYLIK=
ARG NEXT_PUBLIC_SHOPIER_PRO_YILLIK=
ARG NEXT_PUBLIC_SHOPIER_ULTRA_AYLIK=
ARG NEXT_PUBLIC_SHOPIER_ULTRA_YILLIK=
ENV NEXT_PUBLIC_SHOPIER_PRO_AYLIK=$NEXT_PUBLIC_SHOPIER_PRO_AYLIK \
    NEXT_PUBLIC_SHOPIER_PRO_YILLIK=$NEXT_PUBLIC_SHOPIER_PRO_YILLIK \
    NEXT_PUBLIC_SHOPIER_ULTRA_AYLIK=$NEXT_PUBLIC_SHOPIER_ULTRA_AYLIK \
    NEXT_PUBLIC_SHOPIER_ULTRA_YILLIK=$NEXT_PUBLIC_SHOPIER_ULTRA_YILLIK
RUN npm run build --workspace giderlerim-web

# === Stage 3: Runtime ===
FROM node:20-alpine

RUN apk add --no-cache openjdk17-jre-headless

WORKDIR /app

COPY --from=backend-build /app/target/*.jar /app/backend/app.jar
COPY --from=frontend-build /repo/frontend/.next/standalone /app/frontend
COPY --from=frontend-build /repo/frontend/.next/static /app/frontend/frontend/.next/static
COPY --from=frontend-build /repo/frontend/public /app/frontend/frontend/public

COPY start.sh /app/start.sh
# Windows'tan yüklenen CRLF satır sonları Alpine sh'yi kırar.
RUN sed -i 's/\r$//' /app/start.sh && chmod +x /app/start.sh

EXPOSE 8080

CMD ["/app/start.sh"]
