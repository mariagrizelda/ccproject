#!/bin/bash

set -e

NAMESPACE="ccproject"
DEPLOYMENT="catalog-svc"
INITIAL_REPLICAS=2
SCALED_REPLICAS=5

kubectl scale deployment/$DEPLOYMENT --replicas=$INITIAL_REPLICAS -n $NAMESPACE
echo ""

sleep 5
echo ""

kubectl get deployment $DEPLOYMENT -n $NAMESPACE
echo ""

kubectl get pods -n $NAMESPACE -l app=catalog-svc
echo ""