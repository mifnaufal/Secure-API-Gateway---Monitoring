# API Reference

Complete API documentation for the Secure API Gateway + Monitoring system.

## Base URL

```
http://localhost:3000/api
```

---

## Authentication Endpoints

### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user"
  },
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci..."
}
```

**Validation Rules:**
- `username`: 3-30 characters
- `email`: Valid email format
- `password`: Min 8 chars, uppercase, lowercase, number

---

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "role": "user"
  },
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci..."
}
```

⚠️ **Rate Limit**: 5 failed attempts per 15 minutes

---

### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "token": "refresh-token-here"
}
```

---

### Get Profile

```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

---

### Change Password

```http
POST /api/auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass456!"
}
```

---

## Data Endpoints

### Get Items

```http
GET /api/data?limit=20&offset=0&category=electronics
Authorization: Bearer <access_token>
```

---

### Create Item

```http
POST /api/data
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Laptop Pro",
  "description": "High-performance laptop",
  "category": "electronics",
  "price": 999.99
}
```

---

### Update Item

```http
PUT /api/data/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 899.99
}
```

---

### Delete Item

```http
DELETE /api/data/:id
Authorization: Bearer <access_token>
```

---

## Monitoring Endpoints

### Dashboard Statistics

```http
GET /api/monitoring/dashboard
```

**Response:**
```json
{
  "data": {
    "totalRequests": 15234,
    "totalActivities": 3421,
    "totalAlerts": 45,
    "activeAlerts": 12,
    "blockedIPs": 5,
    "requestsByStatus": [...],
    "requestsByService": [...]
  }
}
```

---

### Get Alerts

```http
GET /api/monitoring/alerts?severity=critical&is_resolved=false
```

---

### Run Anomaly Detection

```http
GET /api/monitoring/anomaly/analyze
```

---

### Block IP

```http
PUT /api/monitoring/admin/ip-tracking/:ip/block
Content-Type: application/json

{
  "is_blocked": true,
  "reason": "Suspicious activity"
}
```

---

## Error Response Format

All errors follow this structure:

```json
{
  "error": {
    "message": "Human-readable message",
    "code": "ERROR_CODE"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `MISSING_TOKEN` | 401 | No authorization token |
| `TOKEN_EXPIRED` | 401 | JWT token expired |
| `INVALID_TOKEN` | 403 | Invalid token |
| `INVALID_CREDENTIALS` | 401 | Wrong username/password |
| `DUPLICATE_USER` | 409 | User already exists |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required role |
| `ITEM_NOT_FOUND` | 404 | Item doesn't exist |
| `SERVICE_UNAVAILABLE` | 502 | Backend service down |

---

## Rate Limits

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| General | 100 requests | 15 minutes |
| Authentication | 5 failed attempts | 15 minutes |

---

For more details, see [[Getting Started]] and [[Security Features]].
