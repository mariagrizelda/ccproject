#!/bin/bash

# Live Demo: Manual Scaling & Load Balancing
# Demonstrates scaling deployments and load distribution

set -e

NAMESPACE="ccproject"
SERVICE="auth-svc"

echo "========================================="
echo "   LIVE DEMO: SCALABILITY & LOAD BALANCING"
echo "========================================="
echo ""
echo "This demo will show:"
echo "  1. Current pod status"
echo "  2. Scaling UP (2 -> 5 replicas)"
echo "  3. Load balancing across pods"
echo "  4. Scaling DOWN (5 -> 2 replicas)"
echo "  5. Zero-downtime operation"
echo ""
read -p "Press ENTER to start..."

# Step 1: Show current status
echo ""
echo "========================================="
echo "STEP 1: Current Deployment Status"
echo "========================================="
kubectl get deployment ${SERVICE} -n ${NAMESPACE}
echo ""
echo "Current pods:"
kubectl get pods -l app=${SERVICE} -n ${NAMESPACE} -o wide
echo ""
read -p "Press ENTER to scale UP..."

# Step 2: Scale UP
echo ""
echo "========================================="
echo "STEP 2: Scaling UP to 5 replicas"
echo "========================================="
echo "Command: kubectl scale deployment ${SERVICE} --replicas=5 -n ${NAMESPACE}"
kubectl scale deployment ${SERVICE} --replicas=5 -n ${NAMESPACE}

echo ""
echo "Watching pods being created..."
for i in {1..15}; do
    clear
    echo "========================================="
    echo "Scaling in Progress... ($i/15 seconds)"
    echo "========================================="
    kubectl get pods -l app=${SERVICE} -n ${NAMESPACE} -o wide
    sleep 1
done

echo ""
echo "Final pod count after scale-up:"
kubectl get pods -l app=${SERVICE} -n ${NAMESPACE} -o wide
echo ""
echo "Deployment status:"
kubectl get deployment ${SERVICE} -n ${NAMESPACE}
echo ""
read -p "Press ENTER to test load balancing..."

# Step 3: Load Balancing Demo
echo ""
echo "========================================="
echo "STEP 3: Load Balancing Demonstration"
echo "========================================="

# Get service endpoint
EXTERNAL_IP=$(kubectl get svc nginx-service -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

if [ -z "$EXTERNAL_IP" ]; then
    echo "⚠️  External IP not found. Using port-forward instead..."
    kubectl port-forward svc/nginx-service -n ${NAMESPACE} 8080:80 &
    PF_PID=$!
    sleep 3
    ENDPOINT="localhost:8080"
else
    ENDPOINT="${EXTERNAL_IP}"
fi

echo "Testing endpoint: http://${ENDPOINT}/api/auth/health/"
echo ""
echo "Sending 20 requests to demonstrate load distribution..."
echo ""

for i in {1..20}; do
    echo -n "Request $i: "
    curl -s http://${ENDPOINT}/api/auth/health/ -w " (Time: %{time_total}s)\n" || echo "Request failed"
    sleep 0.5
done

# Kill port-forward if used
if [ ! -z "$PF_PID" ]; then
    kill $PF_PID 2>/dev/null || true
fi

echo ""
echo "Check pod logs to see requests distributed across multiple pods:"
echo "kubectl logs -l app=${SERVICE} -n ${NAMESPACE} --tail=5"
echo ""
read -p "Press ENTER to scale DOWN..."

# Step 4: Scale DOWN
echo ""
echo "========================================="
echo "STEP 4: Scaling DOWN to 2 replicas"
echo "========================================="
echo "Command: kubectl scale deployment ${SERVICE} --replicas=2 -n ${NAMESPACE}"
kubectl scale deployment ${SERVICE} --replicas=2 -n ${NAMESPACE}

echo ""
echo "Watching pods being terminated..."
for i in {1..10}; do
    clear
    echo "========================================="
    echo "Scaling Down... ($i/10 seconds)"
    echo "========================================="
    kubectl get pods -l app=${SERVICE} -n ${NAMESPACE} -o wide
    sleep 1
done

echo ""
echo "Final status after scale-down:"
kubectl get deployment ${SERVICE} -n ${NAMESPACE}
kubectl get pods -l app=${SERVICE} -n ${NAMESPACE} -o wide

# Summary
echo ""
echo "========================================="
echo "✅ SCALABILITY DEMO COMPLETE!"
echo "========================================="
echo ""
echo "Key Points Demonstrated:"
echo "  ✓ Manual scaling (2 -> 5 -> 2 replicas)"
echo "  ✓ Kubernetes automatically manages pod lifecycle"
echo "  ✓ Load balancer distributes traffic across all pods"
echo "  ✓ Zero downtime during scaling operations"
echo "  ✓ Service discovery works automatically"
echo ""
echo "Try scaling other services:"
echo "  kubectl scale deployment courses-svc --replicas=3 -n ${NAMESPACE}"
echo "  kubectl scale deployment frontend --replicas=4 -n ${NAMESPACE}"
echo ""
