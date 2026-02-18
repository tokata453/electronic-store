# 🚀 iCE Electronics API Documentation

Complete REST API for e-commerce platform.

---

## 📚 Base URL

```
http://localhost:5000/api
```

---

## 🔐 Authentication

Most endpoints require authentication via JWT token.

### How to Authenticate:

1. Register or login to get a token
2. Include token in Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📋 API Endpoints

### 🔐 Authentication (`/api/auth`)

#### Register New User
```http
POST /api/auth/register
```

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+855123456789"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 5,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### Login
```http
POST /api/auth/login
```

**Body:**
```json
{
  "email": "admin@iceelectronics.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@iceelectronics.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@iceelectronics.com",
      "role": "admin"
    }
  }
}
```

---

### 📦 Products (`/api/products`)

#### Get All Products
```http
GET /api/products
```

**Query Parameters:**
- `search` - Search by name or description
- `categoryId` - Filter by category
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `badge` - Filter by badge (Hot, Sale, New, Featured)
- `isFeatured` - true/false
- `sortBy` - Sort field (default: createdAt)
- `order` - ASC/DESC (default: DESC)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Example:**
```http
GET /api/products?categoryId=1&minPrice=100&maxPrice=1000&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "iPhone 15 Pro",
        "slug": "iphone-15-pro",
        "price": 999.99,
        "salePrice": 899.99,
        "category": {
          "id": 1,
          "name": "Smartphones",
          "slug": "smartphones"
        }
      }
    ],
    "pagination": {
      "total": 20,
      "page": 1,
      "pages": 2,
      "limit": 10
    }
  }
}
```

---

#### Get Single Product
```http
GET /api/products/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": 1,
      "name": "iPhone 15 Pro",
      "description": "The most powerful iPhone ever...",
      "price": 999.99,
      "salePrice": 899.99,
      "stock": 45,
      "images": ["/images/products/iphone-15-pro-1.jpg"],
      "specifications": {
        "display": "6.1-inch Super Retina XDR",
        "processor": "A17 Pro chip"
      },
      "category": {
        "id": 1,
        "name": "Smartphones"
      }
    }
  }
}
```

---

#### Create Product (Admin Only)
```http
POST /api/products
Authorization: Bearer ADMIN_TOKEN
```

**Body:**
```json
{
  "name": "New Product",
  "slug": "new-product",
  "description": "Product description",
  "price": 499.99,
  "salePrice": 449.99,
  "sku": "PROD-001",
  "stock": 100,
  "categoryId": 1,
  "images": ["/images/product-1.jpg"],
  "badge": "New",
  "isFeatured": true
}
```

---

#### Update Product (Admin Only)
```http
PUT /api/products/:id
Authorization: Bearer ADMIN_TOKEN
```

---

#### Delete Product (Admin Only)
```http
DELETE /api/products/:id
Authorization: Bearer ADMIN_TOKEN
```

---

### 📁 Categories (`/api/categories`)

#### Get All Categories
```http
GET /api/categories
```

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Smartphones",
        "slug": "smartphones",
        "description": "Latest smartphones...",
        "icon": "📱",
        "sortOrder": 1
      }
    ]
  }
}
```

---

#### Get Category with Products
```http
GET /api/categories/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "category": {
      "id": 1,
      "name": "Smartphones",
      "products": [
        {
          "id": 1,
          "name": "iPhone 15 Pro",
          "price": 999.99
        }
      ]
    }
  }
}
```

---

#### Create Category (Admin Only)
```http
POST /api/categories
Authorization: Bearer ADMIN_TOKEN
```

**Body:**
```json
{
  "name": "New Category",
  "slug": "new-category",
  "description": "Category description",
  "icon": "🎮",
  "sortOrder": 10
}
```

---

### 🛒 Orders (`/api/orders`)

#### Create Order
```http
POST /api/orders
Authorization: Bearer YOUR_TOKEN
```

**Body:**
```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 5,
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "Phnom Penh",
    "country": "Cambodia",
    "zipCode": "12000",
    "phone": "+855123456789"
  },
  "paymentMethod": "credit_card",
  "notes": "Please call before delivery"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": 6,
      "orderNumber": "ORD-1771154000123-5",
      "totalAmount": 2799.97,
      "status": "pending",
      "items": [
        {
          "productId": 1,
          "productName": "iPhone 15 Pro",
          "quantity": 2,
          "price": 899.99,
          "totalPrice": 1799.98
        }
      ]
    }
  }
}
```

---

#### Get User's Orders
```http
GET /api/orders
Authorization: Bearer YOUR_TOKEN
```

---

#### Get Single Order
```http
GET /api/orders/:id
Authorization: Bearer YOUR_TOKEN
```

---

#### Update Order Status (Admin Only)
```http
PUT /api/orders/:id/status
Authorization: Bearer ADMIN_TOKEN
```

**Body:**
```json
{
  "status": "shipped",
  "trackingNumber": "TRACK123456"
}
```

---

#### Get All Orders (Admin Only)
```http
GET /api/orders/admin/all?status=pending&page=1&limit=20
Authorization: Bearer ADMIN_TOKEN
```

---

### 👤 Users (`/api/users`)

#### Get Profile
```http
GET /api/users/profile
Authorization: Bearer YOUR_TOKEN
```

---

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer YOUR_TOKEN
```

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+855987654321",
  "address": {
    "street": "456 New St",
    "city": "Phnom Penh",
    "country": "Cambodia"
  }
}
```

---

#### Change Password
```http
PUT /api/users/password
Authorization: Bearer YOUR_TOKEN
```

**Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

---

## 🔒 Authorization Levels

| Endpoint | Access Level |
|----------|-------------|
| POST /api/auth/register | Public |
| POST /api/auth/login | Public |
| GET /api/auth/me | Authenticated |
| GET /api/products | Public |
| POST /api/products | Admin |
| PUT /api/products/:id | Admin |
| DELETE /api/products/:id | Admin |
| GET /api/categories | Public |
| POST /api/categories | Admin |
| POST /api/orders | Authenticated |
| GET /api/orders | Authenticated (own orders) |
| PUT /api/orders/:id/status | Admin |
| GET /api/orders/admin/all | Admin |
| GET /api/users/profile | Authenticated |
| PUT /api/users/profile | Authenticated |

---

## 🧪 Testing

### Test Accounts (from seeders):

**Admin:**
```
Email: admin@iceelectronics.com
Password: password123
```

**Customers:**
```
Email: sokha@example.com
Password: password123

Email: dara@example.com
Password: password123
```

---

## 🚨 Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error message here",
    "status": 400
  }
}
```

**Common Status Codes:**
- 200 - Success
- 201 - Created
- 400 - Bad Request (validation error)
- 401 - Unauthorized (not logged in)
- 403 - Forbidden (not admin)
- 404 - Not Found
- 500 - Server Error

---

## 💡 Tips

1. **Always include JWT token** for protected routes
2. **Check response format** - all responses have `success` field
3. **Use pagination** for large lists
4. **Filter products** using query parameters
5. **Admin routes** require admin role

---

## 🎯 Quick Start

1. Start server: `npm run dev`
2. Login: `POST /api/auth/login`
3. Copy token from response
4. Use token in Authorization header: `Bearer YOUR_TOKEN`
5. Make requests to protected endpoints!

---

**Happy coding! 🚀**
