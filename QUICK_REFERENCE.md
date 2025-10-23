# 🚀 Kubernetes Deployment - Quick Reference

## ✅ What's Been Created

### Kubernetes Manifests (`k8s/` directory)
- ✓ `namespace.yaml` - Isolated namespace for the project
- ✓ `configmap.yaml` - Application configuration
- ✓ `secrets.yaml` - Database passwords and secret keys
- ✓ `mysql.yaml` - MySQL StatefulSet with persistent storage
- ✓ `auth-deployment.yaml` - Auth microservice (2-10 replicas)
- ✓ `courses-deployment.yaml` - Courses microservice (2-10 replicas)
- ✓ `catalog-deployment.yaml` - Catalog microservice (2-10 replicas)
- ✓ `planner-deployment.yaml` - Planner microservice (2-10 replicas)
- ✓ `frontend-deployment.yaml` - Frontend application (2-8 replicas)
- ✓ `nginx-deployment.yaml` - NGINX load balancer (2-5 replicas)

### Deployment Scripts
- ✓ `build-and-push.sh` - Build Docker images and push to GCR
- ✓ `k8s-deploy.sh` - Deploy entire application to Kubernetes

### Live Demo Scripts
- ✓ `demo-scalability.sh` - **Manual scaling & load balancing demo**
- ✓ `demo-reliability.sh` - **Self-healing & reliability demo**
- ✓ `demo-rollout-rollback.sh` - **Zero-downtime deployment demo**
- ✓ `demo-all-features.sh` - **Complete demonstration (all 3 demos)**

### Documentation
- ✓ `KUBERNETES_GUIDE.md` - Complete deployment and usage guide
- ✓ `k8s/README.md` - Kubernetes-specific documentation

## 🎯 Deployment Steps (Summary)

### 1. **Setup** (One-time)
```bash
# Set your GCP Project ID
export GCP_PROJECT_ID="your-gcp-project-id"

# Update deployment files
sed -i "s/YOUR_PROJECT_ID/${GCP_PROJECT_ID}/g" k8s/*-deployment.yaml
```

### 2. **Build & Push Images**
```bash
./build-and-push.sh ${GCP_PROJECT_ID}
```

### 3. **Deploy to Kubernetes**
```bash
./k8s-deploy.sh
```

### 4. **Get External IP**
```bash
kubectl get svc nginx-service -n ccproject
```

## 🎬 Running Live Demos

### Demo 1: Scalability (5 min)
```bash
./demo-scalability.sh
```
Shows: Manual scaling (2→5→2 replicas) + Load balancing

### Demo 2: Reliability (3 min)
```bash
./demo-reliability.sh
```
Shows: Pod failure + Auto-recovery + Health checks

### Demo 3: Rollout & Rollback (5 min)
```bash
./demo-rollout-rollback.sh
```
Shows: Zero-downtime update + Instant rollback

### All Demos (15 min)
```bash
./demo-all-features.sh
```
Runs all three demos in sequence

## 📋 Quick Commands

### Monitoring
```bash
# Watch all resources
watch kubectl get all -n ccproject

# View pods with node info
kubectl get pods -n ccproject -o wide

# Check pod logs
kubectl logs -f deployment/auth-svc -n ccproject
```

### Scaling
```bash
# Scale up
kubectl scale deployment auth-svc --replicas=5 -n ccproject

# Scale down
kubectl scale deployment auth-svc --replicas=2 -n ccproject
```

### Updates & Rollback
```bash
# View rollout history
kubectl rollout history deployment/auth-svc -n ccproject

# Rollback to previous version
kubectl rollout undo deployment/auth-svc -n ccproject
```

### Cleanup
```bash
# Delete everything
kubectl delete namespace ccproject
```

## 🎓 Features Demonstrated

### ✅ Scalability
- Manual horizontal scaling
- Load balancing across pods
- Zero-downtime scaling
- Traffic distribution

### ✅ Reliability
- Self-healing (auto-restart)
- Health checks (liveness/readiness)
- Automatic failover
- Service continuity

### ✅ Rollout & Rollback
- Zero-downtime deployments
- Rolling updates
- Instant rollback
- Version history

### ✅ Load Balancing
- NGINX LoadBalancer service
- Kubernetes Service (ClusterIP)
- Automatic DNS resolution
- Round-robin distribution

## 📊 Architecture Summary

```
External Traffic
       ↓
LoadBalancer (NGINX) ← External IP
       ↓
Service Discovery (K8s DNS)
       ↓
┌──────┴───────┬────────┬──────────┐
│              │        │          │
Auth-SVC   Courses   Catalog   Planner
(2 pods)   (2 pods) (2 pods)  (2 pods)
       ↓              ↓
   MySQL StatefulSet (1 pod)
Frontend (2 pods) ← Separate route
```

## 🔑 Key Configuration

### Deployment Strategy
- **Type**: RollingUpdate
- **maxSurge**: 1 (create 1 extra pod during update)
- **maxUnavailable**: 0 (no downtime allowed)

### Replicas (default)
- **Backend services**: 2 replicas (scalable to 10)
- **Frontend**: 2 replicas (scalable to 8)
- **NGINX**: 2 replicas (scalable to 5)
- **MySQL**: 1 replica (StatefulSet)

### Health Checks
- **Liveness Probe**: HTTP GET to `/health/`
- **Readiness Probe**: HTTP GET to `/health/`
- **Initial Delay**: 30-90 seconds (varies by service)
- **Timeout**: 3-5 seconds

## ⚠️ Before Demo Day

1. **Test deployment** on your VM first
2. **Save external IP** for quick access
3. **Practice demo scripts** at least once
4. **Have kubectl cheat sheet** ready
5. **Prepare backup slides** in case of issues

## 📞 Troubleshooting Quick Checks

```bash
# Is everything running?
kubectl get all -n ccproject

# Why is pod failing?
kubectl describe pod <pod-name> -n ccproject

# What are the logs saying?
kubectl logs <pod-name> -n ccproject

# Can services talk to each other?
kubectl get endpoints -n ccproject

# Is database ready?
kubectl logs -l app=mysql -n ccproject
```

## 🎯 Demo Talking Points

### When showing **Scalability**:
- "Kubernetes allows us to scale horizontally without downtime"
- "The Service automatically load balances across all replicas"
- "We can scale up during peak traffic and down during off-hours"
- "No configuration changes needed - just change replica count"

### When showing **Reliability**:
- "Kubernetes continuously monitors pod health"
- "Failed pods are automatically replaced"
- "Liveness probes detect crashed containers"
- "Readiness probes ensure traffic only goes to healthy pods"

### When showing **Rollout & Rollback**:
- "Rolling updates replace pods gradually"
- "Zero downtime - old pods stay until new ones are ready"
- "We can rollback instantly if issues are detected"
- "Version history is maintained automatically"

---

**Ready to deploy?** Start with `./k8s-deploy.sh`

**Ready to demo?** Run `./demo-all-features.sh`
