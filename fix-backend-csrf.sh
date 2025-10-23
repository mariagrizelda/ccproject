#!/bin/bash

echo "🔧 Fixing Backend CSRF Issues for Health Checks"
echo "==============================================="

# Build the backend image with CSRF fixes
docker build -t gcr.io/model-obelisk-469607-r0/ccproject-backend:latest ./backend

# Push the updated image
docker push gcr.io/model-obelisk-469607-r0/ccproject-backend:latest

echo "✅ Backend image rebuilt and pushed with CSRF fixes"
echo "🔄 Updating deployments to use HTTP health checks..."

# Update all deployments to use HTTP health checks
kubectl apply -f k8s/auth-deployment.yaml
kubectl apply -f k8s/catalog-deployment.yaml  
kubectl apply -f k8s/courses-deployment.yaml
kubectl apply -f k8s/planner-deployment.yaml

echo "⏳ Waiting for deployments to update..."
kubectl rollout status deployment auth-svc -n ccproject
kubectl rollout status deployment catalog-svc -n ccproject
kubectl rollout status deployment courses-svc -n ccproject
kubectl rollout status deployment planner-svc -n ccproject

echo "✅ All deployments updated with HTTP health checks!"
