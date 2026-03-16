# 📚 E-COMMERCE API COMPLETE DOCUMENTATION

**Base URL:** `http://localhost:3001/api` or `https://your-domain.com/api`

**Version:** 1.0.0

**Last Updated:** March 2026

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Products](#products)
3. [Categories](#categories)
4. [Cart](#cart)
5. [Orders](#orders)
6. [Users](#users)
7. [Upload](#upload)
8. [Admin Analytics](#admin-analytics)
9. [Error Handling](#error-handling)
10. [Response Format](#response-format)

---

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Register User

**Endpoint:** `POST /api/auth/register`

**Access:** Public

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "+1234567890" // optional
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Login User

**Endpoint:** `POST /api/auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Get Current User

**Endpoint:** `GET /api/auth/me`

**Access:** Private

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "user"
    }
  }
}
```

---

### Google OAuth

**Endpoint:** `GET /api/auth/google`

**Access:** Public

**Description:** Initiates Google OAuth flow. Redirects to Google login page.

**Callback:** `GET /api/auth/google/callback`

**Success:** Redirects to frontend with token in URL query

---

### Facebook OAuth

**Endpoint:** `GET /api/auth/facebook`

**Access:** Public

**Description:** Initiates Facebook OAuth flow.

**Callback:** `GET /api/auth/facebook/callback`

---

## 📦 Products

### Get All Products

**Endpoint:** `GET /api/products`

**Access:** Public

**Query Parameters:**
```
?search=iphone
&categoryId=1
&minPrice=100
&maxPrice=1000
&badge=sale
&isFeatured=true
&sortBy=price
&order=ASC
&page=1
&limit=20
```

**Example Request:**
```
GET /api/products?search=laptop&categoryId=2&minPrice=500&maxPrice=2000&page=1&limit=12
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "MacBook Pro 16\"",
        "slug": "macbook-pro-16",
        "description": "Powerful laptop...",
        "price": 2499.00,
        "salePrice": 2299.00,
        "sku": "MBP16-2024",
        "stock": 25,
        "images": [
          "https://storage.url/image1.jpg",
          "https://storage.url/image2.jpg"
        ],
        "badge": "sale",
        "specifications": {
          "processor": "M3 Max",
          "ram": "32GB",
          "storage": "1TB SSD"
        },
        "isFeatured": true,
        "rating": 4.8,
        "reviewCount": 156,
        "category": {
          "id": 2,
          "name": "Laptops",
          "slug": "laptops"
        },
        "createdAt": "2024-03-01T10:00:00Z",
        "updatedAt": "2024-03-05T15:30:00Z"
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "pages": 4,
      "limit": 12
    }
  }
}
```

---

### Get Single Product

**Endpoint:** `GET /api/products/:id`

**Access:** Public

**Example:** `GET /api/products/macbook-pro-16` or `GET /api/products/1`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": 1,
      "name": "MacBook Pro 16\"",
      "slug": "macbook-pro-16",
      "description": "The most powerful MacBook Pro ever...",
      "price": 2499.00,
      "salePrice": 2299.00,
      "sku": "MBP16-2024",
      "stock": 25,
      "images": ["url1", "url2"],
      "badge": "sale",
      "specifications": {
        "processor": "M3 Max",
        "ram": "32GB",
        "storage": "1TB SSD",
        "display": "16-inch Liquid Retina XDR",
        "graphics": "40-core GPU"
      },
      "isFeatured": true,
      "rating": 4.8,
      "reviewCount": 156,
      "category": {
        "id": 2,
        "name": "Laptops",
        "slug": "laptops",
        "description": "High-performance laptops"
      },
      "createdAt": "2024-03-01T10:00:00Z",
      "updatedAt": "2024-03-05T15:30:00Z"
    }
  }
}
```

---

### Create Product

**Endpoint:** `POST /api/products`

**Access:** Private/Admin

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "name": "iPhone 15 Pro",
  "slug": "iphone-15-pro",
  "description": "The latest iPhone with A17 Pro chip",
  "price": 999.00,
  "salePrice": 899.00,
  "sku": "IPH15PRO-128",
  "stock": 50,
  "categoryId": 1,
  "images": [
    "https://storage.url/iphone-front.jpg",
    "https://storage.url/iphone-back.jpg"
  ],
  "badge": "new",
  "specifications": {
    "storage": "128GB",
    "color": "Titanium Blue",
    "camera": "48MP Main"
  },
  "isFeatured": true
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": 5,
      "name": "iPhone 15 Pro",
      "slug": "iphone-15-pro",
      "price": 999.00,
      "salePrice": 899.00,
      "stock": 50,
      "categoryId": 1,
      "images": ["..."],
      "badge": "new",
      "isFeatured": true,
      "createdAt": "2024-03-07T10:00:00Z"
    }
  }
}
```

---

### Update Product

**Endpoint:** `PUT /api/products/:id`

**Access:** Private/Admin

**Request Body:** (all fields optional)
```json
{
  "price": 949.00,
  "salePrice": 849.00,
  "stock": 45,
  "badge": "sale"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": 5,
      "name": "iPhone 15 Pro",
      "price": 949.00,
      "salePrice": 849.00,
      "stock": 45,
      "badge": "sale",
      "updatedAt": "2024-03-07T11:00:00Z"
    }
  }
}
```

---

### Delete Product

**Endpoint:** `DELETE /api/products/:id`

**Access:** Private/Admin

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Product deleted successfully"
  }
}
```

---

## 📁 Categories

### Get All Categories

**Endpoint:** `GET /api/categories`

**Access:** Public

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Smartphones",
        "slug": "smartphones",
        "description": "Latest smartphones and accessories",
        "icon": "📱",
        "image": "https://storage.url/category-phones.jpg",
        "sortOrder": 1,
        "productCount": 45
      },
      {
        "id": 2,
        "name": "Laptops",
        "slug": "laptops",
        "description": "High-performance laptops",
        "icon": "💻",
        "image": "https://storage.url/category-laptops.jpg",
        "sortOrder": 2,
        "productCount": 32
      }
    ]
  }
}
```

---

### Get Single Category with Products

**Endpoint:** `GET /api/categories/:id`

**Access:** Public

**Example:** `GET /api/categories/smartphones`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "category": {
      "id": 1,
      "name": "Smartphones",
      "slug": "smartphones",
      "description": "Latest smartphones",
      "icon": "📱",
      "image": "https://storage.url/category.jpg",
      "sortOrder": 1,
      "products": [
        {
          "id": 1,
          "name": "iPhone 15 Pro",
          "slug": "iphone-15-pro",
          "price": 999.00,
          "salePrice": 899.00,
          "images": ["url1"],
          "badge": "new",
          "rating": 4.9,
          "reviewCount": 234,
          "stock": 50
        }
      ]
    }
  }
}
```

---

### Create Category

**Endpoint:** `POST /api/categories`

**Access:** Private/Admin

**Request Body:**
```json
{
  "name": "Tablets",
  "slug": "tablets",
  "description": "iPads and Android tablets",
  "icon": "📱",
  "image": "https://storage.url/tablets.jpg",
  "sortOrder": 3
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "category": {
      "id": 3,
      "name": "Tablets",
      "slug": "tablets",
      "description": "iPads and Android tablets",
      "icon": "📱",
      "image": "https://storage.url/tablets.jpg",
      "sortOrder": 3,
      "createdAt": "2024-03-07T10:00:00Z"
    }
  }
}
```

---

### Update Category

**Endpoint:** `PUT /api/categories/:id`

**Access:** Private/Admin

**Request Body:**
```json
{
  "name": "Tablets & E-Readers",
  "sortOrder": 4
}
```

---

### Delete Category

**Endpoint:** `DELETE /api/categories/:id`

**Access:** Private/Admin

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Category deleted successfully"
  }
}
```

---

## 🛒 Shopping Cart

### Get Cart

**Endpoint:** `GET /api/cart`

**Access:** Private (works for both authenticated users and guests with session ID)

**Headers:**
```
Authorization: Bearer <token>
OR
x-session-id: <guest_session_id>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "cartId": 5,
        "productId": 10,
        "quantity": 2,
        "price": 999.00,
        "subtotal": 1998.00,
        "product": {
          "id": 10,
          "name": "iPhone 15 Pro",
          "slug": "iphone-15-pro",
          "images": ["https://storage.url/iphone.jpg"],
          "stock": 50,
          "category": {
            "name": "Smartphones"
          }
        }
      },
      {
        "id": 2,
        "cartId": 5,
        "productId": 15,
        "quantity": 1,
        "price": 2499.00,
        "subtotal": 2499.00,
        "product": {
          "id": 15,
          "name": "MacBook Pro 16\"",
          "slug": "macbook-pro-16",
          "images": ["https://storage.url/macbook.jpg"],
          "stock": 25,
          "category": {
            "name": "Laptops"
          }
        }
      }
    ],
    "summary": {
      "itemCount": 3,
      "subtotal": 4497.00,
      "tax": 449.70,
      "shipping": 0.00,
      "total": 4946.70
    }
  }
}
```

---

### Add to Cart

**Endpoint:** `POST /api/cart/items`

**Access:** Private

**Request Body:**
```json
{
  "productId": 10,
  "quantity": 2
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Product added to cart",
    "cartItem": {
      "id": 1,
      "cartId": 5,
      "productId": 10,
      "quantity": 2,
      "price": 999.00,
      "createdAt": "2024-03-07T10:00:00Z"
    }
  }
}
```

---

### Update Cart Item

**Endpoint:** `PUT /api/cart/items/:itemId`

**Access:** Private

**Request Body:**
```json
{
  "quantity": 3
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Cart item updated",
    "cartItem": {
      "id": 1,
      "quantity": 3,
      "subtotal": 2997.00
    }
  }
}
```

---

### Remove from Cart

**Endpoint:** `DELETE /api/cart/items/:itemId`

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Item removed from cart"
  }
}
```

---

### Clear Cart

**Endpoint:** `DELETE /api/cart/clear`

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Cart cleared successfully"
  }
}
```

