#!/bin/bash

echo "🔧 Fixing Frontend Build with NEXT_PUBLIC_API_URL"
echo "================================================"

# Build the frontend image with the correct API URL
docker build \
  --build-arg NEXT_PUBLIC_API_URL="http://34.126.201.251/api" \
  -t gcr.io/model-obelisk-469607-r0/ccproject-frontend:latest \
  ./frontend

# Push the updated image
docker push gcr.io/model-obelisk-469607-r0/ccproject-frontend:latest

echo "✅ Frontend image rebuilt and pushed"
echo "🔄 Restarting frontend pods..."

# Restart frontend deployment to use the new image
kubectl rollout restart deployment frontend -n ccproject

echo "⏳ Waiting for rollout to complete..."
kubectl rollout status deployment frontend -n ccproject

echo "✅ Frontend deployment updated!"
