# Deployment Guide

This guide covers deploying the Secure API Gateway + Monitoring to production.

## Prerequisites

- Docker & Docker Compose
- Domain name (optional, for HTTPS)
- SSL certificates (for production)
- SMTP server (for email alerts)
- Webhook URL (optional, for notifications)

---

## Docker Deployment (Recommended)

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/secure-api-gateway.git
cd secure-api-gateway
```

### 2. Configure Environment

Create `.env` file with production values:

```bash
cp .env.example .env
```

**Critical changes for production:**

```env
# Change JWT secret to strong random string
JWT_SECRET=$(openssl rand -base64 64)

# Strong database password
DB_PASSWORD=<generate-strong-password>

# Strong Redis password
REDIS_PASSWORD=<generate-strong-password>

# Update monitoring URLs to production domain
MONITORING_SERVICE_URL=https://your-domain.com/monitoring
```

### 3. Deploy

```bash
sudo docker compose up -d --build
```

### 4. Verify

```bash
# Check all services
sudo docker compose ps

# Test health endpoints
curl https://your-domain.com:3000/health
curl https://your-domain.com:3001/health
curl https://your-domain.com:3002/health
curl https://your-domain.com:3003/health
```

---

## Production Configuration

### Environment Variables

**Must change in production:**

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | JWT signing key | Random 64+ chars |
| `DB_PASSWORD` | Database password | Strong password |
| `REDIS_PASSWORD` | Redis password | Strong password |
| `WEBHOOK_URL` | Notification endpoint | Slack webhook URL |
| `SMTP_*` | Email configuration | Your SMTP details |

### Docker Compose Modifications

For production, update `docker-compose.yml`:

```yaml
services:
  gateway:
    ports:
      - "443:3000"  # Use HTTPS port
    environment:
      - NODE_ENV=production
```

---

## HTTPS Setup

### Option 1: Reverse Proxy with Nginx

1. Install Nginx:
```bash
sudo apt install nginx
```

2. Configure Nginx:
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Option 2: Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## Cloud Deployment

### AWS ECS

1. Build images:
```bash
sudo docker compose build
```

2. Push to ECR:
```bash
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
docker tag gateway <account>.dkr.ecr.<region>.amazonaws.com/gateway
docker push <account>.dkr.ecr.<region>.amazonaws.com/gateway
```

3. Deploy via ECS console or CLI

### DigitalOcean

1. Create Droplet with Docker
2. Clone repository
3. Run `sudo docker compose up -d`
4. Configure firewall rules

### Heroku

Not recommended (requires PostgreSQL add-on and Redis add-on)

---

## Monitoring Setup

### Configure Alerts

Add to `.env`:

```env
# Slack notifications
WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK
WEBHOOK_SECRET=your-secret

# Email notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ALERT_EMAIL=admin@your-domain.com
```

### Dashboard Access

For production, consider:
- Adding authentication to dashboard
- Restricting access by IP
- Using VPN for internal access

---

## Backup Strategy

### Database Backup

```bash
# Backup
docker exec secure-gateway-db pg_dump -U postgres secure_gateway > backup.sql

# Restore
docker exec -i secure-gateway-db psql -U postgres secure_gateway < backup.sql
```

### Automated Backups

Add to cron:
```bash
0 2 * * * docker exec secure-gateway-db pg_dump -U postgres secure_gateway > /backups/db-$(date +\%Y\%m\%d).sql
```

---

## Scaling

### Horizontal Scaling

- Gateway: Can run multiple instances behind load balancer
- Services: Stateless, can scale independently
- Database: Use read replicas for read-heavy workloads
- Redis: Use Redis Cluster for high availability

### Resource Requirements

| Component | Min RAM | Min CPU |
|-----------|---------|---------|
| Gateway | 256 MB | 0.5 core |
| Auth Service | 256 MB | 0.5 core |
| Data Service | 256 MB | 0.5 core |
| Monitoring | 512 MB | 0.5 core |
| PostgreSQL | 1 GB | 1 core |
| Redis | 256 MB | 0.25 core |
| **Total** | **~2.5 GB** | **~3 cores** |

---

## CI/CD Pipeline

GitHub Actions workflow included:

- Automated testing on push
- Docker image building
- Production deployment via SSH

Configure secrets in repository:
- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`
- `SLACK_WEBHOOK` (optional)

---

## Post-Deployment Checklist

- [ ] All services healthy
- [ ] HTTPS configured
- [ ] Default admin password changed
- [ ] Monitoring alerts configured
- [ ] Backups scheduled
- [ ] Logs reviewed
- [ ] Rate limits tested
- [ ] Firewall rules set
- [ ] SSL certificate auto-renewal configured
- [ ] Documentation updated

---

For troubleshooting, see [[Troubleshooting]].
