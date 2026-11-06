#!/bin/sh
# Tek konteynerde Spring Boot (127.0.0.1:8081) + Next.js ($PORT) çalıştırır.
set -eu

# Railway Postgres "DATABASE_URL=postgresql://kullanici:sifre@host:port/db" verir; Spring JDBC URL bekler.
if [ -z "${SPRING_DATASOURCE_URL:-}" ] && [ -n "${DATABASE_URL:-}" ]; then
  url_govde="${DATABASE_URL#*://}"
  kimlik="${url_govde%%@*}"
  adres="${url_govde#*@}"
  adres="${adres%%\?*}"
  export SPRING_DATASOURCE_URL="jdbc:postgresql://${adres}?stringtype=unspecified"
  export SPRING_DATASOURCE_USERNAME="${SPRING_DATASOURCE_USERNAME:-${kimlik%%:*}}"
  export SPRING_DATASOURCE_PASSWORD="${SPRING_DATASOURCE_PASSWORD:-${kimlik#*:}}"
fi

# Backend (Spring Boot) - yalnızca konteyner içinden erişilir
java ${JAVA_OPTS:--XX:MaxRAMPercentage=60 -XX:+ExitOnOutOfMemoryError} \
  -jar /app/backend/app.jar --server.port=8081 --server.address=127.0.0.1 &
BACKEND_PID=$!

# Frontend (Next.js) - Railway $PORT
cd /app/frontend
PORT=${PORT:-8080} HOSTNAME=0.0.0.0 node frontend/server.js &
FRONTEND_PID=$!

trap 'kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null' INT TERM

# Süreçlerden biri düşerse konteyner çıkar; Railway restart politikası yeniden başlatır.
while kill -0 "$BACKEND_PID" 2>/dev/null && kill -0 "$FRONTEND_PID" 2>/dev/null; do
  sleep 5
done
echo "Bir süreç sonlandı; konteyner kapatılıyor." >&2
kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
exit 1
