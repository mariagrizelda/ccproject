#!/bin/bash

echo "========================================="
echo "Updating Kubernetes Configuration"
echo "========================================="

# Update ConfigMap with new LoadBalancer IP and relaxed ALLOWED_HOSTS
echo "✅ Applying updated ConfigMap..."
kubectl apply -f k8s/configmap.yaml

# Update NGINX with health endpoint
echo "✅ Applying updated NGINX configuration..."
kubectl apply -f k8s/nginx-deployment.yaml

# Update Frontend with new LoadBalancer IP
echo "✅ Applying updated Frontend configuration..."
kubectl apply -f k8s/frontend-deployment.yaml

# Restart all deployments to pick up new config
echo ""
echo "========================================="
echo "Restarting Deployments"
echo "========================================="

echo "🔄 Restarting auth-svc..."
kubectl rollout restart deployment/auth-svc -n ccproject

echo "🔄 Restarting courses-svc..."
kubectl rollout restart deployment/courses-svc -n ccproject

echo "🔄 Restarting catalog-svc..."
kubectl rollout restart deployment/catalog-svc -n ccproject

echo "🔄 Restarting planner-svc..."
kubectl rollout restart deployment/planner-svc -n ccproject

echo "🔄 Restarting frontend..."
kubectl rollout restart deployment/frontend -n ccproject

echo "🔄 Restarting nginx..."
kubectl rollout restart deployment/nginx -n ccproject

echo ""
echo "========================================="
echo "Waiting for deployments to stabilize..."
echo "========================================="

sleep 10

echo ""
kubectl get pods -n ccproject

echo ""
echo "========================================="
echo "✅ Configuration updated and deployments restarted!"
echo ""
echo "Monitor the rollout with:"
echo "  watch kubectl get pods -n ccproject"
echo ""
echo "Check status with:"
echo "  kubectl get svc nginx-service -n ccproject"
echo "========================================="
