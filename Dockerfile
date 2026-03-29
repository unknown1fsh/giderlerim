# === Stage 1: Backend Build ===
FROM eclipse-temurin:17-jdk-alpine AS backend-build

WORKDIR /app

COPY backend/pom.xml .
COPY backend/src ./src

RUN apk add --no-cache maven && \
    mvn --no-transfer-progress -DskipTests package

# === Stage 2: Frontend Build ===
FROM node:20-alpine AS frontend-build

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .

ENV NEXT_PUBLIC_API_URL=""
RUN npm run build

# === Stage 3: Runtime ===
FROM node:20-alpine

RUN apk add --no-cache openjdk17-jre-headless

WORKDIR /app

# Backend JAR
COPY --from=backend-build /app/target/*.jar /app/backend/app.jar

# Frontend standalone
COPY --from=frontend-build /app/.next/standalone /app/frontend
COPY --from=frontend-build /app/.next/static /app/frontend/.next/static
COPY --from=frontend-build /app/public /app/frontend/public

# Start script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 3000

CMD ["/app/start.sh"]
