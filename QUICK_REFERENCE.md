# Quick Reference - API Gateway + Monitoring

## 🚀 Quick Commands

### Development
```bash
# Install all dependencies
npm install

# Run all services (requires PostgreSQL & Redis)
npm run dev:all

# Or run individually
npm run gateway     # Port 3000
npm run auth        # Port 3001
npm run data        # Port 3002
npm run monitoring  # Port 3003
```

### Docker
```bash
# Build and start
npm run docker:build

# Stop
npm run docker:down

# View logs
docker-compose logs -f [service-name]
```

### Database
```bash
# Run migrations manually
cd services/auth && npm run db:migrate
cd services/data && npm run db:migrate
cd monitoring && npm run db:migrate
```

## 🧪 Testing

### Quick Test (No Database Required)
Test basic health endpoints:
```bash
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
```

### Full Test Suite
```bash
npm test
```

## 📝 Sample API Calls

### 1. Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123!"
  }'
```

### 3. Access Protected Route
```bash
curl http://localhost:3000/api/data \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Create Data Item
```bash
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Sample Item",
    "description": "A sample item",
    "category": "test",
    "price": 99.99
  }'
```

### 5. Get Monitoring Dashboard
```bash
curl http://localhost:3003/monitoring/dashboard
```

### 6. Get Blocked IPs
```bash
curl http://localhost:3003/monitoring/admin/ip-tracking?is_blocked=true
```

## 🔑 Default Credentials

### Admin Account
- Username: `admin`
- Password: `Admin123!`
- Role: `admin`

⚠️ **Change this immediately in production!**

## 📊 Port Map

| Service | Port | Purpose |
|---------|------|---------|
| API Gateway | 3000 | Main entry point |
| Auth Service | 3001 | Authentication |
| Data Service | 3002 | Data management |
| Monitoring | 3003 | Logs & analytics |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache |

## 🛠️ Common Issues

### Issue: Cannot connect to database
**Solution**: Ensure PostgreSQL is running
```bash
docker-compose up -d postgres
# or locally
pg_isready
```

### Issue: Redis connection failed
**Solution**: Check Redis status
```bash
docker-compose up -d redis
# or locally
redis-cli ping
```

### Issue: Port already in use
**Solution**: Find and kill process
```bash
lsof -i :3000
kill -9 <PID>
```

### Issue: Tables not created
**Solution**: Run migrations manually
```bash
cd services/auth && npm run db:migrate
cd services/data && npm run db:migrate
cd monitoring && npm run db:migrate
```

## 🔐 Security Checklist

- [ ] Change JWT_SECRET
- [ ] Change database password
- [ ] Change Redis password
- [ ] Update admin password
- [ ] Enable HTTPS (production)
- [ ] Configure CORS origins
- [ ] Set proper rate limits
- [ ] Enable logging
- [ ] Monitor alerts regularly

## 📚 Useful Queries

### View recent login attempts
```sql
SELECT username, ip_address, success, attempted_at 
FROM login_attempts 
ORDER BY attempted_at DESC 
LIMIT 20;
```

### View blocked IPs
```sql
SELECT ip, failed_login_count, block_reason, blocked_at 
FROM ip_tracking 
WHERE is_blocked = true;
```

### View active alerts
```sql
SELECT type, severity, message, created_at 
FROM alerts 
WHERE is_resolved = false 
ORDER BY created_at DESC;
```

### View recent requests
```sql
SELECT method, url, status_code, duration, ip, timestamp 
FROM request_logs 
ORDER BY timestamp DESC 
LIMIT 50;
```

## 🎯 Next Steps / Enhancements

1. **Add WebSocket support** for real-time monitoring
2. **Implement Redis caching** for frequently accessed data
3. **Add email notifications** for critical alerts
4. **Set up Grafana/Prometheus** for advanced metrics
5. **Add API versioning** (v1, v2, etc.)
6. **Implement GraphQL** endpoint for flexible queries
7. **Add file upload** support with virus scanning
8. **Set up CI/CD** pipeline with GitHub Actions
9. **Add integration tests** with test database
10. **Implement circuit breaker** pattern for service calls

---

Happy coding! 🚀
