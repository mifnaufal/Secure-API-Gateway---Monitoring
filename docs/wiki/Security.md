# Security Features

This project implements multiple security layers to protect your API infrastructure.

## Authentication & Authorization

### JWT Tokens

- **Access Token**: Short-lived (15 min default)
- **Refresh Token**: Long-lived (7 days default)
- **Storage**: Database-backed with revocation support
- **Algorithm**: HS256

### Role-Based Access Control (RBAC)

Three roles available:

| Role | Permissions |
|------|-------------|
| **User** | Access own data, basic operations |
| **Manager** | User permissions + data management |
| **Admin** | Full access including monitoring & IP management |

### Token Management

- Automatic expiry handling
- Token rotation on refresh
- Revocation on logout
- Blacklist for compromised tokens

---

## Rate Limiting

### General Rate Limiter

- **Limit**: 100 requests per 15 minutes
- **Scope**: Per IP address
- **Headers**: Returns `RateLimit-*` headers

### Authentication Rate Limiter

- **Limit**: 5 failed attempts per 15 minutes
- **Scope**: Per IP address
- **Smart**: Skips successful logins

### Rate Limit Responses

When limit exceeded:

```json
{
  "error": {
    "message": "Too many requests",
    "code": "RATE_LIMIT_EXCEEDED"
  }
}
```

HTTP Status: `429 Too Many Requests`

---

## IP Protection

### Automatic Tracking

All IP addresses are tracked:
- First/last seen timestamps
- Total request count
- Failed login attempts

### Auto-Block System

- **Threshold**: 10 failed login attempts
- **Action**: Automatic IP block
- **Alert**: Critical severity alert generated

### Manual IP Management

Admin can:
- View all tracked IPs
- Block suspicious IPs manually
- Unblock IPs when safe
- Set custom block reasons

---

## Input Validation

### Password Requirements

Minimum strength requirements:
- 8+ characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Request Validation

All user inputs validated with:
- **Length checks**
- **Format validation** (email, etc.)
- **Type checking**
- **Sanitization** (escape HTML, normalize email)

### SQL Injection Prevention

- Parameterized queries only
- No string concatenation
- ORM-style query building

### XSS Protection

- Helmet security headers
- Input sanitization
- Output encoding

---

## Alert System

### Automatic Detection

The system monitors and alerts on:

| Alert Type | Severity | Trigger |
|-----------|----------|---------|
| Brute Force | CRITICAL | 10+ failed logins |
| Request Spike | WARNING | Unusual traffic increase |
| Error Spike | CRITICAL | Surge in errors |
| Service Down | CRITICAL | Backend unreachable |
| IP Flooding | CRITICAL | Excessive requests from one IP |
| Token Abuse | WARNING | Repeated invalid tokens |
| Endpoint Abuse | WARNING | Spam on specific endpoint |
| Off-Hours Activity | INFO | Unusual time patterns |

### Notifications

Critical alerts can trigger:
- **Webhook** (Slack, Discord, etc.)
- **Email** (SMTP)
- **Database** (always logged)

---

## Security Headers

All responses include:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security`
- `Content-Security-Policy`
- And more (via Helmet)

---

## Best Practices Implemented

✅ Password hashing with bcrypt (12 rounds)
✅ HTTPS ready (configure in production)
✅ CORS protection
✅ Request body size limits
✅ Connection pooling with timeouts
✅ Graceful error handling
✅ No sensitive data in logs
✅ Environment-based configuration
✅ Docker security best practices

---

## Production Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to strong random string
- [ ] Update admin password
- [ ] Use strong database passwords
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS origins
- [ ] Set up monitoring alerts
- [ ] Configure webhook/email notifications
- [ ] Regular dependency updates
- [ ] Enable audit logging
- [ ] Set up backups

---

For more information, see [[Getting Started]] and [[Configuration]].