---

### Merge Carts

**Endpoint:** `POST /api/cart/merge`

**Access:** Private

**Description:** Merges guest cart with user cart on login

**Request Body:**
```json
{
  "sessionId": "guest_1234567890_abc123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Carts merged successfully",
    "itemCount": 5
  }
}
```

---

### Validate Cart

**Endpoint:** `GET /api/cart/validate`

**Access:** Private

**Description:** Validates cart items (stock, prices, availability)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "issues": [],
    "message": "Cart is valid"
  }
}
```

**Response with Issues:**
```json
{
  "success": true,
  "data": {
    "valid": false,
    "issues": [
      {
        "type": "stock",
        "productId": 10,
        "productName": "iPhone 15 Pro",
        "requested": 5,
        "available": 3,
        "message": "Only 3 units available"
      },
      {
        "type": "price_change",
        "productId": 15,
        "productName": "MacBook Pro",
        "oldPrice": 2499.00,
        "newPrice": 2599.00,
        "message": "Price changed from $2499 to $2599"
      }
    ]
  }
}
```

---

## 📦 Orders

### Create Order

**Endpoint:** `POST /api/orders`

**Access:** Private

**Request Body:**
```json
{
  "shippingAddress": {
    "fullName": "John Doe",
    "address": "123 Main St, Apt 4B",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "phone": "+1234567890"
  },
  "billingAddress": {
    "fullName": "John Doe",
    "address": "123 Main St, Apt 4B",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "credit_card",
  "notes": "Please ring doorbell"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": 42,
      "orderNumber": "ORD-2024-00042",
      "userId": 1,
      "totalAmount": 4946.70,
      "status": "pending",
      "paymentMethod": "credit_card",
      "paymentStatus": "pending",
      "shippingAddress": {...},
      "billingAddress": {...},
      "notes": "Please ring doorbell",
      "items": [
        {
          "id": 50,
          "orderId": 42,
          "productId": 10,
          "quantity": 2,
          "price": 999.00,
          "subtotal": 1998.00,
          "product": {
            "name": "iPhone 15 Pro",
            "images": ["url"]
          }
        }
      ],
      "createdAt": "2024-03-07T10:30:00Z",
      "updatedAt": "2024-03-07T10:30:00Z"
    }
  }
}
```

---

### Get User's Orders

**Endpoint:** `GET /api/orders`

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 42,
        "orderNumber": "ORD-2024-00042",
        "totalAmount": 4946.70,
        "status": "pending",
        "paymentMethod": "credit_card",
        "paymentStatus": "pending",
        "itemCount": 3,
        "createdAt": "2024-03-07T10:30:00Z",
        "items": [...]
      }
    ]
  }
}
```

