#!/bin/sh

# Backend (Spring Boot) - port 8080
java -jar /app/backend/app.jar --server.port=8080 &

# Frontend (Next.js) - port 3000
cd /app/frontend
PORT=3000 HOSTNAME=0.0.0.0 node server.js
