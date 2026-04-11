# Secure API Gateway + Monitoring System

A production-ready microservices architecture with centralized API gateway, authentication, data management, and comprehensive monitoring.

## 🏗️ Architecture

```
Client
  ↓
API Gateway (Port 3000)
  ↓
┌─────────────────────────────────────┐
│ Auth Service │ Data Service         │
│ (Port 3001)  │ (Port 3002)          │
└─────────────────────────────────────┘
  ↓
Monitoring Service (Port 3003)
  ↓
PostgreSQL Database + Redis Cache
```

## 📋 Features

### Core System
- ✅ API Gateway with centralized routing
- ✅ Microservices separation (Auth + Data)
- ✅ REST API design
- ✅ PostgreSQL database integration
- ✅ Redis caching layer

### Authentication & Access Control
- ✅ JWT authentication with access/refresh tokens
- ✅ Role-based access control (RBAC)
- ✅ Token validation & expiry handling
- ✅ Password hashing with bcrypt

### Security Layer
- ✅ Rate limiting (anti brute force)
- ✅ Input validation with express-validator
- ✅ Helmet security headers
- ✅ CORS protection
- ✅ IP-based tracking and blocking

### Logging & Monitoring
- ✅ Request logging (IP, endpoint, status, duration)
- ✅ Activity tracking (login success/fail)
- ✅ Centralized log storage in PostgreSQL
- ✅ Dashboard API for analytics
- ✅ Alert system for suspicious activities

### Detection & Alerts
- ✅ Multiple failed login detection
- ✅ IP-based activity tracking
- ✅ Automatic IP blocking after repeated failures
- ✅ Alert generation and resolution system

### DevOps / Production Ready
- ✅ Dockerized services
- ✅ Docker Compose orchestration
- ✅ Environment config management
- ✅ Health checks for all services
- ✅ Database auto-migration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

**OR**

- Docker & Docker Compose

### Option 1: Local Development

1. **Clone and Install Dependencies**
```bash
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start Services**

You need to run each service in separate terminals:

```bash
# Terminal 1 - API Gateway
npm run gateway

# Terminal 2 - Auth Service
npm run auth

# Terminal 3 - Data Service
npm run data

# Terminal 4 - Monitoring Service
npm run monitoring
```

**OR run all at once:**
```bash
npm run dev:all
```

### Option 2: Docker (Recommended)

1. **Build and Start All Services**
```bash
npm run docker:build
```

**OR**
```bash
docker-compose up -d --build
```

2. **Stop All Services**
```bash
npm run docker:down
```

**OR**
```bash
docker-compose down
```

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| POST | `/api/auth/refresh` | Refresh access token | ❌ |
| POST | `/api/auth/logout` | Logout | ✅ |
| GET | `/api/auth/me` | Get user profile | ✅ |
| POST | `/api/auth/change-password` | Change password | ✅ |

### Data Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/data` | Get all items | ✅ |
| GET | `/api/data/:id` | Get item by ID | ✅ |
| POST | `/api/data` | Create new item | ✅ |
| PUT | `/api/data/:id` | Update item | ✅ |
| DELETE | `/api/data/:id` | Delete item | ✅ |
| GET | `/api/data/activities` | Get activity logs | ✅ |

### Monitoring & Analytics

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/monitoring/dashboard` | Get dashboard stats | ❌ |
| GET | `/api/monitoring/requests` | Get request logs | ❌ |
| GET | `/api/monitoring/activities` | Get activity logs | ❌ |
| GET | `/api/monitoring/alerts` | Get alerts | ❌ |
| PUT | `/api/monitoring/alerts/:id/resolve` | Resolve alert | ❌ |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/*` | Admin monitoring | ✅ (Admin) |
| GET | `/api/monitoring/admin/ip-tracking` | Get IP tracking | ❌ |
| PUT | `/api/monitoring/admin/ip-tracking/:ip/block` | Block/unblock IP | ❌ |

### Health Checks

- Gateway: `http://localhost:3000/health`
- Auth Service: `http://localhost:3001/health`
- Data Service: `http://localhost:3002/health`
- Monitoring Service: `http://localhost:3003/health`

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Individual Services
```bash
cd gateway && npm test
cd services/auth && npm test
cd services/data && npm test
cd monitoring && npm test
```

## 🔐 Security Features

