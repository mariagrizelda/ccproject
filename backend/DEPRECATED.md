# DEPRECATED - Use service-specific settings

This file is kept for reference only. Each microservice uses its own settings file:

- Auth Service: `backend/settings_auth.py`
- Courses Service: `backend/settings_courses.py`
- Catalog Service: `backend/settings_catalog.py`
- Planner Service: `backend/settings_planner.py`

The old monolithic `api` app has been replaced by:
- `authsvc` - Authentication service
- `coursessvc` - Courses service
- `catalogsrv` - Catalog service
- `plannersvc` - Planner service
- `shared` - Shared models and utilities

See MICROSERVICES.md for complete documentation.
