# 🔧 Critical Fixes Applied

## Issue Summary
Your deployment had **two critical issues** preventing the application from working:

### 1. NGINX DNS Caching Problem 🔴
**Problem:** NGINX was resolving service names to ClusterIP addresses at startup and caching them forever.

**Evidence from logs:**
```
upstream: "http://34.118.234.142:3000/"  # ClusterIP instead of service name
connect() failed (111: Connection refused)
```

**Why it happened:**
- NGINX with `upstream` blocks resolves DNS **only once at startup**
- If the pod IP changes (which happens on restarts), NGINX still tries the old IP
- This causes "Connection refused" errors even though services are running

**Solution Applied:**
- ✅ Removed static `upstream` blocks
- ✅ Added Kubernetes DNS resolver: `resolver kube-dns.kube-system.svc.cluster.local`
- ✅ Used `set $variable` to force dynamic DNS resolution on every request
- ✅ Used fully qualified domain names (FQDN): `service-name.namespace.svc.cluster.local`

**New NGINX config:**
```nginx
resolver kube-dns.kube-system.svc.cluster.local valid=10s;

location / {
    set $frontend_backend "frontend-service.ccproject.svc.cluster.local:3000";
    proxy_pass http://$frontend_backend;
}
```

This forces NGINX to re-resolve DNS on every request, so it always finds the correct pod IPs.

---

### 2. Django ALLOWED_HOSTS Missing Pod IPs 🔴
**Problem:** Auth service health checks were failing with HTTP 400.

**Evidence from logs:**
```
Liveness probe failed: HTTP probe failed with statuscode: 400
Readiness probe failed: HTTP probe failed with statuscode: 400
```

**Why it happened:**
- Kubernetes health probes send HTTP requests with the **pod IP as the Host header**
- Example: `Host: 10.44.1.20` (pod's internal IP)
- Django's `ALLOWED_HOSTS` didn't include pod IPs, so it rejected requests with 400

**Solution Applied:**
- ✅ Added `10.0.0.0/8` to ALLOWED_HOSTS (covers all Kubernetes pod IPs)
- ✅ Added `.svc.cluster.local` for service-to-service communication
- ✅ Updated LoadBalancer IP from old `34.129.147.19` to new `34.126.201.251`

**Updated ConfigMap:**
```yaml
ALLOWED_HOSTS: "localhost,127.0.0.1,...,34.126.201.251,...,10.0.0.0/8,.svc.cluster.local"
```

---

### 3. LoadBalancer IP Changed ⚠️
**What happened:**
- Old IP: `34.129.147.19`
- New IP: `34.126.201.251`

**Why it changed:**
- The nginx-service was deleted and recreated
- GKE assigned a new ephemeral IP

**Fixed:**
- ✅ Updated ConfigMap ALLOWED_HOSTS
- ✅ Updated ConfigMap CORS_ALLOWED_ORIGINS  
- ✅ Updated Frontend NEXT_PUBLIC_API_URL

**To prevent this in production:**
Reserve a static IP:
```bash
gcloud compute addresses create ccproject-static-ip --region=us-central1
```

---

## How to Apply the Fixes

Run this command on Cloud Shell:
```bash
cd ~/ccproject-code
./update-and-redeploy.sh
```

This will:
1. ✅ Apply updated ConfigMap (with pod IPs in ALLOWED_HOSTS)
2. ✅ Apply updated NGINX config (with dynamic DNS)
3. ✅ Apply updated Frontend (with new LoadBalancer IP)
4. ✅ Delete all pods to force them to reload the new configuration

---

## Expected Results After Fix

### ✅ NGINX Pods
- Should start immediately with `/nginx-health` endpoint
- No more "Connection refused" errors in logs
- Properly routes to backend services using dynamic DNS

### ✅ Auth Service Pods
- Health checks pass (returns 200 OK)
- Becomes Ready after ~60-90 seconds
- No more 400 errors from health probes

### ✅ Backend Service Pods (Courses, Catalog, Planner)
- Init containers complete successfully
- Wait for auth-service to be ready
- Start their main containers

### ✅ Frontend Pods
- Health check at `/api/health` returns 200
- Becomes Ready after ~30-60 seconds
- Can communicate with backend via NGINX

### ✅ LoadBalancer
- Accessible at: `http://34.126.201.251`
- Routes traffic correctly to all services
- Application is fully functional

---

## Verification Commands

After running the update script, verify with:

```bash
# Check all pods are Ready
kubectl get pods -n ccproject

# Test NGINX health
curl http://34.126.201.251/nginx-health

# Test auth service through NGINX
curl http://34.126.201.251/api/auth/health/

# Test frontend through NGINX
curl http://34.126.201.251/

# Check NGINX logs (should see successful requests)
kubectl logs -n ccproject -l app=nginx --tail=20

# Run full diagnostics
./diagnose-k8s.sh
```

---

## Why Pods Need to be Deleted

**Q: Why can't we just restart the deployments?**

**A:** Because:
1. **ConfigMaps are loaded at pod creation** - changing the ConfigMap doesn't affect running pods
2. **NGINX needs to reload its config** - the ConfigMap is mounted as a file, but NGINX doesn't watch for changes
3. **Django environment variables** - loaded once at process startup

**Solution:** Delete the pods, and the Deployment controller will automatically create new ones with the updated configuration.

---

## Lessons Learned

1. 🔄 **NGINX in Kubernetes needs dynamic DNS** - don't use static `upstream` blocks
2. 🔐 **ALLOWED_HOSTS must include pod IPs** - for health probe requests
3. 📦 **ConfigMap changes require pod restart** - they're not automatically reloaded
4. 🌐 **Use FQDN for services** - `service.namespace.svc.cluster.local` is more reliable
5. 🎯 **Reserve static IPs for production** - ephemeral IPs change on service recreation

---

## Current Configuration

**LoadBalancer IP:** `34.126.201.251`

**Services:**
- Frontend: `frontend-service.ccproject.svc.cluster.local:3000`
- Auth: `auth-service.ccproject.svc.cluster.local:8001`
- Courses: `courses-service.ccproject.svc.cluster.local:8002`
- Catalog: `catalog-service.ccproject.svc.cluster.local:8003`
- Planner: `planner-service.ccproject.svc.cluster.local:8004`
- MySQL: `mysql-service.ccproject.svc.cluster.local:3306`

**Health Endpoints:**
- NGINX: `/nginx-health`
- Auth: `/api/auth/health/`
- Frontend: `/api/health`

---

## 🎉 Ready to Deploy!

Run `./update-and-redeploy.sh` to apply all fixes!
