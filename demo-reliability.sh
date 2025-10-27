#!/bin/bash

# Demo: Self-Healing and High Availability
# This script demonstrates automatic pod recovery and zero downtime

set -e

NAMESPACE="ccproject"
DEPLOYMENT="auth-svc"

kubectl get deployment $DEPLOYMENT -n $NAMESPACE
echo ""

kubectl get pods -n $NAMESPACE -l app=auth-svc -o wide
echo ""

# Get one pod name
POD_NAME=$(kubectl get pods -n $NAMESPACE -l app=auth-svc -o jsonpath='{.items[0].metadata.name}')

echo "old pod deleted: $POD_NAME"
kubectl get pod $POD_NAME -n $NAMESPACE -o custom-columns=NAME:.metadata.name,STATUS:.status.phase,RESTARTS:.status.containerStatuses[0].restartCount,NODE:.spec.nodeName
echo ""

echo "simulating crash"
kubectl delete pod $POD_NAME -n $NAMESPACE
echo ""

kubectl get pods -n $NAMESPACE -l app=auth-svc
echo ""

sleep 3

kubectl get pods -n $NAMESPACE -l app=auth-svc -o wide
echo ""

kubectl wait --for=condition=ready pod -l app=auth-svc -n $NAMESPACE --timeout=120s
echo ""

kubectl get deployment $DEPLOYMENT -n $NAMESPACE
echo ""

kubectl get pods -n $NAMESPACE -l app=auth-svc -o wide
echo ""

# Get new pod name
NEW_POD_NAME=$(kubectl get pods -n $NAMESPACE -l app=auth-svc -o jsonpath='{.items[0].metadata.name}')

# Show that it's a different pod
echo "new pod created: $NEW_POD_NAME"
echo "old pod deleted: $POD_NAME"
echo ""

kubectl get endpoints auth-service -n $NAMESPACE
echo ""