---

### Get Single Order

**Endpoint:** `GET /api/orders/:id`

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": 42,
      "orderNumber": "ORD-2024-00042",
      "userId": 1,
      "totalAmount": 4946.70,
      "status": "shipped",
      "paymentMethod": "credit_card",
      "paymentStatus": "completed",
      "trackingNumber": "1Z999AA10123456784",
      "shippingAddress": {...},
      "billingAddress": {...},
      "notes": "Please ring doorbell",
      "items": [...],
      "createdAt": "2024-03-07T10:30:00Z",
      "updatedAt": "2024-03-08T14:20:00Z"
    }
  }
}
```

---

### Update Order Status (Admin)

**Endpoint:** `PUT /api/orders/:id/status`

**Access:** Private/Admin

**Request Body:**
```json
{
  "status": "shipped",
  "trackingNumber": "1Z999AA10123456784"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": 42,
      "orderNumber": "ORD-2024-00042",
      "status": "shipped",
      "trackingNumber": "1Z999AA10123456784",
      "updatedAt": "2024-03-08T14:20:00Z"
    }
  }
}
```

---

### Get All Orders (Admin)

**Endpoint:** `GET /api/orders/admin/all`

**Access:** Private/Admin

**Query Parameters:**
```
?status=pending
&page=1
&limit=20
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 42,
        "orderNumber": "ORD-2024-00042",
        "user": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        },
        "totalAmount": 4946.70,
        "status": "pending",
        "paymentMethod": "credit_card",
        "items": [...],
        "createdAt": "2024-03-07T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "pages": 8,
      "limit": 20
    }
  }
}
```

---

## 👤 Users

### Get Profile

**Endpoint:** `GET /api/users/profile`

**Access:** Private

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "user",
      "avatar": "https://storage.url/avatar.jpg",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001"
      }
    }
  }
}
```

