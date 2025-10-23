#!/bin/bash

# Update API URL Script
# Updates the frontend API URL without rebuilding the Docker image

set -e

NAMESPACE="ccproject"
CONFIGMAP_NAME="frontend-config"
SERVICE_NAME="nginx-service"

echo "🔄 Update API URL Script"
echo "======================="

# Function to get current LoadBalancer IP
get_loadbalancer_ip() {
    EXTERNAL_IP=$(kubectl get service ${SERVICE_NAME} -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    
    if [ -z "$EXTERNAL_IP" ]; then
        echo "❌ Could not get LoadBalancer external IP"
        echo "📊 Service status:"
        kubectl get service ${SERVICE_NAME} -n ${NAMESPACE}
        exit 1
    fi
    
    echo "✅ Current LoadBalancer IP: ${EXTERNAL_IP}"
    echo "${EXTERNAL_IP}"
}

# Function to update API URL
update_api_url() {
    local api_url="$1"
    
    echo "📝 Updating ConfigMap with new API URL: ${api_url}"
    
    # Update ConfigMap
    kubectl create configmap ${CONFIGMAP_NAME} \
        --from-literal=NEXT_PUBLIC_API_URL="${api_url}" \
        -n ${NAMESPACE} \
        --dry-run=client -o yaml | kubectl apply -f -
    
    echo "🔄 Restarting frontend pods to pick up new environment variable..."
    kubectl rollout restart deployment frontend -n ${NAMESPACE}
    
    echo "⏳ Waiting for rollout to complete..."
    kubectl rollout status deployment frontend -n ${NAMESPACE} --timeout=300s
    
    echo "✅ API URL updated successfully!"
}

# Main execution
main() {
    if [ $# -eq 1 ]; then
        # Use provided API URL
        API_URL="$1"
        echo "🌐 Using provided API URL: ${API_URL}"
    else
        # Auto-discover LoadBalancer IP
        EXTERNAL_IP=$(get_loadbalancer_ip)
        API_URL="http://${EXTERNAL_IP}/api"
        echo "🌐 Auto-discovered API URL: ${API_URL}"
    fi
    
    # Update API URL
    update_api_url "${API_URL}"
    
    echo ""
    echo "🎉 API URL update completed!"
    echo "📊 Summary:"
    echo "   API URL: ${API_URL}"
    echo "   ConfigMap: ${CONFIGMAP_NAME}"
    echo ""
    echo "🧪 Test the frontend:"
    echo "   curl http://$(echo ${API_URL} | sed 's|http://||' | sed 's|/api||')/"
}

# Run main function
main "$@"
