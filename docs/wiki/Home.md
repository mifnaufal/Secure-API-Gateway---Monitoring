# Secure API Gateway + Monitoring

> Production-ready microservices API gateway with authentication, monitoring, and real-time dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-%E2%9C%93-blue.svg)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-15+-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/redis-7+-red.svg)](https://redis.io/)

---

## Overview

A complete, production-ready API Gateway + Monitoring system built with Node.js, featuring:

- 🔐 **Authentication** - JWT-based with RBAC
- 🛡️ **Security** - Rate limiting, IP tracking, brute force protection
- 📊 **Monitoring** - Real-time analytics and anomaly detection
- 🚨 **Alerts** - Automatic detection with webhook/email notifications
- 🎨 **Dashboard** - Beautiful web UI for monitoring
- 🐳 **Docker** - Easy deployment with Docker Compose

## Quick Links

| Resource | Description |
|----------|-------------|
| [[Getting Started\|Getting-Started]] | Setup and first steps |
| [[API Reference\|API-Reference]] | Complete API documentation |
| [[Security Features\|Security]] | Security layers and best practices |
| [[Deployment Guide\|Deployment]] | Production deployment instructions |
| [[Troubleshooting\|Troubleshooting]] | Common issues and solutions |

## System Architecture

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
PostgreSQL + Redis
```

## Features

### Core System
- ✅ API Gateway with centralized routing
- ✅ Microservices architecture
- ✅ REST API design
- ✅ PostgreSQL integration
- ✅ Redis caching with auto-invalidation

### Security
- ✅ JWT authentication
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting (anti brute force)
- ✅ IP tracking and auto-blocking
- ✅ Input validation
- ✅ Security headers (Helmet)

### Monitoring & Alerts
- ✅ Request logging
- ✅ Activity tracking
- ✅ Traffic anomaly detection
- ✅ 11 types of security alerts
- ✅ Webhook notifications (Slack/Discord)
- ✅ Email alerts (SMTP)
- ✅ Background monitoring workers

### DevOps
- ✅ Docker Compose orchestration
- ✅ GitHub Actions CI/CD
- ✅ Health checks
- ✅ Auto database migrations
- ✅ Makefile for common operations

## Dashboard

A beautiful, production-ready web dashboard is included:

- **Overview** - Real-time stats and charts
- **Anomaly Analysis** - Traffic pattern detection
- **Alerts** - Security alert management
- **IP Tracking** - Monitor and block IPs
- **Request Logs** - Browse HTTP logs

Access at: `http://localhost:3004`

## Installation

### With Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/secure-api-gateway.git
cd secure-api-gateway

# Build and start
sudo docker compose up -d --build

# Start dashboard
cd dashboard && node server.js

# Open browser
http://localhost:3004
```

### Manual Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Run all services
npm run dev:all
```

## Default Credentials

- **Username**: `admin`
- **Password**: `Admin123!`

⚠️ **Change these in production!**

## Quick Commands

```bash
# Start all services
sudo docker compose up -d

# View logs
sudo docker compose logs -f

# Stop all services
sudo docker compose down

# Run test requests
node test-requests.js

# Make commands
make install        # Install dependencies
make docker-build   # Build and start
make status         # Check health
make test           # Run tests
```

## Project Structure

```
├── gateway/              # API Gateway
├── services/
│   ├── auth/            # Authentication service
│   └── data/            # Data service
├── monitoring/          # Monitoring & analytics
├── dashboard/           # Web frontend
├── docs/wiki/           # Documentation
├── docker-compose.yml   # Docker orchestration
└── Makefile             # Helper commands
```

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| Frontend | Vanilla JS + Chart.js |
| Container | Docker + Compose |
| CI/CD | GitHub Actions |

## Documentation

- **[[Getting Started\|Getting-Started]]** - Setup and quick start
- **[[API Reference\|API-Reference]]** - Complete API docs
- **[[Security Features\|Security]]** - Security documentation
- **[[Deployment Guide\|Deployment]]** - Production deployment
- **[[Troubleshooting\|Troubleshooting]]** - Common issues

## Contributing

We welcome contributions! See our [[Contributing Guide|../CONTRIBUTING.md]] for details.

## License

MIT License - See [LICENSE](../LICENSE) file for details.

## Support

- 🐛 [Report a bug](https://github.com/YOUR_USERNAME/secure-api-gateway/issues)
- 💡 [Request a feature](https://github.com/YOUR_USERNAME/secure-api-gateway/issues)
- 💬 [Ask a question](https://github.com/YOUR_USERNAME/secure-api-gateway/discussions)

---

**Built with ❤️ using Node.js, Express, PostgreSQL, and Redis**
