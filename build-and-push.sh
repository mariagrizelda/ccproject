#!/bin/bash

# Build and Push Docker Images to Google Container Registry
# Usage: ./build-and-push.sh <GCP_PROJECT_ID>

set -e

if [ -z "$1" ]; then
    echo "Usage: ./build-and-push.sh <GCP_PROJECT_ID>"
    exit 1
fi

GCP_PROJECT_ID=$1
BACKEND_IMAGE="gcr.io/${GCP_PROJECT_ID}/ccproject-backend"
FRONTEND_IMAGE="gcr.io/${GCP_PROJECT_ID}/ccproject-frontend"

echo "========================================"
echo "Building and Pushing Docker Images"
echo "GCP Project ID: ${GCP_PROJECT_ID}"
echo "========================================"

# Configure Docker to use gcloud as credential helper
echo "Configuring Docker authentication..."
gcloud auth configure-docker

# Build Backend Image
echo ""
echo "Building backend image..."
docker build -t ${BACKEND_IMAGE}:latest ./backend
docker tag ${BACKEND_IMAGE}:latest ${BACKEND_IMAGE}:v1

# Build Frontend Image
echo ""
echo "Building frontend image..."
docker build -t ${FRONTEND_IMAGE}:latest \
  --build-arg NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost/api} \
  ./frontend
docker tag ${FRONTEND_IMAGE}:latest ${FRONTEND_IMAGE}:v1

# Push images
echo ""
echo "Pushing backend image to GCR..."
docker push ${BACKEND_IMAGE}:latest
docker push ${BACKEND_IMAGE}:v1

echo ""
echo "Pushing frontend image to GCR..."
docker push ${FRONTEND_IMAGE}:latest
docker push ${FRONTEND_IMAGE}:v1

echo ""
echo "========================================"
echo "✅ Images successfully built and pushed!"
echo "Backend: ${BACKEND_IMAGE}:latest"
echo "Frontend: ${FRONTEND_IMAGE}:latest"
echo "========================================"
