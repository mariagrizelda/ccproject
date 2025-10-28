#!/bin/bash
# filepath: /Users/helga/ccproject/Wed_2pm_Team_05/Code/demo-rolling-update.sh

set -e

PROJECT_ID="model-obelisk-469607-r0"
NAMESPACE="ccproject"
DEPLOYMENT="auth-svc"
IMAGE_V1="gcr.io/$PROJECT_ID/ccproject-backend:v1"
IMAGE_V2="gcr.io/$PROJECT_ID/ccproject-backend:v2"

kubectl get deployment $DEPLOYMENT -n $NAMESPACE
echo ""

kubectl get pods -n $NAMESPACE -l app=auth-svc -o wide
echo ""

kubectl get deployment $DEPLOYMENT -n $NAMESPACE -o jsonpath='{.spec.template.spec.containers[0].image}'
echo ""
echo ""

kubectl set image deployment/$DEPLOYMENT auth-svc=$IMAGE_V2 -n $NAMESPACE
echo ""

kubectl rollout status deployment/$DEPLOYMENT -n $NAMESPACE
echo ""

kubectl get pods -n $NAMESPACE -l app=auth-svc -o wide
echo ""

kubectl get deployment $DEPLOYMENT -n $NAMESPACE -o jsonpath='{.spec.template.spec.containers[0].image}'
echo ""
echo ""

kubectl rollout history deployment/$DEPLOYMENT -n $NAMESPACE
echo ""