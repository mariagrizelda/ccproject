# Kubernetes Deployment Guide

This directory contains Kubernetes manifests and scripts for deploying CCProject with full scalability, reliability, and orchestration features.

## 📁 Directory Structure

```
k8s/
├── namespace.yaml              # Namespace configuration
├── configmap.yaml             # Application configuration
├── secrets.yaml               # Sensitive data (passwords, keys)
├── mysql.yaml                 # MySQL StatefulSet
├── auth-deployment.yaml       # Auth microservice
├── courses-deployment.yaml    # Courses microservice
├── catalog-deployment.yaml    # Catalog microservice
├── planner-deployment.yaml    # Planner microservice
├── frontend-deployment.yaml   # Frontend application
└── nginx-deployment.yaml      # NGINX load balancer
```

## 🚀 Deployment Instructions

### Prerequisites

1. **GCP Account** with a VM instance
2. **kubectl** installed and configured
3. **Docker** installed
4. **gcloud CLI** installed and authenticated

### Step 1: Build and Push Docker Images

Replace `YOUR_PROJECT_ID` with your GCP project ID:

```bash
# Make script executable
chmod +x build-and-push.sh

# Build and push images
./build-and-push.sh YOUR_PROJECT_ID
```

### Step 2: Update Kubernetes Manifests

Update the following files with your GCP project ID:

```bash
# Replace YOUR_PROJECT_ID in all deployment files
sed -i '' 's/YOUR_PROJECT_ID/your-actual-project-id/g' k8s/*-deployment.yaml
```

### Step 3: Deploy to Kubernetes

```bash
# Make deploy script executable
chmod +x k8s-deploy.sh

# Deploy entire application
./k8s-deploy.sh
```

### Step 4: Get External IP

```bash
# Wait for LoadBalancer to assign external IP
kubectl get svc nginx-service -n ccproject -w
```

## 🎯 Live Demonstrations

### Make Demo Scripts Executable

```bash
chmod +x demo-*.sh
```

### Demo 1: Scalability & Load Balancing (~5 minutes)

Demonstrates manual scaling and load distribution:

```bash
./demo-scalability.sh
```

**Features shown:**
- Manual scaling from 2 → 5 → 2 replicas
- Load balancing across multiple pods
- Zero downtime during scaling
- Service discovery

### Demo 2: Reliability & Self-Healing (~3 minutes)

Demonstrates automatic pod recovery:

```bash
./demo-reliability.sh
```

**Features shown:**
- Automatic pod restart on failure
- Health checks (liveness & readiness probes)
- Maintaining desired replica count
- Service continuity during failures

### Demo 3: Rollout & Rollback (~5 minutes)

Demonstrates zero-downtime deployments:

```bash
./demo-rollout-rollback.sh
```

**Features shown:**
- Rolling updates (gradual pod replacement)
- Zero downtime deployments
- Instant rollback capability
- Version history tracking

### Complete Demo: All Features (~15 minutes)

Run all demonstrations in sequence:

```bash
./demo-all-features.sh
```

## 📊 Manual Operations

### Scaling

Scale any deployment manually:

```bash
# Scale up
kubectl scale deployment auth-svc --replicas=5 -n ccproject

# Scale down
kubectl scale deployment auth-svc --replicas=2 -n ccproject

# Scale all backend services
kubectl scale deployment auth-svc courses-svc catalog-svc planner-svc --replicas=3 -n ccproject
```

### Monitoring

```bash
# Watch all resources
watch kubectl get all -n ccproject

# View pod details
kubectl get pods -n ccproject -o wide

# Check pod logs
kubectl logs -f deployment/auth-svc -n ccproject

# Describe deployment
kubectl describe deployment auth-svc -n ccproject
```

### Rolling Updates

```bash
# Update image
kubectl set image deployment/auth-svc auth-svc=gcr.io/PROJECT_ID/ccproject-backend:v2 -n ccproject

# Check rollout status
kubectl rollout status deployment/auth-svc -n ccproject

# View rollout history
kubectl rollout history deployment/auth-svc -n ccproject

# Pause rollout
kubectl rollout pause deployment/auth-svc -n ccproject

# Resume rollout
kubectl rollout resume deployment/auth-svc -n ccproject
```

### Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/auth-svc -n ccproject

# Rollback to specific revision
kubectl rollout undo deployment/auth-svc --to-revision=2 -n ccproject
```

### Load Testing

```bash
# Get external IP
EXTERNAL_IP=$(kubectl get svc nginx-service -n ccproject -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Simple load test with curl
for i in {1..100}; do
  curl -s http://${EXTERNAL_IP}/api/auth/health/ &
done

# Using Apache Bench (if installed)
ab -n 1000 -c 50 http://${EXTERNAL_IP}/api/auth/health/
```

## 🔧 Configuration

### Update Environment Variables

Edit `k8s/configmap.yaml` and `k8s/secrets.yaml`, then apply:

```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Restart pods to pick up changes
kubectl rollout restart deployment/auth-svc -n ccproject
```

### Change Resource Limits

Edit deployment files and update `resources` section:

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "200m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

Then apply changes:

```bash
kubectl apply -f k8s/auth-deployment.yaml
```

## 🛡️ Architecture Features

### High Availability
- **Multiple replicas** of each service (minimum 2)
- **Load balancing** via Kubernetes Service
- **Auto-recovery** of failed pods
- **Rolling updates** with zero downtime

### Scalability
- **Manual scaling** on demand
- **Load distribution** across pods
- **Horizontal scaling** capability
- **Resource limits** to prevent overuse

### Reliability
- **Health checks** (liveness & readiness probes)
- **Self-healing** (automatic restart)
- **Graceful shutdown** during updates
- **Service continuity** during failures

### Deployment Strategy
- **RollingUpdate** strategy
- **maxSurge: 1** (one extra pod during update)
- **maxUnavailable: 0** (no downtime)
- **Version tracking** for rollbacks

## 📋 Troubleshooting

### Pods not starting

```bash
# Check pod status
kubectl get pods -n ccproject

# View pod events
kubectl describe pod <pod-name> -n ccproject

# Check logs
kubectl logs <pod-name> -n ccproject
```

### Service not accessible

```bash
# Check service
kubectl get svc -n ccproject

# Check endpoints
kubectl get endpoints -n ccproject

# Test internal connectivity
kubectl run -it --rm debug --image=busybox --restart=Never -n ccproject -- sh
# Inside the pod: wget -O- http://auth-service:8001/api/auth/health/
```

### MySQL connection issues

```bash
# Check MySQL pod
kubectl get pods -l app=mysql -n ccproject

# Check MySQL logs
kubectl logs -l app=mysql -n ccproject

# Test MySQL connection
kubectl exec -it mysql-0 -n ccproject -- mysql -u ccproject_user -p
```

## 🧹 Cleanup

Delete all resources:

```bash
# Delete all deployments and services
kubectl delete namespace ccproject

# Verify deletion
kubectl get all -n ccproject
```

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [GCP Kubernetes Engine](https://cloud.google.com/kubernetes-engine/docs)
