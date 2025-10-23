#!/bin/bash

# Complete Live Demo: All Features
# Runs all demonstrations in sequence

set -e

echo "========================================="
echo "   COMPLETE KUBERNETES DEMONSTRATION"
echo "   Scalability, Reliability, Rollout & Rollback"
echo "========================================="
echo ""
echo "This will run 3 live demonstrations:"
echo "  1. Scalability & Load Balancing (5 min)"
echo "  2. Reliability & Self-Healing (3 min)"
echo "  3. Rollout & Rollback (5 min)"
echo ""
echo "Total estimated time: ~15 minutes"
echo ""
read -p "Press ENTER to start complete demo..."

# Demo 1: Scalability
echo ""
echo ""
echo "========================================="
echo "DEMO 1/3: SCALABILITY & LOAD BALANCING"
echo "========================================="
sleep 2
./demo-scalability.sh

echo ""
echo ""
read -p "Demo 1 complete. Press ENTER for Demo 2..."

# Demo 2: Reliability
echo ""
echo ""
echo "========================================="
echo "DEMO 2/3: RELIABILITY & SELF-HEALING"
echo "========================================="
sleep 2
./demo-reliability.sh

echo ""
echo ""
read -p "Demo 2 complete. Press ENTER for Demo 3..."

# Demo 3: Rollout & Rollback
echo ""
echo ""
echo "========================================="
echo "DEMO 3/3: ROLLOUT & ROLLBACK"
echo "========================================="
sleep 2
./demo-rollout-rollback.sh

# Final Summary
echo ""
echo ""
echo "========================================="
echo "   ✅ ALL DEMONSTRATIONS COMPLETE!"
echo "========================================="
echo ""
echo "Summary of Features Demonstrated:"
echo ""
echo "📈 SCALABILITY:"
echo "   ✓ Manual scaling (scale up/down on demand)"
echo "   ✓ Load balancing across multiple pods"
echo "   ✓ Zero downtime during scaling"
echo ""
echo "🛡️  RELIABILITY:"
echo "   ✓ Self-healing (automatic pod restart)"
echo "   ✓ Health checks (liveness & readiness probes)"
echo "   ✓ Service continuity during failures"
echo ""
echo "🔄 ROLLOUT & ROLLBACK:"
echo "   ✓ Zero-downtime rolling updates"
echo "   ✓ Gradual pod replacement"
echo "   ✓ Instant rollback capability"
echo "   ✓ Version history tracking"
echo ""
echo "Current Cluster Status:"
echo "========================================="
kubectl get all -n ccproject
echo ""
echo "External Access:"
EXTERNAL_IP=$(kubectl get svc nginx-service -n ccproject -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
if [ ! -z "$EXTERNAL_IP" ]; then
    echo "Application URL: http://${EXTERNAL_IP}"
fi
echo ""
echo "========================================="
