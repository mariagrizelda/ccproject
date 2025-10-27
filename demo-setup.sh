#!/bin/bash

set -e

PROJECT_ID="model-obelisk-469607-r0"
IMAGE_NAME="ccproject-backend"
NAMESPACE="ccproject"

docker build -t gcr.io/$PROJECT_ID/$IMAGE_NAME:v1 .

docker push gcr.io/$PROJECT_ID/$IMAGE_NAME:v1
echo ""

docker build -t gcr.io/$PROJECT_ID/$IMAGE_NAME:v2 .
git checkout Dockerfile  

docker push gcr.io/$PROJECT_ID/$IMAGE_NAME:v2
echo ""

kubectl set image deployment/auth-svc auth-svc=gcr.io/$PROJECT_ID/$IMAGE_NAME:v1 -n $NAMESPACE --record
kubectl rollout status deployment/auth-svc -n $NAMESPACE
echo ""
