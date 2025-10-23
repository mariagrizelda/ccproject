#!/bin/bash

echo "========================================="
echo "Kubernetes Configuration Update"
echo "========================================="
echo "This will:"
echo "  1. Update ConfigMap with new LoadBalancer IP"
echo "  2. Update NGINX config with dynamic DNS resolution"
echo "  3. Update Frontend with new LoadBalancer IP"
echo "  4. Delete ALL pods to force config reload"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi

echo ""
echo "========================================="
echo "Step 1: Applying Updated Configurations"
echo "========================================="

echo "✅ Applying updated ConfigMap..."
kubectl apply -f k8s/configmap.yaml

echo "✅ Applying updated NGINX configuration (with dynamic DNS)..."
kubectl apply -f k8s/nginx-deployment.yaml

echo "✅ Applying updated Frontend configuration..."
kubectl apply -f k8s/frontend-deployment.yaml

echo ""
echo "========================================="
echo "Step 2: Force Restarting All Pods"
echo "========================================="
echo "Deleting pods to pick up new ConfigMap values..."
echo ""

echo "🔄 Deleting NGINX pods..."
kubectl delete pods -n ccproject -l app=nginx

echo "🔄 Deleting Auth service pods..."
kubectl delete pods -n ccproject -l app=auth-svc

echo "🔄 Deleting Courses service pods..."
kubectl delete pods -n ccproject -l app=courses-svc

echo "🔄 Deleting Catalog service pods..."
kubectl delete pods -n ccproject -l app=catalog-svc

echo "🔄 Deleting Planner service pods..."
kubectl delete pods -n ccproject -l app=planner-svc

echo "🔄 Deleting Frontend pods..."
kubectl delete pods -n ccproject -l app=frontend

echo ""
echo "⏳ Waiting 15 seconds for pods to terminate and recreate..."
sleep 15

echo ""
echo "========================================="
echo "Current Pod Status:"
echo "========================================="
kubectl get pods -n ccproject

echo ""
echo "========================================="
echo "✅ Configuration Updated Successfully!"
echo "========================================="
echo ""
echo "📊 Monitor pod status:"
echo "  watch kubectl get pods -n ccproject"
echo ""
echo "🔍 Check LoadBalancer IP:"
echo "  kubectl get svc nginx-service -n ccproject"
echo ""
echo "🧪 Test endpoints once all pods are Ready:"
echo "  curl http://34.126.201.251/nginx-health"
echo "  curl http://34.126.201.251/api/auth/health/"
echo "  curl http://34.126.201.251/"
echo ""
echo "📋 Run diagnostics:"
echo "  ./diagnose-k8s.sh"
echo "========================================"
