# API Documentation

Complete API reference for the Secure API Gateway + Monitoring System.

## Base URL
```
http://localhost:3000/api
```

## Authentication

Most endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <access_token>
```

---

## 🔐 Authentication Endpoints

### Register New User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Secure123!"
}
```

**Validation Rules:**
- `username`: 3-30 characters
- `email`: Valid email format
- `password`: Min 8 chars, must contain uppercase, lowercase, and number

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

**Error (409):**
```json
{
  "error": {
    "message": "Username or email already exists",
    "code": "DUPLICATE_USER"
  }
}
```

---

### Login
**POST** `/auth/login`

Authenticate and receive tokens.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "Secure123!"
}
```

**Response (200):**
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

**Error (401):**
```json
{
  "error": {
    "message": "Invalid credentials",
    "code": "INVALID_CREDENTIALS"
  }
}
```

**⚠️ Rate Limit:** 5 failed attempts per 15 minutes

---

### Refresh Token
**POST** `/auth/refresh`

Get new access token using refresh token.

**Request Body:**
```json
{
  "token": "eyJhbGci..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci..."
}
```

**Error (401):**
```json
{
  "error": {
    "message": "Refresh token expired",
    "code": "TOKEN_EXPIRED"
  }
}
```

---

### Logout
**POST** `/auth/logout`

**Auth Required:** ✅

Invalidate all tokens for the current user.

**Request Body:**
```json
{
  "token": "eyJhbGci..."
}
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### Get Profile
**GET** `/auth/me`

**Auth Required:** ✅

Get current user's profile.

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "created_at": "2024-01-01T00:00:00.000Z",
    "last_login": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### Change Password
**POST** `/auth/change-password`

**Auth Required:** ✅

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecure456!"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

**Error (401):**
```json
{
  "error": {
    "message": "Current password is incorrect",
    "code": "INVALID_PASSWORD"
  }
}
```

---

## 📦 Data Endpoints

### Get Items
**GET** `/data`

**Auth Required:** ✅

Get paginated list of items with filtering.

**Query Parameters:**
- `limit` (default: 20)
- `offset` (default: 0)
- `category` - Filter by category
- `search` - Search in name and description
- `sort` (default: created_at)
- `order` - ASC or DESC (default: DESC)

**Example:**
```
GET /data?limit=10&offset=0&category=electronics&search=laptop
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Laptop Pro",
      "description": "High-performance laptop",
      "category": "electronics",
      "price": 999.99,
      "created_by": "uuid",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 10,
    "offset": 0
  }
}
```

---

### Get Item by ID
**GET** `/data/:id`

**Auth Required:** ✅

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "name": "Laptop Pro",
    "description": "High-performance laptop",
    "category": "electronics",
    "price": 999.99,
    "created_by": "uuid",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error (404):**
```json
{
  "error": {
    "message": "Item not found",
    "code": "ITEM_NOT_FOUND"
  }
}
```

---

### Create Item
**POST** `/data`

**Auth Required:** ✅

**Request Body:**
```json
{
  "name": "New Item",
  "description": "Item description",
  "category": "electronics",
  "price": 199.99
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "name": "New Item",
    "description": "Item description",
    "category": "electronics",
    "price": 199.99,
    "created_by": "uuid",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Update Item
**PUT** `/data/:id`

**Auth Required:** ✅

Update specific fields (partial update).

**Request Body:**
```json
{
  "name": "Updated Name",
  "price": 299.99
}
```

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "name": "Updated Name",
    "description": "Item description",
    "category": "electronics",
    "price": 299.99,
    "created_by": "uuid",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### Delete Item
**DELETE** `/data/:id`

**Auth Required:** ✅

Soft delete an item.

**Response (200):**
```json
{
  "message": "Item deleted successfully"
}
```

---

### Get Activities
**GET** `/data/activities`

**Auth Required:** ✅

Get activity logs for data operations.

**Query Parameters:**
- `limit` (default: 50)
- `offset` (default: 0)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "action": "create_item",
      "resource_type": "item",
      "resource_id": "uuid",
      "details": { "name": "Laptop", "category": "electronics" },
      "ip_address": "192.168.1.1",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 📊 Monitoring Endpoints

### Get Dashboard Statistics
**GET** `/monitoring/dashboard`

Get comprehensive monitoring metrics.

**Response (200):**
```json
{
  "data": {
    "totalRequests": 15234,
    "totalActivities": 3421,
    "totalAlerts": 45,
    "activeAlerts": 12,
    "blockedIPs": 5,
    "requestsByStatus": [
      { "status_code": 200, "count": 12000 },
      { "status_code": 404, "count": 2000 }
    ],
    "requestsByService": [
      { "service": "auth", "count": 8000 },
      { "service": "data", "count": 7234 }
    ],
    "recentActivities": [
      { "action": "login", "count": 150 },
      { "action": "create_item", "count": 80 }
    ]
  }
}
```

---

### Get Request Logs
**GET** `/monitoring/requests`

Get HTTP request logs with filtering.

**Query Parameters:**
- `limit` (default: 100)
- `offset` (default: 0)
- `status_code` - Filter by HTTP status
- `service` - Filter by service name
- `user_id` - Filter by user
- `start_date` - ISO date string
- `end_date` - ISO date string

**Example:**
```
GET /monitoring/requests?status_code=401&limit=50
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "request_id": "uuid",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "method": "POST",
      "url": "/api/auth/login",
      "status_code": 401,
      "duration": "45ms",
      "ip": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "user_id": null,
      "service": "gateway"
    }
  ]
}
```

---

### Get Activity Logs
**GET** `/monitoring/activities`

Get user activity logs.

**Query Parameters:**
- `limit` (default: 100)
- `offset` (default: 0)
- `action` - Filter by action type
- `user_id` - Filter by user
- `success` - true or false
- `start_date` - ISO date string
- `end_date` - ISO date string

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "action": "login",
      "user_id": "uuid",
      "ip": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "success": true,
      "service": "auth"
    }
  ]
}
```

