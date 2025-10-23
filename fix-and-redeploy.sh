#!/bin/bash

# Fix and Redeploy Script
# Fixes configuration issues and redeploys all services

set -e

NAMESPACE="ccproject"
EXTERNAL_IP="34.129.147.19"

echo "========================================"
echo "Fixing Configuration Issues"
echo "========================================"

# Step 1: Update ConfigMap and Secrets
echo ""
echo "1️⃣ Updating ConfigMap and Secrets..."
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Step 2: Delete all deployments for fresh start (keeps MySQL)
echo ""
echo "2️⃣ Deleting all deployments..."
kubectl delete deployment --all -n $NAMESPACE

# Step 3: Wait for pods to terminate
echo ""
echo "3️⃣ Waiting for pods to terminate..."
sleep 15

# Step 4: Verify MySQL is still running
echo ""
echo "4️⃣ Checking MySQL status..."
kubectl get pods -l app=mysql -n $NAMESPACE
kubectl wait --for=condition=ready pod -l app=mysql -n $NAMESPACE --timeout=60s

# Step 5: Deploy Auth Service first and wait
echo ""
echo "5️⃣ Deploying Auth Service..."
kubectl apply -f k8s/auth-deployment.yaml

echo "   Waiting for Auth Service to be ready..."
sleep 30

# Check auth status
echo "   Auth Service status:"
kubectl get pods -l app=auth-svc -n $NAMESPACE

# Step 6: Deploy other backend services
echo ""
echo "6️⃣ Deploying other backend services..."
kubectl apply -f k8s/courses-deployment.yaml
kubectl apply -f k8s/catalog-deployment.yaml
kubectl apply -f k8s/planner-deployment.yaml

echo "   Waiting for backend services to initialize..."
sleep 45

# Step 7: Deploy Frontend
echo ""
echo "7️⃣ Deploying Frontend..."
kubectl apply -f k8s/frontend-deployment.yaml

sleep 15

# Step 8: Deploy Nginx
echo ""
echo "8️⃣ Deploying Nginx (Load Balancer)..."
kubectl apply -f k8s/nginx-deployment.yaml

sleep 10

# Step 9: Show deployment status
echo ""
echo "========================================"
echo "Deployment Status"
echo "========================================"
kubectl get all -n $NAMESPACE

echo ""
echo "========================================"
echo "Pod Details"
echo "========================================"
kubectl get pods -n $NAMESPACE -o wide

echo ""
echo "========================================"
echo "LoadBalancer IP"
echo "========================================"
echo "External IP: http://${EXTERNAL_IP}"

echo ""
echo "========================================"
echo "Checking Service Health"
echo "========================================"
echo ""
echo "Testing endpoints in 30 seconds..."
sleep 30

echo "Auth Service:"
kubectl exec -it -n $NAMESPACE $(kubectl get pod -n $NAMESPACE -l app=auth-svc -o jsonpath='{.items[0].metadata.name}') -- curl -s http://localhost:8001/api/auth/health/ || echo "Auth not ready yet"

echo ""
echo "========================================"
echo "Useful Commands:"
echo "========================================"
echo "Check pod logs:     kubectl logs -f <pod-name> -n ccproject"
echo "Check all pods:     kubectl get pods -n ccproject"
echo "Describe pod:       kubectl describe pod <pod-name> -n ccproject"
echo "Test LoadBalancer:  curl http://${EXTERNAL_IP}"
echo "Watch pods:         kubectl get pods -n ccproject -w"
echo "========================================"
