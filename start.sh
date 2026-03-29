#!/bin/sh

# Backend (Spring Boot) - port 8081
java -jar /app/backend/app.jar --server.port=8081 --server.address=127.0.0.1 &

# Frontend (Next.js) - port $PORT
cd /app/frontend
PORT=${PORT:-8080} HOSTNAME=0.0.0.0 node server.js
