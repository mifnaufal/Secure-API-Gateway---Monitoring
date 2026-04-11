# Getting Started

Welcome to the **Secure API Gateway + Monitoring** project! This guide will help you get up and running quickly.

## Quick Start (5 Minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/secure-api-gateway.git
cd secure-api-gateway
```

### 2. Start with Docker

```bash
# Build and start all services
sudo docker compose up -d --build

# Wait for services to be ready
sleep 20

# Verify all services are healthy
sudo docker compose ps
```

### 3. Start the Dashboard

```bash
# Open a new terminal
cd dashboard
node server.js
```

### 4. Open Your Browser

Navigate to: **http://localhost:3004**

**Done!** 🎉 You now have a fully functional API Gateway with monitoring dashboard.

---

## Default Credentials

### Admin Account
- **Username**: `admin`
- **Password**: `Admin123!`
- **Role**: Admin

⚠️ **Important**: Change these credentials in production!

---

## Available Services

| Service | Port | Purpose |
|---------|------|---------|
| **API Gateway** | 3000 | Main entry point for all requests |
| **Auth Service** | 3001 | Authentication & authorization |
| **Data Service** | 3002 | Data management & CRUD operations |
| **Monitoring** | 3003 | Logging, analytics & alerts |
| **Dashboard** | 3004 | Web UI for monitoring |
| **PostgreSQL** | 5432 | Database |
| **Redis** | 6379 | Caching |

---

## First Steps

### 1. Test the API

```bash
# Check health
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!"}'
```

### 2. Explore the Dashboard

- **Dashboard**: Overview statistics and charts
- **Anomaly Analysis**: Detect traffic anomalies
- **Alerts**: View and manage security alerts
- **IP Tracking**: Monitor and block suspicious IPs
- **Request Logs**: Browse HTTP request history

### 3. Run Test Requests

Generate sample traffic with our test script:

```bash
node test-requests.js
```

This will create 40 requests including:
- 15 normal requests
- 15 suspicious requests
- 10 dangerous requests

---

## Next Steps

- Read the [[API Documentation|API-Reference]] for endpoint details
- Learn about [[Security Features|Security]]
- Explore [[Configuration Options|Configuration]]
- Check [[Troubleshooting]] guide if you encounter issues

---

## Need Help?

- 📖 Check our [[FAQ]]
- 🐛 Report issues on GitHub
- 💬 Open a discussion for questions
