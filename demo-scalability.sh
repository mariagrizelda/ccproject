#!/bin/bash
set -e

NAMESPACE="ccproject"
DEPLOYMENT="catalog-svc"
INITIAL_REPLICAS=2
SCALED_REPLICAS=5

kubectl get deployment $DEPLOYMENT -n $NAMESPACE
echo ""

kubectl get pods -n $NAMESPACE -l app=catalog-svc -o wide
echo ""

kubectl top pods -n $NAMESPACE -l app=catalog-svc 2>/dev/null || echo "Metrics not available yet"
echo ""

read -p "Press Enter to scale up to $SCALED_REPLICAS replicas..."
echo ""

kubectl scale deployment/$DEPLOYMENT --replicas=$SCALED_REPLICAS -n $NAMESPACE
echo ""

kubectl wait --for=condition=ready pod -l app=catalog-svc -n $NAMESPACE --timeout=120s
echo ""


kubectl get deployment $DEPLOYMENT -n $NAMESPACE
echo ""

kubectl get pods -n $NAMESPACE -l app=catalog-svc -o wide
echo ""

kubectl get endpoints catalog-service -n $NAMESPACE
echo ""


# Prompt for scale down
read -p "Press Enter to scale back down to $INITIAL_REPLICAS replicas..."
echo ""

# Scale down