---

### Get Alerts
**GET** `/monitoring/alerts`

Get security alerts.

**Query Parameters:**
- `limit` (default: 50)
- `offset` (default: 0)
- `severity` - info, warning, critical
- `type` - Filter by alert type
- `is_resolved` - true or false

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "brute_force_detected",
      "severity": "critical",
      "message": "IP 192.168.1.100 blocked due to multiple failed login attempts",
      "details": { "failedAttempts": 15 },
      "ip": "192.168.1.100",
      "user_id": null,
      "is_resolved": false,
      "created_at": "2024-01-01T00:00:00.000Z",
      "resolved_at": null
    }
  ]
}
```

---

### Resolve Alert
**PUT** `/monitoring/alerts/:id/resolve`

Mark an alert as resolved.

**Response (200):**
```json
{
  "message": "Alert resolved"
}
```

---

## 🔧 Admin Endpoints

### Get IP Tracking
**GET** `/monitoring/admin/ip-tracking`

Track all IP addresses with activity metrics.

**Query Parameters:**
- `limit` (default: 100)
- `offset` (default: 0)
- `is_blocked` - true or false

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "ip": "192.168.1.100",
      "first_seen": "2024-01-01T00:00:00.000Z",
      "last_seen": "2024-01-01T12:00:00.000Z",
      "request_count": 250,
      "failed_login_count": 3,
      "is_blocked": false,
      "block_reason": null,
      "blocked_at": null
    }
  ]
}
```

---

### Block/Unblock IP
**PUT** `/monitoring/admin/ip-tracking/:ip/block`

**Request Body:**
```json
{
  "is_blocked": true,
  "reason": "Suspicious activity"
}
```

**Response (200):**
```json
{
  "message": "IP blocked"
}
```

To unblock:
```json
{
  "is_blocked": false
}
```

---

## ⚠️ Error Response Format

All errors follow this standard format:

```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `MISSING_TOKEN` | 401 | No authorization token provided |
| `TOKEN_EXPIRED` | 401 | JWT token has expired |
| `INVALID_TOKEN` | 403 | Invalid or malformed token |
| `INVALID_CREDENTIALS` | 401 | Wrong username or password |
| `DUPLICATE_USER` | 409 | Username/email already exists |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required role |
| `ITEM_NOT_FOUND` | 404 | Requested item doesn't exist |
| `SERVICE_UNAVAILABLE` | 502 | Backend service unreachable |

---

## 📈 Rate Limits

### General Endpoints
- **Window:** 15 minutes
- **Max Requests:** 100 per IP
- **Headers:** Returns `RateLimit-*` headers

### Authentication Endpoints
- **Window:** 15 minutes
- **Max Failed Attempts:** 5 per IP
- **Note:** Successful logins don't count toward limit

### Consequences
- HTTP 429 response when limit exceeded
- Automatic IP block after 10 failed login attempts
- Manual unblock via admin API

---

## 🔐 JWT Token Structure

### Access Token Payload
```json
{
  "id": "user-uuid",
  "username": "johndoe",
  "role": "user",
  "iat": 1704067200,
  "exp": 1704068100
}
```

### Refresh Token Payload
```json
{
  "id": "user-uuid",
  "type": "refresh",
  "iat": 1704067200,
  "exp": 1704672000
}
```

---

## 🎯 Role-Based Access Control

### Available Roles
- `user` - Standard user
- `manager` - Enhanced permissions
- `admin` - Full access

### Endpoint Permissions

| Endpoint | user | manager | admin |
|----------|------|---------|-------|
| `/auth/*` | ✅ | ✅ | ✅ |
| `/data` (read) | ✅ | ✅ | ✅ |
| `/data` (write) | ✅ | ✅ | ✅ |
| `/data` (delete) | ✅ | ✅ | ✅ |
| `/monitoring/*` | ❌ | ❌ | ✅ |
| `/admin/*` | ❌ | ❌ | ✅ |

---

## 📝 Best Practices

1. **Token Management**
   - Store tokens securely (not in localStorage for web apps)
   - Use refresh tokens to get new access tokens
   - Revoke tokens on logout

2. **Error Handling**
   - Check both HTTP status and error code
   - Display user-friendly messages based on error code

3. **Rate Limiting**
   - Implement exponential backoff on client side
   - Cache responses to reduce API calls

4. **Security**
   - Always use HTTPS in production
   - Validate all inputs client-side before sending
   - Keep passwords secure and change defaults

---

For more examples and use cases, see `QUICK_REFERENCE.md` and `README.md`.