---

### Update Profile

**Endpoint:** `PUT /api/users/profile`

**Access:** Private

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1987654321",
  "address": {
    "street": "456 Oak Ave",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90001"
  }
}
```

---

### Change Password

**Endpoint:** `PUT /api/users/password`

**Access:** Private

**Request Body:**
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewSecurePass456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Password updated successfully"
  }
}
```

---

### Get All Users (Admin)

**Endpoint:** `GET /api/users`

**Access:** Private/Admin

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "role": "user",
        "isActive": true
      }
    ]
  }
}
```

---

### Get User by ID (Admin)

**Endpoint:** `GET /api/users/:id`

**Access:** Private/Admin

---

### Update User (Admin)

**Endpoint:** `PUT /api/users/:id`

**Access:** Private/Admin

**Request Body:**
```json
{
  "role": "admin",
  "isActive": false
}
```

---

### Delete User (Admin)

**Endpoint:** `DELETE /api/users/:id`

**Access:** Private/Admin

---

## 📤 Upload

### Upload Product Images

**Endpoint:** `POST /api/upload/product/:productId`

**Access:** Private/Admin

**Content-Type:** `multipart/form-data`

**Form Data:**
- Field name: `images` (can upload multiple)
- Max files: 5
- Supported formats: JPG, PNG, WebP
- Max size: 5MB per file

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "3 image(s) uploaded successfully",
    "uploadedUrls": [
      "https://storage.url/product1.jpg",
      "https://storage.url/product2.jpg",
      "https://storage.url/product3.jpg"
    ],
    "allImages": [
      "https://storage.url/existing.jpg",
      "https://storage.url/product1.jpg",
      "https://storage.url/product2.jpg",
      "https://storage.url/product3.jpg"
    ],
    "product": {
      "id": 10,
      "name": "iPhone 15 Pro",
      "images": [...]
    }
  }
}
```

---

### Delete Product Image

**Endpoint:** `DELETE /api/upload/product/:productId/image`

**Access:** Private/Admin

**Request Body:**
```json
{
  "imageUrl": "https://storage.url/product1.jpg"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Image deleted successfully",
    "remainingImages": [
      "https://storage.url/product2.jpg",
      "https://storage.url/product3.jpg"
    ]
  }
}
```

---

### Upload Category Image

**Endpoint:** `POST /api/upload/category/:categoryId`

**Access:** Private/Admin

**Content-Type:** `multipart/form-data`

