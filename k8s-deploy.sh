#!/bin/bash

# Deploy application to Kubernetes
# Usage: ./k8s-deploy.sh

set -e

echo "========================================"
echo "Deploying CCProject to Kubernetes"
echo "========================================"

# Create namespace
echo ""
echo "Creating namespace..."
kubectl apply -f k8s/namespace.yaml

# Apply ConfigMaps and Secrets
echo ""
echo "Applying ConfigMaps and Secrets..."
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Deploy MySQL
echo ""
echo "Deploying MySQL database..."
kubectl apply -f k8s/mysql.yaml

# Wait for MySQL to be ready
echo ""
echo "Waiting for MySQL to be ready..."
kubectl wait --for=condition=ready pod -l app=mysql -n ccproject --timeout=300s

# Deploy backend services
echo ""
echo "Deploying Auth Service..."
kubectl apply -f k8s/auth-deployment.yaml

echo ""
echo "Deploying Courses Service..."
kubectl apply -f k8s/courses-deployment.yaml

echo ""
echo "Deploying Catalog Service..."
kubectl apply -f k8s/catalog-deployment.yaml

echo ""
echo "Deploying Planner Service..."
kubectl apply -f k8s/planner-deployment.yaml

# Deploy frontend
echo ""
echo "Deploying Frontend..."
kubectl apply -f k8s/frontend-deployment.yaml

# Deploy Nginx
echo ""
echo "Deploying Nginx (Load Balancer)..."
kubectl apply -f k8s/nginx-deployment.yaml

# Show deployment status
echo ""
echo "========================================"
echo "Deployment Status"
echo "========================================"
kubectl get all -n ccproject

# Get LoadBalancer IP
echo ""
echo "========================================"
echo "Getting LoadBalancer External IP..."
echo "========================================"
echo "Waiting for external IP to be assigned..."
sleep 10

EXTERNAL_IP=$(kubectl get svc nginx-service -n ccproject -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

if [ -z "$EXTERNAL_IP" ]; then
    echo "⚠️  External IP not yet assigned. Run this command to check:"
    echo "kubectl get svc nginx-service -n ccproject"
else
    echo "✅ Application deployed successfully!"
    echo ""
    echo "Access your application at: http://${EXTERNAL_IP}"
fi

echo ""
echo "========================================"
echo "Useful Commands:"
echo "========================================"
echo "Monitor deployments: kubectl get deployments -n ccproject"
echo "View pods:          kubectl get pods -n ccproject"
echo "View services:      kubectl get svc -n ccproject"
echo "View logs:          kubectl logs -f deployment/<service-name> -n ccproject"
echo "Scale manually:     kubectl scale deployment <name> --replicas=<count> -n ccproject"
echo "========================================"
