#!/bin/bash
set -e

NAMESPACE="ccproject"
DEPLOYMENT="auth-svc"

kubectl get deployment $DEPLOYMENT -n $NAMESPACE

kubectl get pods -n $NAMESPACE -l app=auth-svc
echo ""

kubectl get deployment $DEPLOYMENT -n $NAMESPACE -o jsonpath='{.spec.template.spec.containers[0].image}'
echo ""
echo ""

kubectl rollout history deployment/$DEPLOYMENT -n $NAMESPACE | tail -n 6
echo ""

kubectl rollout undo deployment/$DEPLOYMENT -n $NAMESPACE

kubectl rollout status deployment/$DEPLOYMENT -n $NAMESPACE
echo ""

kubectl get pods -n $NAMESPACE -l app=auth-svc

kubectl get deployment $DEPLOYMENT -n $NAMESPACE -o jsonpath='{.spec.template.spec.containers[0].image}'
echo ""
echo ""

kubectl rollout history deployment/$DEPLOYMENT -n $NAMESPACE | tail -n 6
echo ""

