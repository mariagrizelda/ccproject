#!/bin/bash

# Live Demo: Rollout & Rollback
# Demonstrates zero-downtime updates and rollback capability

set -e

NAMESPACE="ccproject"
SERVICE="planner-svc"

echo "========================================="
echo "   LIVE DEMO: ROLLOUT & ROLLBACK"
echo "========================================="
echo ""
echo "This demo will show:"
echo "  1. Current deployment version"
echo "  2. Rolling update to new version"
echo "  3. Zero-downtime deployment"
echo "  4. Rollback to previous version"
echo "  5. Version history tracking"
echo ""
read -p "Press ENTER to start..."

# Step 1: Current status
echo ""
echo "========================================="
echo "STEP 1: Current Deployment Status"
echo "========================================="
kubectl get deployment ${SERVICE} -n ${NAMESPACE}
echo ""
echo "Current pods:"
kubectl get pods -l app=${SERVICE} -n ${NAMESPACE} -o wide
echo ""
echo "Rollout history:"
kubectl rollout history deployment/${SERVICE} -n ${NAMESPACE}
echo ""
read -p "Press ENTER to perform rolling update..."

# Step 2: Rolling Update
echo ""
echo "========================================="
echo "STEP 2: Performing Rolling Update"
echo "========================================="

# Record current revision
CURRENT_REVISION=$(kubectl rollout history deployment/${SERVICE} -n ${NAMESPACE} | tail -1 | awk '{print $1}')

echo "Updating deployment to simulate new version (v2)..."
echo "Command: kubectl patch deployment ${SERVICE} -n ${NAMESPACE}"
echo ""

# Update with new annotation to trigger rollout
kubectl patch deployment ${SERVICE} -n ${NAMESPACE} -p \
  "{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"version\":\"v2\",\"updated-at\":\"$(date +%s)\"}}}}}"

echo ""
echo "Watching rolling update progress..."
echo "Old pods will be replaced with new ones gradually..."
echo ""

# Watch the rollout
for i in {1..30}; do
    clear
    echo "========================================="
    echo "Rolling Update in Progress... ($i/30 seconds)"
    echo "========================================="
    echo ""
    kubectl get pods -l app=${SERVICE} -n ${NAMESPACE} -o wide
    echo ""
    echo "Deployment status:"
    kubectl rollout status deployment/${SERVICE} -n ${NAMESPACE} --timeout=1s 2>&1 | head -3
    
    # Check if rollout is complete
    if kubectl rollout status deployment/${SERVICE} -n ${NAMESPACE} --timeout=1s 2>&1 | grep -q "successfully rolled out"; then
        echo ""
        echo "✅ Rollout complete!"
        break
    fi
    sleep 1
done

echo ""
echo "New pod status:"
kubectl get pods -l app=${SERVICE} -n ${NAMESPACE} -o wide
echo ""
echo "Updated rollout history:"
kubectl rollout history deployment/${SERVICE} -n ${NAMESPACE}
echo ""
read -p "Press ENTER to test service during rollout..."

# Step 3: Service Availability
echo ""
echo "========================================="
echo "STEP 3: Verify Zero-Downtime"
echo "========================================="

EXTERNAL_IP=$(kubectl get svc nginx-service -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

if [ ! -z "$EXTERNAL_IP" ]; then
    echo "Testing service availability..."
    echo ""
    
    SUCCESS=0
    FAILED=0
    
    for i in {1..10}; do
        echo -n "Request $i: "
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://${EXTERNAL_IP}/api/planned-courses/health/)
        if [ "$HTTP_CODE" == "200" ]; then
            echo "✓ Success (${HTTP_CODE})"
            ((SUCCESS++))
        else
            echo "✗ Failed (${HTTP_CODE})"
            ((FAILED++))
        fi
        sleep 0.5
    done
    
    echo ""
    echo "Results: ${SUCCESS} successful, ${FAILED} failed"
    
    if [ $FAILED -eq 0 ]; then
        echo "✅ Zero downtime achieved!"
    fi
else
    echo "External IP not available - skipping availability test"
fi

echo ""
read -p "Press ENTER to simulate rollback..."

# Step 4: Rollback
echo ""
echo "========================================="
echo "STEP 4: Rolling Back to Previous Version"
echo "========================================="

echo "Simulating problematic deployment - rolling back..."
echo "Command: kubectl rollout undo deployment/${SERVICE} -n ${NAMESPACE}"
echo ""

kubectl rollout undo deployment/${SERVICE} -n ${NAMESPACE}

echo "Watching rollback progress..."
for i in {1..30}; do
    clear
    echo "========================================="
    echo "Rollback in Progress... ($i/30 seconds)"
    echo "========================================="
    echo ""
    kubectl get pods -l app=${SERVICE} -n ${NAMESPACE} -o wide
    echo ""
    echo "Rollback status:"
    kubectl rollout status deployment/${SERVICE} -n ${NAMESPACE} --timeout=1s 2>&1 | head -3
    
    # Check if rollback is complete
    if kubectl rollout status deployment/${SERVICE} -n ${NAMESPACE} --timeout=1s 2>&1 | grep -q "successfully rolled out"; then
        echo ""
        echo "✅ Rollback complete!"
        break
    fi
    sleep 1
done

echo ""
echo "Final pod status after rollback:"
kubectl get pods -l app=${SERVICE} -n ${NAMESPACE} -o wide
echo ""
echo "Updated rollout history:"
kubectl rollout history deployment/${SERVICE} -n ${NAMESPACE}

# Summary
echo ""
echo "========================================="
echo "✅ ROLLOUT & ROLLBACK DEMO COMPLETE!"
echo "========================================="
echo ""
echo "Key Points Demonstrated:"
echo "  ✓ Rolling updates replace pods gradually"
echo "  ✓ Zero downtime during deployment"
echo "  ✓ Old pods remain until new ones are ready"
echo "  ✓ Instant rollback capability"
echo "  ✓ Version history is tracked"
echo "  ✓ RollingUpdate strategy: maxSurge=1, maxUnavailable=0"
echo ""
echo "Advanced rollback commands:"
echo "  kubectl rollout undo deployment/${SERVICE} --to-revision=<N> -n ${NAMESPACE}"
echo "  kubectl rollout pause deployment/${SERVICE} -n ${NAMESPACE}"
echo "  kubectl rollout resume deployment/${SERVICE} -n ${NAMESPACE}"
echo ""
