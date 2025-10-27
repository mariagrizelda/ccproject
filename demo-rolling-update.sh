#!/bin/bash
set -e

NAMESPACE="ccproject"
DEPLOYMENT="auth-svc"
IMAGE_V1="gcr.io/model-obelisk-469607-r0/ccproject-backend:v1"
IMAGE_V2="gcr.io/model-obelisk-469607-r0/ccproject-backend:v2"

kubectl get deployment $DEPLOYMENT -n $NAMESPACE


kubectl get pods -n $NAMESPACE -l app=auth-svc


kubectl get deployment $DEPLOYMENT -n $NAMESPACE -o jsonpath='{.spec.template.spec.containers[0].image}'

kubectl set image deployment/$DEPLOYMENT auth-svc=$IMAGE_V2 -n $NAMESPACE --record

kubectl rollout status deployment/$DEPLOYMENT -n $NAMESPACE

kubectl get pods -n $NAMESPACE -l app=auth-svc
echo ""

kubectl get deployment $DEPLOYMENT -n $NAMESPACE -o jsonpath='{.spec.template.spec.containers[0].image}'
echo ""
echo ""

kubectl rollout history deployment/$DEPLOYMENT -n $NAMESPACE
echo ""
