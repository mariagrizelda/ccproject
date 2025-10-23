# CCProject - Kubernetes Deployment with Live Demos

Complete Kubernetes orchestration setup for CCProject with **manual scaling**, **load balancing**, **reliability**, and **rollout/rollback** capabilities.

## 🎯 Overview

This project demonstrates enterprise-grade Kubernetes deployment with:

- ✅ **Manual Scaling** - Scale deployments up/down on demand
- ✅ **Load Balancing** - Traffic distribution across multiple pods  
- ✅ **Self-Healing** - Automatic pod recovery and health checks
- ✅ **Zero-Downtime Deployments** - Rolling updates with instant rollback
- ✅ **Service Discovery** - Automatic DNS and service routing
- ✅ **High Availability** - Multiple replicas with failover

## 📦 Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Load Balancer (NGINX)              │
│                  External IP: 80                    │
└─────────────────────┬───────────────────────────────┘
                      │
        ┌─────────────┼─────────────┬─────────────┐
        │             │             │             │
   ┌────▼───┐   ┌────▼───┐   ┌────▼───┐   ┌─────▼────┐
   │ Auth   │   │Courses │   │Catalog │   │ Planner  │
   │Service │   │Service │   │Service │   │ Service  │
   │(2-10)  │   │(2-10)  │   │(2-10)  │   │ (2-10)   │
   └────┬───┘   └────┬───┘   └────┬───┘   └─────┬────┘
        │             │             │             │
        └─────────────┼─────────────┴─────────────┘
                      │
              ┌───────▼────────┐
              │ MySQL Database │
              │  StatefulSet   │
              └────────────────┘

Frontend (2-8 pods) ─────► NGINX Load Balancer
```

## 🚀 Quick Start

### 1. Prerequisites

On your GCP VM, ensure you have:

```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Configure Docker
gcloud auth configure-docker
```

### 2. Build and Push Images

```bash
# Update with your GCP Project ID
export GCP_PROJECT_ID="your-project-id"

