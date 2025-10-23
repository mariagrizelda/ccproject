#!/bin/bash

# Dynamic Frontend Build Script
# Automatically discovers LoadBalancer IP and builds frontend with correct API URL

set -e

PROJECT_ID="model-obelisk-469607-r0"
IMAGE_NAME="ccproject-frontend"
IMAGE_TAG="latest"
FRONTEND_DIR="./frontend"
NAMESPACE="ccproject"
SERVICE_NAME="nginx-service"

echo "🔧 Dynamic Frontend Build Script"
echo "================================"

# Function to get LoadBalancer IP
get_loadbalancer_ip() {
    echo "🔍 Discovering LoadBalancer IP..."
    
    # Wait for LoadBalancer to get an external IP
    echo "⏳ Waiting for LoadBalancer to get external IP..."
    kubectl wait --for=condition=Ready --timeout=300s service/${SERVICE_NAME} -n ${NAMESPACE} || {
        echo "❌ LoadBalancer did not get external IP within 5 minutes"
        exit 1
    }
    
    # Get the external IP
    EXTERNAL_IP=$(kubectl get service ${SERVICE_NAME} -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    
    if [ -z "$EXTERNAL_IP" ]; then
        echo "❌ Could not get LoadBalancer external IP"
        echo "📊 Service status:"
        kubectl get service ${SERVICE_NAME} -n ${NAMESPACE}
        exit 1
    fi
    
    echo "✅ LoadBalancer IP discovered: ${EXTERNAL_IP}"
    echo "${EXTERNAL_IP}"
}

# Function to build and push frontend image
build_frontend() {
    local api_url="$1"
    
    echo "🏗️ Building frontend Docker image with NEXT_PUBLIC_API_URL=${api_url}..."
    docker build \
        --build-arg NEXT_PUBLIC_API_URL="${api_url}" \
        -t gcr.io/${PROJECT_ID}/${IMAGE_NAME}:${IMAGE_TAG} \
        ${FRONTEND_DIR}
    
    echo "📤 Pushing frontend Docker image to Google Container Registry..."
    docker push gcr.io/${PROJECT_ID}/${IMAGE_NAME}:${IMAGE_TAG}
}

# Function to restart frontend deployment
restart_frontend() {
    echo "🔄 Restarting frontend deployment in Kubernetes..."
    kubectl rollout restart deployment frontend -n ${NAMESPACE}
    
    echo "⏳ Waiting for rollout to complete..."
    kubectl rollout status deployment frontend -n ${NAMESPACE} --timeout=300s
    
    echo "✅ Frontend deployment updated!"
}

# Main execution
main() {
    # Get LoadBalancer IP
    EXTERNAL_IP=$(get_loadbalancer_ip)
    API_URL="http://${EXTERNAL_IP}/api"
    
    echo "🌐 API URL: ${API_URL}"
    
    # Build and push frontend
    build_frontend "${API_URL}"
    
    # Restart frontend deployment
    restart_frontend
    
    echo ""
    echo "🎉 Frontend build completed successfully!"
    echo "📊 Summary:"
    echo "   LoadBalancer IP: ${EXTERNAL_IP}"
    echo "   API URL: ${API_URL}"
    echo "   Image: gcr.io/${PROJECT_ID}/${IMAGE_NAME}:${IMAGE_TAG}"
    echo ""
    echo "🧪 Test the frontend:"
    echo "   curl http://${EXTERNAL_IP}/"
    echo "   curl http://${EXTERNAL_IP}/api/auth/health/"
}

# Run main function
main "$@"
