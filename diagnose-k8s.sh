#!/bin/bash

# Diagnostic Script - Check all issues
# Run this to see what's causing problems

NAMESPACE="ccproject"

echo "========================================"
echo "Kubernetes Diagnostic Report"
echo "========================================"
echo ""

echo "1️⃣ Pod Status"
echo "========================================" 
kubectl get pods -n $NAMESPACE
echo ""

echo "2️⃣ Services"
echo "========================================"
kubectl get svc -n $NAMESPACE
echo ""

echo "3️⃣ ConfigMaps"
echo "========================================"
kubectl get configmap ccproject-config -n $NAMESPACE -o yaml | grep -A 10 "data:"
echo ""

echo "4️⃣ Secrets (keys only)"
echo "========================================"
kubectl get secret ccproject-secrets -n $NAMESPACE -o jsonpath='{.data}' | jq 'keys'
echo ""

echo "5️⃣ Auth Service Logs"
echo "========================================"
AUTH_POD=$(kubectl get pod -n $NAMESPACE -l app=auth-svc -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$AUTH_POD" ]; then
    echo "Pod: $AUTH_POD"
    kubectl logs $AUTH_POD -n $NAMESPACE --tail=30
else
    echo "No auth pods found"
fi
echo ""

echo "6️⃣ Catalog Init Container Logs"
echo "========================================"
CATALOG_POD=$(kubectl get pod -n $NAMESPACE -l app=catalog-svc -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$CATALOG_POD" ]; then
    echo "Pod: $CATALOG_POD"
    echo "wait-for-mysql:"
    kubectl logs $CATALOG_POD -n $NAMESPACE -c wait-for-mysql 2>/dev/null || echo "Container not started"
    echo ""
    echo "wait-for-auth:"
    kubectl logs $CATALOG_POD -n $NAMESPACE -c wait-for-auth 2>/dev/null || echo "Container not started"
else
    echo "No catalog pods found"
fi
echo ""

echo "7️⃣ Frontend Logs"
echo "========================================"
FRONTEND_POD=$(kubectl get pod -n $NAMESPACE -l app=frontend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$FRONTEND_POD" ]; then
    echo "Pod: $FRONTEND_POD"
    kubectl logs $FRONTEND_POD -n $NAMESPACE --tail=30
else
    echo "No frontend pods found"
fi
echo ""

echo "8️⃣ Nginx Logs"
echo "========================================"
NGINX_POD=$(kubectl get pod -n $NAMESPACE -l app=nginx -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$NGINX_POD" ]; then
    echo "Pod: $NGINX_POD"
    kubectl logs $NGINX_POD -n $NAMESPACE --tail=30
else
    echo "No nginx pods found"
fi
echo ""

echo "9️⃣ Recent Events"
echo "========================================"
kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp' | tail -20
echo ""

echo "🔟 Pod Describe (Auth)"
echo "========================================"
if [ -n "$AUTH_POD" ]; then
    kubectl describe pod $AUTH_POD -n $NAMESPACE | grep -A 20 "Events:"
fi
echo ""

echo "========================================"
echo "Summary"
echo "========================================"
echo "Total Pods: $(kubectl get pods -n $NAMESPACE --no-headers | wc -l)"
echo "Running Pods: $(kubectl get pods -n $NAMESPACE --no-headers | grep Running | wc -l)"
echo "Pending Pods: $(kubectl get pods -n $NAMESPACE --no-headers | grep -E 'Pending|Init' | wc -l)"
echo "Failed Pods: $(kubectl get pods -n $NAMESPACE --no-headers | grep -E 'CrashLoop|Error' | wc -l)"
echo ""
echo "LoadBalancer IP: $(kubectl get svc nginx-service -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}')"
echo "========================================"
