#!/bin/bash

echo "🔧 Fixing Docker and Kubernetes Deployment"
echo "=========================================="

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running or is paused"
    echo "Please unpause Docker Desktop first:"
    echo "1. Click the Docker whale icon in your menu bar"
    echo "2. Select 'Resume' or 'Unpause'"
    echo "3. Wait for Docker to start completely"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✅ Docker is running"

# Start minikube
echo "🚀 Starting minikube..."
minikube start

# Wait for minikube to be ready
echo "⏳ Waiting for minikube to be ready..."
kubectl wait --for=condition=Ready nodes --all --timeout=300s

# Apply all configurations
echo "📦 Deploying application..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/mysql.yaml

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
kubectl wait --for=condition=Ready pod -l app=mysql -n ccproject --timeout=300s

# Deploy services
kubectl apply -f k8s/auth-deployment.yaml
kubectl apply -f k8s/courses-deployment.yaml
kubectl apply -f k8s/catalog-deployment.yaml
kubectl apply -f k8s/planner-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/nginx-deployment.yaml

echo "✅ Deployment complete!"
echo ""
echo "🔍 Checking status..."
kubectl get pods -n ccproject

echo ""
echo "🌐 To access your application:"
echo "Run: minikube service nginx-service -n ccproject"
