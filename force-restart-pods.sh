#!/bin/bash

echo "========================================="
echo "Force Restarting All Pods"
echo "========================================="
echo "This will delete ALL pods to pick up the updated ConfigMap"
echo ""

# Delete all pods in the ccproject namespace (except mysql)
# They will be automatically recreated by their deployments

echo "🔄 Deleting NGINX pods (to reload config)..."
kubectl delete pods -n ccproject -l app=nginx

echo "🔄 Deleting Auth service pods (to reload ALLOWED_HOSTS)..."
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
echo "⏳ Waiting 10 seconds for pods to terminate..."
sleep 10

echo ""
echo "========================================="
echo "Current Pod Status:"
echo "========================================="
kubectl get pods -n ccproject

echo ""
echo "========================================="
echo "✅ All pods deleted and recreating!"
echo ""
echo "Monitor the rollout with:"
echo "  watch kubectl get pods -n ccproject"
echo ""
echo "Wait for all pods to show READY 1/1"
echo "Then test: curl http://34.126.201.251/nginx-health"
echo "========================================="
