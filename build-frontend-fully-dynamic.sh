#!/bin/bash

# Fully Dynamic Frontend Build Script
# Uses Kubernetes ConfigMap for API URL that can be updated without rebuilding

set -e

PROJECT_ID="model-obelisk-469607-r0"
IMAGE_NAME="ccproject-frontend"
IMAGE_TAG="latest"
FRONTEND_DIR="./frontend"
NAMESPACE="ccproject"
SERVICE_NAME="nginx-service"
CONFIGMAP_NAME="frontend-config"

echo "🚀 Fully Dynamic Frontend Build Script"
echo "======================================"

# Function to create/update ConfigMap with API URL
update_configmap() {
    local api_url="$1"
    
    echo "📝 Creating/updating ConfigMap with API URL..."
    
    # Create or update ConfigMap
    kubectl create configmap ${CONFIGMAP_NAME} \
        --from-literal=NEXT_PUBLIC_API_URL="${api_url}" \
        -n ${NAMESPACE} \
        --dry-run=client -o yaml | kubectl apply -f -
    
    echo "✅ ConfigMap updated with API URL: ${api_url}"
}

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

# Function to build frontend image (without hardcoded API URL)
build_frontend() {
    echo "🏗️ Building frontend Docker image..."
    docker build \
        -t gcr.io/${PROJECT_ID}/${IMAGE_NAME}:${IMAGE_TAG} \
        ${FRONTEND_DIR}
    
    echo "📤 Pushing frontend Docker image to Google Container Registry..."
    docker push gcr.io/${PROJECT_ID}/${IMAGE_NAME}:${IMAGE_TAG}
}

# Function to update frontend deployment to use ConfigMap
update_frontend_deployment() {
    echo "🔄 Updating frontend deployment to use ConfigMap..."
    
    # Patch the deployment to use ConfigMap
    kubectl patch deployment frontend -n ${NAMESPACE} -p '{
        "spec": {
            "template": {
                "spec": {
                    "containers": [{
                        "name": "frontend",
                        "env": [{
                            "name": "NEXT_PUBLIC_API_URL",
                            "valueFrom": {
                                "configMapKeyRef": {
                                    "name": "'${CONFIGMAP_NAME}'",
                                    "key": "NEXT_PUBLIC_API_URL"
                                }
                            }
                        }]
                    }]
                }
            }
        }
    }'
    
    echo "⏳ Waiting for rollout to complete..."
    kubectl rollout status deployment frontend -n ${NAMESPACE} --timeout=300s
    
    echo "✅ Frontend deployment updated!"
}

# Function to update API URL without rebuilding
update_api_url() {
    local api_url="$1"
    
    echo "🔄 Updating API URL without rebuilding..."
    
    # Update ConfigMap
    kubectl create configmap ${CONFIGMAP_NAME} \
        --from-literal=NEXT_PUBLIC_API_URL="${api_url}" \
        -n ${NAMESPACE} \
        --dry-run=client -o yaml | kubectl apply -f -
    
    # Restart frontend pods to pick up new environment variable
    kubectl rollout restart deployment frontend -n ${NAMESPACE}
    
    echo "⏳ Waiting for rollout to complete..."
    kubectl rollout status deployment frontend -n ${NAMESPACE} --timeout=300s
    
    echo "✅ API URL updated to: ${api_url}"
}

# Main execution
main() {
    # Get LoadBalancer IP
    EXTERNAL_IP=$(get_loadbalancer_ip)
    API_URL="http://${EXTERNAL_IP}/api"
    
    echo "🌐 API URL: ${API_URL}"
    
    # Update ConfigMap with API URL
    update_configmap "${API_URL}"
    
    # Build frontend (without hardcoded API URL)
    build_frontend
    
    # Update frontend deployment to use ConfigMap
    update_frontend_deployment
    
    echo ""
    echo "🎉 Frontend build completed successfully!"
    echo "📊 Summary:"
    echo "   LoadBalancer IP: ${EXTERNAL_IP}"
    echo "   API URL: ${API_URL}"
    echo "   Image: gcr.io/${PROJECT_ID}/${IMAGE_NAME}:${IMAGE_TAG}"
    echo "   ConfigMap: ${CONFIGMAP_NAME}"
    echo ""
    echo "🧪 Test the frontend:"
    echo "   curl http://${EXTERNAL_IP}/"
    echo "   curl http://${EXTERNAL_IP}/api/auth/health/"
    echo ""
    echo "🔄 To update API URL later (without rebuilding):"
    echo "   ./update-api-url.sh http://NEW_IP/api"
}

# Run main function
main "$@"
