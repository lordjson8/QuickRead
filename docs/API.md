# API Documentation

## API Client

The application uses a centralized API client (`services/api.client.ts`) for all HTTP requests.

### Features

- Automatic authentication header injection
- Request/response interceptors
- Error handling and transformation
- Retry logic for failed requests
- Request timeout configuration
- Type-safe responses

### Usage

```typescript
import { apiClient } from '@/services/api.client';
import { ApiResponse } from '@/types';

// GET request
const response = await apiClient.get<User>('/users/me');
console.log(response.data);

// POST request
const response = await apiClient.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com',
});

// PUT request
const response = await apiClient.put<User>('/users/123', {
  name: 'Jane Doe',
});

// DELETE request
const response = await apiClient.delete('/users/123');
```

### Error Handling

All API errors are caught and transformed into a standardized format:

```typescript
interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
}
```

Example error handling:

```typescript
try {
  const response = await apiClient.get('/users/me');
} catch (error) {
  const apiError = error as ApiError;
  
  switch (apiError.status) {
    case 401:
      // Handle unauthorized
      break;
    case 404:
      // Handle not found
      break;
    case 500:
      // Handle server error
      break;
    default:
      // Handle other errors
  }
}
```

## Authentication API

### Google OAuth

**Endpoint:** `https://www.googleapis.com/oauth2/v3/userinfo`

**Method:** GET

**Headers:**
```
Authorization: Bearer {accessToken}
```
**Response:**
```typescript
interface GoogleUserInfo {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale?: string;
}
```

### Facebook OAuth

**Endpoint:** `https://graph.facebook.com/me`

**Method:** GET

**Query Parameters:**
- `fields`: id,name,email,picture.type(large)
- `access_token`: {accessToken}

**Response:**
```typescript
interface FacebookUserInfo {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      height: number;
      is_silhouette: boolean;
      url: string;
      width: number;
    };
  };
}
```

## Backend API Endpoints

*(Note: These are placeholder endpoints. Update with your actual API)*

### Base URL

```
Development: http://localhost:3000
Production: https://api.quickread.com
```

### Authentication

#### POST /auth/login
Authenticate user with OAuth token

**Request:**
```json
{
  "provider": "google" | "facebook",
  "accessToken": "string",
  "userInfo": {
    "name": "string",
    "email": "string"
  }
}
```

**Response:**
```json
{
  "token": "string",
  "refreshToken": "string",
  "expiresIn": 3600,
  "user": {
    "id": "string",
    "name": "string",
    "email": "string"
  }
}
```

#### POST /auth/refresh
Refresh authentication token

**Request:**
```json
{
  "refreshToken": "string"
}
```

**Response:**
```json
{
  "token": "string",
  "expiresIn": 3600
}
```

#### POST /auth/logout
Logout user

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### User

#### GET /users/me
Get current user profile

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "avatar": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### PUT /users/me
Update current user profile

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "name": "string",
  "avatar": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "avatar": "string"
}
```

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authenticated requests:** 1000 requests per hour
- **Unauthenticated requests:** 100 requests per hour

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000
```

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `perPage`: Items per page (default: 20, max: 100)

**Response:**
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable - Temporary issue |

## Webhooks

*(Coming soon)*

## API Versioning

The API uses URL-based versioning:

```
https://api.quickread.com/v1/users/me
```

Current version: **v1**