### Rate Limiting
- **General endpoints**: 100 requests per 15 minutes
- **Auth endpoints**: 5 failed attempts per 15 minutes (brute force protection)

### JWT Tokens
- **Access Token**: 15 minutes expiry (configurable)
- **Refresh Token**: 7 days expiry (configurable)
- Tokens are stored and validated against database

### IP Protection
- Automatic tracking of all IPs
- Failed login attempt counting
- Auto-block after 10 failed attempts
- Manual block/unblock via admin API

### Input Validation
- Express-validator on all user inputs
- Password strength requirements (min 8 chars, uppercase, lowercase, number)
- SQL injection prevention via parameterized queries
- XSS protection via Helmet headers

## 📊 Monitoring Dashboard

Access monitoring data via API:

```bash
# Get dashboard statistics
curl http://localhost:3003/monitoring/dashboard

# Get recent request logs
curl http://localhost:3003/monitoring/requests?limit=50

# Get active alerts
curl http://localhost:3003/monitoring/alerts?is_resolved=false

# Get blocked IPs
curl http://localhost:3003/monitoring/admin/ip-tracking?is_blocked=true
```

## 🗄️ Database Schema

### Tables
- `users` - User accounts with roles
- `refresh_tokens` - JWT refresh token storage
- `login_attempts` - Login activity tracking
- `items` - Sample data entities
- `activities` - User activity logs
- `audit_logs` - Detailed audit trail
- `request_logs` - HTTP request logs
- `activity_logs` - Activity tracking logs
- `alerts` - Security alerts
- `ip_tracking` - IP address monitoring
- `token_blacklist` - Revoked JWT tokens

### Default Admin User
- **Username**: `admin`
- **Password**: `Admin123!`
- ⚠️ **Change this in production!**

## 🔧 Environment Variables

See `.env.example` for all available configuration options.

Key configurations:
- `JWT_SECRET` - Secret key for JWT signing
- `DB_*` - Database connection settings
- `REDIS_*` - Redis connection settings
- `RATE_LIMIT_*` - Rate limiting settings
- `BRUTE_FORCE_*` - Brute force protection settings

## 🐳 Docker Services

| Service | Container Name | Port | Description |
|---------|---------------|------|-------------|
| PostgreSQL | secure-gateway-db | 5432 | Database |
| Redis | secure-gateway-redis | 6379 | Cache & Sessions |
| Gateway | secure-gateway-api | 3000 | API Gateway |
| Auth | secure-gateway-auth | 3001 | Authentication Service |
| Data | secure-gateway-data | 3002 | Data Service |
| Monitoring | secure-gateway-monitoring | 3003 | Monitoring Service |

## 📝 Development Workflow

1. **Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make Changes & Test**
```bash
npm test
```

3. **Run with Docker**
```bash
npm run docker:build
```

4. **Check Logs**
```bash
docker-compose logs -f gateway
docker-compose logs -f auth-service
```

## 🚨 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# View database logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d
```

### Redis Connection Issues
```bash
# Check Redis status
docker-compose logs redis

# Restart Redis
docker-compose restart redis
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

## 📚 Project Structure

```
Secure API Gateway + Monitoring/
├── gateway/                    # API Gateway
│   ├── src/
│   │   ├── index.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── rateLimiter.js
│   │   │   ├── rbac.js
│   │   │   ├── logger.js
│   │   │   └── proxy.js
│   │   └── routes/
│   │       └── index.js
│   ├── Dockerfile
│   └── package.json
├── services/
│   ├── auth/                  # Authentication Service
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   ├── db/
│   │   │   └── utils/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── data/                  # Data Service
│       ├── src/
│       │   ├── index.js
│       │   ├── controllers/
│       │   ├── routes/
│       │   ├── middleware/
│       │   └── db/
│       ├── Dockerfile
│       └── package.json
├── monitoring/                # Monitoring Service
│   ├── src/
│   │   ├── index.js
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── db/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
├── .gitignore
└── package.json
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - feel free to use this project for learning and production.

## 🔒 Security Notes

- ⚠️ Change all default secrets in production
- ⚠️ Use strong passwords for database and Redis
- ⚠️ Enable HTTPS in production
- ⚠️ Regularly update dependencies
- ⚠️ Monitor logs and alerts regularly

---

**Built with ❤️ using Node.js, Express, PostgreSQL, and Redis**
