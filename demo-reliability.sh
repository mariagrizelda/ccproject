#!/bin/bash

# Live Demo: Reliability & Self-Healing
# Demonstrates pod auto-restart and health checks

set -e

NAMESPACE="ccproject"
SERVICE="courses-svc"

echo "========================================="
echo "   LIVE DEMO: RELIABILITY & SELF-HEALING"
echo "========================================="
echo ""
echo "This demo will show:"
echo "  1. Current running pods"
echo "  2. Simulating pod failure (deletion)"
echo "  3. Kubernetes auto-recovery"
echo "  4. Health checks in action"
echo "  5. Service continuity"
echo ""
read -p "Press ENTER to start..."

# Step 1: Show current status
echo ""
echo "========================================="
echo "STEP 1: Current Pod Status"
echo "========================================="
kubectl get pods -l app=${SERVICE} -n ${NAMESPACE} -o wide
echo ""
POD_COUNT=$(kubectl get pods -l app=${SERVICE} -n ${NAMESPACE} --no-headers | wc -l | tr -d ' ')
echo "Current replica count: ${POD_COUNT}"
echo ""
read -p "Press ENTER to simulate pod failure..."

# Step 2: Delete a pod
echo ""
echo "========================================="
echo "STEP 2: Simulating Pod Failure"
echo "========================================="

# Get first pod name
POD_NAME=$(kubectl get pods -l app=${SERVICE} -n ${NAMESPACE} -o jsonpath='{.items[0].metadata.name}')

echo "Deleting pod: ${POD_NAME}"
echo "Command: kubectl delete pod ${POD_NAME} -n ${NAMESPACE}"
kubectl delete pod ${POD_NAME} -n ${NAMESPACE} &

echo ""
echo "Watching Kubernetes auto-recovery..."
for i in {1..20}; do
    clear
    echo "========================================="
    echo "Self-Healing in Progress... ($i/20 seconds)"
    echo "========================================="
    echo ""
    kubectl get pods -l app=${SERVICE} -n ${NAMESPACE} -o wide
    echo ""
    CURRENT_COUNT=$(kubectl get pods -l app=${SERVICE} -n ${NAMESPACE} --field-selector=status.phase=Running --no-headers | wc -l | tr -d ' ')
    echo "Running pods: ${CURRENT_COUNT}/${POD_COUNT}"
    
    if [ "${CURRENT_COUNT}" -eq "${POD_COUNT}" ]; then
        echo ""
        echo "✅ All pods recovered!"
        break
    fi
    sleep 1
done

echo ""
echo "Final pod status:"
kubectl get pods -l app=${SERVICE} -n ${NAMESPACE} -o wide
echo ""
read -p "Press ENTER to check health status..."

# Step 3: Health Checks
echo ""
echo "========================================="
echo "STEP 3: Health Checks & Probes"
echo "========================================="

# Show pod details with health info
kubectl describe deployment ${SERVICE} -n ${NAMESPACE} | grep -A 10 "Liveness\|Readiness"

echo ""
echo "Current pod health status:"
kubectl get pods -l app=${SERVICE} -n ${NAMESPACE} -o custom-columns=NAME:.metadata.name,READY:.status.containerStatuses[0].ready,RESTARTS:.status.containerStatuses[0].restartCount,STATUS:.status.phase

echo ""
echo "========================================="
echo "STEP 4: Testing Service Continuity"
echo "========================================="

# Get service endpoint
EXTERNAL_IP=$(kubectl get svc nginx-service -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

if [ ! -z "$EXTERNAL_IP" ]; then
    echo "Testing service availability during recovery..."
    echo ""
    
    for i in {1..10}; do
        echo -n "Request $i: "
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://${EXTERNAL_IP}/api/courses/health/)
        if [ "$HTTP_CODE" == "200" ]; then
            echo "✓ Success (${HTTP_CODE})"
        else
            echo "✗ Failed (${HTTP_CODE})"
        fi
        sleep 1
    done
else
    echo "External IP not available - skipping service test"
fi

# Summary
echo ""
echo "========================================="
echo "✅ RELIABILITY DEMO COMPLETE!"
echo "========================================="
echo ""
echo "Key Points Demonstrated:"
echo "  ✓ Kubernetes automatically restarts failed pods"
echo "  ✓ Desired state (replica count) is maintained"
echo "  ✓ Liveness probes detect unhealthy containers"
echo "  ✓ Readiness probes prevent traffic to unready pods"
echo "  ✓ Service remains available during pod failures"
echo "  ✓ Load balancer routes around failed instances"
echo ""
echo "Try killing multiple pods:"
echo "  kubectl delete pod -l app=${SERVICE} -n ${NAMESPACE}"
echo ""