# Build and push Docker images
./build-and-push.sh ${GCP_PROJECT_ID}
```

### 3. Update Kubernetes Manifests

```bash
# Replace placeholders in deployment files
sed -i "s/YOUR_PROJECT_ID/${GCP_PROJECT_ID}/g" k8s/*-deployment.yaml
```

### 4. Deploy to Kubernetes

```bash
# Deploy entire application
./k8s-deploy.sh
```

### 5. Get External IP

```bash
# Wait for LoadBalancer IP assignment (may take 2-3 minutes)
kubectl get svc nginx-service -n ccproject -w

# Once IP is assigned, test the application
EXTERNAL_IP=$(kubectl get svc nginx-service -n ccproject -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
curl http://${EXTERNAL_IP}/api/auth/health/
```

## 🎬 Live Demonstrations

### Demo 1: Scalability & Load Balancing (5 min)

Shows **manual scaling** and **load distribution**:

```bash
./demo-scalability.sh
```

**What you'll see:**
1. Current deployment with 2 pods
2. Scale UP to 5 pods (watch pods being created)
3. Load balancing test across all 5 pods
4. Scale DOWN to 2 pods (watch pods terminating)
5. Zero downtime throughout the process

**Key Kubernetes Features:**
- `kubectl scale` for manual scaling
- Service automatically load balances across pods
- Pods created/destroyed based on replica count
- No service interruption during scaling

### Demo 2: Reliability & Self-Healing (3 min)

Shows **automatic recovery** and **health checks**:

```bash
./demo-reliability.sh
```

**What you'll see:**
1. Current healthy pods
2. Simulate pod failure (delete a pod)
3. Kubernetes automatically creates replacement
4. Health checks verify pod readiness
5. Service remains available throughout

**Key Kubernetes Features:**
- ReplicaSet maintains desired pod count
- Liveness probes detect unhealthy containers
- Readiness probes control traffic routing
- Self-healing without manual intervention

### Demo 3: Rollout & Rollback (5 min)

Shows **zero-downtime updates** and **rollback**:

```bash
./demo-rollout-rollback.sh
```

**What you'll see:**
1. Current deployment version
2. Rolling update to "new version"
3. Gradual pod replacement (old → new)
4. Zero downtime during update
5. Instant rollback to previous version

**Key Kubernetes Features:**
- RollingUpdate strategy (maxSurge=1, maxUnavailable=0)
- Version history tracking
- One-command rollback
- Traffic routing to ready pods only

### Complete Demo: All Features (15 min)

Run all demos in sequence:

```bash
./demo-all-features.sh
```

## 🔧 Manual Operations

### Scaling Commands

```bash
# Scale specific service
kubectl scale deployment auth-svc --replicas=5 -n ccproject

# Scale all backend services
kubectl scale deployment auth-svc courses-svc catalog-svc planner-svc --replicas=3 -n ccproject

# Check current replica count
kubectl get deployment -n ccproject
```

### Monitoring Commands

```bash
# Watch all resources in real-time
watch kubectl get all -n ccproject

# View pod details with node placement
kubectl get pods -n ccproject -o wide

# Stream logs from a service
kubectl logs -f deployment/auth-svc -n ccproject

# View recent events
kubectl get events -n ccproject --sort-by='.lastTimestamp'
```

### Update & Rollback Commands

```bash
# Update to new image version
kubectl set image deployment/auth-svc auth-svc=gcr.io/PROJECT_ID/ccproject-backend:v2 -n ccproject

# Monitor rollout progress
kubectl rollout status deployment/auth-svc -n ccproject

# View rollout history
kubectl rollout history deployment/auth-svc -n ccproject

# Rollback to previous version
kubectl rollout undo deployment/auth-svc -n ccproject

# Rollback to specific revision
kubectl rollout undo deployment/auth-svc --to-revision=3 -n ccproject
```

### Load Testing

```bash
# Get external IP
EXTERNAL_IP=$(kubectl get svc nginx-service -n ccproject -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Simple load test (100 parallel requests)
for i in {1..100}; do
  curl -s http://${EXTERNAL_IP}/api/auth/health/ &
done
wait

# Install and use Apache Bench
sudo apt-get install apache2-utils
ab -n 1000 -c 50 http://${EXTERNAL_IP}/api/auth/health/
```

## 📊 Production Features

### High Availability
- **2 replicas minimum** for each service
- **Load Balancer** distributes traffic
- **Health checks** prevent traffic to failed pods
- **Multi-AZ deployment** ready (GKE feature)

### Scalability
- **Manual scaling** via kubectl
- **Horizontal scaling** across nodes
- **Resource limits** prevent resource exhaustion
- **Load distribution** via Kubernetes Service

### Reliability
- **Liveness probes** detect crashed containers
- **Readiness probes** control traffic routing
- **Restart policy** for automatic recovery
- **PersistentVolume** for MySQL data

### Deployment Strategy
- **RollingUpdate** strategy
- **maxSurge: 1** (create 1 extra pod during update)
- **maxUnavailable: 0** (no downtime allowed)
- **Automatic rollback** on failure

## 🐛 Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl get pods -n ccproject

# View detailed pod information
kubectl describe pod <pod-name> -n ccproject

# Check container logs
kubectl logs <pod-name> -n ccproject

# Check previous container logs (if restarted)
kubectl logs <pod-name> -n ccproject --previous
```

### Service Not Accessible

```bash
# Verify service exists
kubectl get svc -n ccproject

# Check service endpoints
kubectl get endpoints -n ccproject

# Test internal connectivity
kubectl run -it --rm debug --image=busybox --restart=Never -n ccproject -- sh
wget -O- http://auth-service:8001/api/auth/health/
```

### Database Connection Issues

```bash
# Check MySQL pod
kubectl get pods -l app=mysql -n ccproject

# View MySQL logs
kubectl logs -l app=mysql -n ccproject

# Execute commands in MySQL pod
kubectl exec -it mysql-0 -n ccproject -- mysql -u ccproject_user -pccproject_pass ccproject
```

### Image Pull Errors

```bash
# Verify images exist in GCR
gcloud container images list --repository=gcr.io/${GCP_PROJECT_ID}

# Check image pull secrets (if using private registry)
kubectl get secrets -n ccproject

# Verify node can access GCR
kubectl describe pod <pod-name> -n ccproject | grep -A 5 "Events:"
```

## 📁 Project Structure

```
.
├── k8s/                        # Kubernetes manifests
│   ├── namespace.yaml          # Namespace definition
│   ├── configmap.yaml          # Configuration
│   ├── secrets.yaml            # Sensitive data
│   ├── mysql.yaml              # Database StatefulSet
│   ├── auth-deployment.yaml    # Auth microservice
│   ├── courses-deployment.yaml # Courses microservice
│   ├── catalog-deployment.yaml # Catalog microservice
│   ├── planner-deployment.yaml # Planner microservice
│   ├── frontend-deployment.yaml# Frontend app
│   ├── nginx-deployment.yaml   # Load balancer
│   └── README.md               # Detailed K8s docs
├── build-and-push.sh           # Build & push images
├── k8s-deploy.sh               # Deploy application
├── demo-scalability.sh         # Scalability demo
├── demo-reliability.sh         # Reliability demo
├── demo-rollout-rollback.sh    # Rollout/Rollback demo
└── demo-all-features.sh        # Complete demo
```

## 🧹 Cleanup

To remove all resources:

```bash
# Delete the entire namespace (removes all resources)
kubectl delete namespace ccproject

# Verify deletion
kubectl get all -n ccproject
```

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/home/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [GKE Documentation](https://cloud.google.com/kubernetes-engine/docs)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)

## 🎓 Learning Objectives Achieved

After running these demos, you will have demonstrated:

1. **Scalability**
   - Manual horizontal scaling
   - Load balancing across pods
   - Zero-downtime scaling operations

2. **Reliability**
   - Self-healing capabilities
   - Health check implementation
   - Automatic failover

3. **Rollout & Rollback**
   - Zero-downtime deployments
   - Version management
   - Instant rollback capability

4. **Orchestration**
   - Kubernetes cluster management
   - Service discovery
   - Resource management
   - Container orchestration

---

**Questions or Issues?** Check the troubleshooting section or view logs with `kubectl logs`