**Form Data:**
- Field name: `image`
- Single file
- Supported formats: JPG, PNG, WebP
- Max size: 5MB

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Category image uploaded successfully",
    "imageUrl": "https://storage.url/category-smartphones.jpg",
    "category": {
      "id": 1,
      "name": "Smartphones",
      "image": "https://storage.url/category-smartphones.jpg"
    }
  }
}
```

---

### Upload Avatar

**Endpoint:** `POST /api/upload/avatar`

**Access:** Private

**Content-Type:** `multipart/form-data`

**Form Data:**
- Field name: `image`
- Single file
- Supported formats: JPG, PNG
- Max size: 2MB

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Avatar uploaded successfully",
    "avatarUrl": "https://storage.url/avatar-john.jpg",
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "avatar": "https://storage.url/avatar-john.jpg"
    }
  }
}
```

---

## 📊 Admin Analytics

### Dashboard Overview

**Endpoint:** `GET /api/admin/dashboard`

**Access:** Private/Admin

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalRevenue": {
        "today": 1234.56,
        "week": 8900.00,
        "month": 45000.00,
        "year": 350000.00,
        "all": 500000.00
      },
      "totalOrders": {
        "today": 15,
        "week": 89,
        "month": 456,
        "year": 3500,
        "all": 5000
      },
      "totalProducts": 234,
      "totalCustomers": 1500,
      "lowStockProducts": 12,
      "pendingOrders": 23,
      "processingOrders": 45,
      "revenueGrowth": {
        "daily": 12.5,
        "weekly": 8.3,
        "monthly": 15.7
      }
    }
  }
}
```

---

### Sales Report

**Endpoint:** `GET /api/admin/sales-report`

**Access:** Private/Admin

**Query Parameters:**
```
?startDate=2024-01-01
&endDate=2024-12-31
&groupBy=month
```

**Example:** `GET /api/admin/sales-report?startDate=2024-01-01&endDate=2024-12-31&groupBy=month`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "report": [
      {
        "date": "2024-01",
        "revenue": 45000.00,
        "orders": 456,
        "averageOrderValue": 98.68
      },
      {
        "date": "2024-02",
        "revenue": 52000.00,
        "orders": 523,
        "averageOrderValue": 99.43
      }
    ],
    "summary": {
      "totalRevenue": 350000.00,
      "totalOrders": 3500,
      "averageOrderValue": 100.00
    }
  }
}
```

---

### Revenue Analytics

**Endpoint:** `GET /api/admin/revenue-analytics`

**Access:** Private/Admin

**Query Parameters:**
```
?period=30days
```

**Options:** `7days`, `30days`, `90days`, `1year`, `all`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "chartData": [
      {
        "date": "2024-03-01",
        "revenue": 1234.56,
        "orders": 23
      },
      {
        "date": "2024-03-02",
        "revenue": 2345.67,
        "orders": 34
      }
    ],
    "revenueByCategory": [
      {
        "categoryName": "Smartphones",
        "revenue": 45000,
        "percentage": "35.0"
      },
      {
        "categoryName": "Laptops",
        "revenue": 38000,
        "percentage": "30.0"
      }
    ],
    "revenueByPayment": [
      {
        "method": "credit_card",
        "revenue": 80000,
        "percentage": "65.0"
      },
      {
        "method": "paypal",
        "revenue": 30000,
        "percentage": "25.0"
      },
      {
        "method": "cash_on_delivery",
        "revenue": 12000,
        "percentage": "10.0"
      }
    ]
  }
}
```

---

### Top Products

**Endpoint:** `GET /api/admin/top-products`

**Access:** Private/Admin

**Query Parameters:**
```
?limit=10
&sortBy=revenue
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "topProducts": [
      {
        "id": 1,
        "name": "iPhone 15 Pro",
        "image": "https://storage.url/iphone.jpg",
        "totalSold": 234,
        "totalRevenue": 256986.00,
        "averagePrice": 1098.23,
        "category": "Smartphones"
      }
    ]
  }
}
```

---

### Low Stock Products

**Endpoint:** `GET /api/admin/low-stock`

**Access:** Private/Admin

**Query Parameters:**
```
?threshold=10
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "lowStockProducts": [
      {
        "id": 1,
        "name": "iPhone 15 Pro",
        "sku": "IPH15PRO-128",
        "stock": 5,
        "category": "Smartphones",
        "price": 1099.00,
        "status": "critical"
      },
      {
        "id": 2,
        "name": "MacBook Air",
        "sku": "MBA-M2-256",
        "stock": 8,
        "category": "Laptops",
        "price": 1199.00,
        "status": "low"
      }
    ],
    "count": 12
  }
}
```

**Status Types:**
- `out_of_stock`: stock = 0
- `critical`: stock < 5
- `low`: stock < threshold (default 10)

---

### Recent Orders

**Endpoint:** `GET /api/admin/recent-orders`

**Access:** Private/Admin

**Query Parameters:**
```
?limit=10
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 1,
        "orderNumber": "ORD-2024-00001",
        "customer": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "totalAmount": 1998.00,
        "status": "pending",
        "itemCount": 2,
        "createdAt": "2024-03-07T10:30:00Z"
      }
    ]
  }
}
```

---

### Customer Statistics

**Endpoint:** `GET /api/admin/customer-stats`

**Access:** Private/Admin

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "totalCustomers": 1500,
    "newCustomersThisMonth": 45,
    "activeCustomers": 890,
    "topCustomers": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "totalOrders": 23,
        "totalSpent": 12345.67,
        "averageOrderValue": 536.77,
        "lastOrderDate": "2024-03-05"
      }
    ]
  }
}
```

