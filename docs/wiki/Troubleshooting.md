# Troubleshooting

Common issues and their solutions.

---

## Services Not Starting

### Containers Keep Restarting

**Check logs:**
```bash
sudo docker compose logs <service-name>
```

**Common fixes:**

```bash
# Full rebuild
sudo docker compose down
sudo docker compose up -d --build

# Check database is ready
sudo docker compose logs postgres | grep "ready"

# Restart specific service
sudo docker compose restart gateway
```

### Port Already in Use

**Find what's using the port:**
```bash
lsof -i :3000
lsof -i :3001
lsof -i :3002
lsof -i :3003
```

**Kill the process:**
```bash
kill -9 <PID>
```

**Or change port in `.env`:**
```env
GATEWAY_PORT=3010
```

---

## Database Issues

### Connection Refused

**Wait for PostgreSQL to initialize:**
```bash
# Check if ready
sudo docker compose logs postgres

# Should see: "database system is ready to accept connections"
```

**Reset database:**
```bash
sudo docker compose down -v
sudo docker compose up -d
```

### Tables Not Created

**Run migrations manually:**
```bash
# Auth service
docker exec -it secure-gateway-auth node src/db/migrate.js

# Data service
docker exec -it secure-gateway-data node src/db/migrate.js

# Monitoring
docker exec -it secure-gateway-monitoring node src/db/migrate.js
```

---

## Redis Issues

### Connection Error

**Check Redis status:**
```bash
sudo docker compose logs redis
```

**Test connection:**
```bash
docker exec -it secure-gateway-redis redis-cli -a redis_password ping
# Should return: PONG
```

**Restart Redis:**
```bash
sudo docker compose restart redis
```

---

## Authentication Issues

### Can't Login

**Verify credentials:**
```bash
# Test login endpoint directly
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!"}'
```

**Check auth service logs:**
```bash
sudo docker compose logs auth-service
```

**Reset admin password:**
```bash
# Access database
docker exec -it secure-gateway-db psql -U postgres secure_gateway

# Update password (generate new hash first)
UPDATE users SET password_hash = '<new-hash>' WHERE username = 'admin';
```

### Token Expired

**Refresh token:**
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"token":"your-refresh-token"}'
```

---

## Rate Limiting Issues

### Getting Rate Limited Too Fast

**Check rate limit settings:**
```env
# In .env file
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100  # Max requests
```

**Reset rate limits:**
```bash
# Restart Redis (clears Redis-based rate limits)
sudo docker compose restart redis
```

---

## Dashboard Not Loading

### ERR_CONNECTION_REFUSED

**Backend not running:**
```bash
# Check monitoring service
curl http://localhost:3003/health

# If failed, check logs
sudo docker compose logs monitoring-service
```

### CORS Errors

**Update CORS in `.env`:**
```env
# Add your dashboard URL
CORS_ORIGIN=http://localhost:3004,https://your-domain.com
```

---

## Performance Issues

### Slow Responses

**Check database:**
```bash
# Database logs
sudo docker compose logs postgres

# Check connections
docker exec -it secure-gateway-db psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"
```

**Check Redis cache:**
```bash
# Cache hit rate
docker exec -it secure-gateway-redis redis-cli -a redis_password INFO stats
```

**Monitor resources:**
```bash
# Docker stats
sudo docker stats

# Specific container
sudo docker stats secure-gateway-api
```

---

## Logs and Debugging

### View Service Logs

```bash
# All services
sudo docker compose logs

# Specific service
sudo docker compose logs gateway
sudo docker compose logs auth-service
sudo docker compose logs data-service
sudo docker compose logs monitoring-service

# Follow logs (real-time)
sudo docker compose logs -f monitoring-service

# Last 100 lines
sudo docker compose logs --tail=100 gateway
```

### Enable Debug Logging

**In `.env`:**
```env
LOG_LEVEL=debug
LOG_FORMAT=combined
```

**Restart service:**
```bash
sudo docker compose restart gateway
```

---

## Common Error Messages

### "Module not found"

**Rebuild container:**
```bash
sudo docker compose up -d --build <service-name>
```

### "Database connection failed"

**Wait for database to be ready:**
```bash
sleep 15
sudo docker compose ps
```

### "EADDRINUSE"

**Port conflict - kill process:**
```bash
lsof -ti:3000 | xargs kill -9
```

---

## Reset Everything

**Nuclear option:**
```bash
# Stop all containers
sudo docker compose down

# Remove all volumes (deletes all data!)
sudo docker compose down -v

# Rebuild and start
sudo docker compose up -d --build

# Wait for initialization
sleep 20

# Verify
sudo docker compose ps
```

---

## Getting Help

If none of these solutions work:

1. **Check logs** and include them in your issue
2. **Search existing issues** on GitHub
3. **Create a new issue** with:
   - Error message
   - Service logs
   - Steps to reproduce
   - Environment details

---

Back to [[Getting Started]]