---

### Export Sales Report

**Endpoint:** `GET /api/admin/export-sales`

**Access:** Private/Admin

**Query Parameters:**
```
?startDate=2024-01-01
&endDate=2024-12-31
&format=csv
```

**Success Response:**
- Returns CSV file download for `format=csv`
- Returns JSON data for `format=json`

**CSV Headers:**
```
Order Number,Date,Customer,Email,Total Amount,Status,Items
```

---

## ❌ Error Handling

### Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
```

### Common HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (e.g., duplicate email) |
| 422 | Unprocessable Entity | Validation error |
| 500 | Internal Server Error | Server error |

### Common Error Examples

**401 Unauthorized:**
```json
{
  "success": false,
  "error": {
    "message": "Not authorized to access this route",
    "code": "UNAUTHORIZED"
  }
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": {
    "message": "User role 'user' is not authorized to access this route",
    "code": "FORBIDDEN"
  }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": {
    "message": "Product not found with id of 999",
    "code": "NOT_FOUND"
  }
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "error": {
    "message": "Please provide all required fields",
    "code": "VALIDATION_ERROR",
    "details": {
      "fields": ["email", "password"]
    }
  }
}
```

**409 Conflict:**
```json
{
  "success": false,
  "error": {
    "message": "Email already exists",
    "code": "DUPLICATE_EMAIL"
  }
}
```

---

## 📝 Response Format Standards

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### Pagination Response

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "total": 100,
      "page": 1,
      "pages": 10,
      "limit": 10
    }
  }
}
```

---

## 🔒 Authentication & Authorization

### JWT Token

Include in Authorization header for protected routes:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration

- JWT tokens expire after **7 days**
- Refresh by logging in again

### Role-Based Access

**Roles:**
- `user` - Regular customer
- `admin` - Administrator with full access

**Admin Routes:**
- All routes under `/api/admin/*`
- POST/PUT/DELETE for products, categories
- All user management routes

---

## 🌐 Base URL & Environments

**Development:**
```
http://localhost:3001/api
```

**Production:**
```
https://electronic-store-production-0f93.up.railway.app/api
```

---

## 📊 Rate Limiting

- **General endpoints:** 100 requests per minute per IP
- **Authentication endpoints:** 10 requests per minute per IP
- **Checkout endpoints:** 20 requests per minute per IP

Exceeded limits return `429 Too Many Requests`

---

## 🎯 Quick Start Example

```javascript
// Login
const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
});

const { data } = await loginResponse.json();
const token = data.token;

// Get products
const productsResponse = await fetch('http://localhost:3001/api/products?page=1&limit=12', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const products = await productsResponse.json();
console.log(products.data.products);

// Add to cart
const cartResponse = await fetch('http://localhost:3001/api/cart/items', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    productId: 1,
    quantity: 2
  })
});
```

---

## 📚 Additional Resources

- **Postman Collection:** [Download](link-to-postman-collection)
- **API Changelog:** [View](link-to-changelog)
- **Support:** support@yourdomain.com

---

**Last Updated:** March 7, 2026

**API Version:** 1.0.0

**Maintained by:** Your Development Team
