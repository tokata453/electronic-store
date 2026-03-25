# Electronic Store API Documentation

**Version:** 1.1.0  
**Last Updated:** 2026-03-25  
**Base URL:**

- Local: `http://localhost:5001`
- Production: `https://electronic-store-production-0f93.up.railway.app`

API routes are prefixed with `/api`.

## Authentication

Protected routes require:

```http
Authorization: Bearer <jwt_token>
```

Guest cart routes can be used without a JWT by sending:

```http
x-session-id: <guest_session_id>
```

## Standard Response Format

Successful responses:

```json
{
  "success": true,
  "data": {}
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "status": 400
  }
}
```

## Auth

### `POST /api/auth/register`

Create a customer account.

Request body:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "secret123",
  "phone": "+85512345678"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+85512345678",
      "role": "customer"
    },
    "token": "jwt_token"
  }
}
```

### `POST /api/auth/login`

Login with email and password.

Request body:

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

### `GET /api/auth/me`

Return the currently authenticated user.

### `GET /api/auth/google`

Start Google OAuth login.

### `GET /api/auth/google/callback`

Google OAuth callback. Redirects to frontend callback URL.

### `GET /api/auth/facebook`

Start Facebook OAuth login.

### `GET /api/auth/facebook/callback`

Facebook OAuth callback. Redirects to frontend callback URL.

## Products

### `GET /api/products`

Get product list with filtering, sorting, and pagination.

Query params:

- `search`
- `categoryId`
- `minPrice`
- `maxPrice`
- `badge`
- `isFeatured`
- `sortBy` = `createdAt | price | name | rating | reviewCount | views | stock`
- `order` = `ASC | DESC`
- `page`
- `limit`

Response shape:

```json
{
  "success": true,
  "data": {
    "products": [],
    "pagination": {
      "total": 0,
      "page": 1,
      "pages": 1,
      "limit": 20
    }
  }
}
```

### `GET /api/products/featured`

Get featured products for homepage sections.

Query params:

- `limit`

### `GET /api/products/filters`

Get available product filter metadata.

Response:

```json
{
  "success": true,
  "data": {
    "filters": {
      "minPrice": 10,
      "maxPrice": 2500,
      "badges": ["Hot", "Sale", "New"]
    }
  }
}
```

### `GET /api/products/:id`

Get product by numeric ID.

### `GET /api/products/slug/:slug`

Get product by slug.

### `GET /api/products/:id/related`

Get related products using category and badge similarity.

Query params:

- `limit`

### `POST /api/products`

Admin only. Create product.

Request body:

```json
{
  "name": "MacBook Pro 16",
  "slug": "macbook-pro-16",
  "description": "Powerful laptop",
  "price": 2499,
  "salePrice": 2299,
  "sku": "MBP16-2026",
  "stock": 10,
  "categoryId": 2,
  "images": ["products/macbook-1.png"],
  "badge": "Featured",
  "specifications": {
    "ram": "32GB",
    "storage": "1TB SSD"
  },
  "isFeatured": true
}
```

### `PUT /api/products/:id`

Admin only. Update product.

### `DELETE /api/products/:id`

Admin only. Soft delete product by setting `isActive = false`.

## Categories

### `GET /api/categories`

Get active categories.

### `GET /api/categories/:id`

Get category with active products.

### `GET /api/categories/slug/:slug`

Get category with active products by slug.

### `POST /api/categories`

Admin only. Create category.

Request body:

```json
{
  "name": "Laptops",
  "slug": "laptops",
  "description": "Laptop collection",
  "icon": "laptop",
  "image": "categories/laptops.png",
  "sortOrder": 1
}
```

### `PUT /api/categories/:id`

Admin only. Update category.

### `DELETE /api/categories/:id`

Admin only. Soft delete category. Fails if products still belong to that category.

## Cart

Cart supports both logged-in users and guests.

Guest usage:

- send `x-session-id` header
- no JWT required

Logged-in usage:

- send JWT
- `x-session-id` optional

### `GET /api/cart`

Get current cart.

Supports:

- JWT user cart
- guest cart via `x-session-id`

Response:

```json
{
  "success": true,
  "data": {
    "cartId": 1,
    "items": [],
    "summary": {
      "itemCount": 0,
      "subtotal": 0,
      "tax": 0,
      "shipping": 0,
      "total": 0
    }
  }
}
```

### `POST /api/cart/items`

Add item to cart.

Request body:

```json
{
  "productId": 1,
  "quantity": 2,
  "sessionId": "guest-session-123"
}
```

`sessionId` is only needed for guest carts if not sent in the header.

### `PUT /api/cart/items/:itemId`

Update cart item quantity.

Request body:

```json
{
  "quantity": 3
}
```

### `DELETE /api/cart/items/:itemId`

Remove one item from cart.

### `DELETE /api/cart/clear`

Clear cart.

### `POST /api/cart/merge`

Protected route. Merge guest cart into authenticated user cart.

Request body:

```json
{
  "sessionId": "guest-session-123"
}
```

### `GET /api/cart/validate`

Validate cart items against stock, availability, and price changes.

## Orders

### `POST /api/orders/preview`

Protected route. Preview totals before creating an order.

Request body:

```json
{
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 5, "quantity": 1 }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "+85512345678",
    "addressLine1": "Street 2004",
    "city": "Phnom Penh"
  },
  "paymentMethod": "cod"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "summary": {
      "subtotal": 1200,
      "tax": 0,
      "shippingCost": 0,
      "discount": 0,
      "totalAmount": 1200,
      "itemCount": 3,
      "items": []
    }
  }
}
```

### `POST /api/orders`

Protected route. Create order.

Accepted payment methods:

- `credit_card`
- `paypal`
- `cod`
- `bank_transfer`
- `aba`
- `acleda`

Request body:

```json
{
  "items": [
    { "productId": 1, "quantity": 2 }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "+85512345678",
    "addressLine1": "Street 2004",
    "city": "Phnom Penh"
  },
  "billingAddress": {
    "fullName": "John Doe",
    "phone": "+85512345678",
    "addressLine1": "Street 2004",
    "city": "Phnom Penh"
  },
  "paymentMethod": "cod",
  "notes": "Please call before delivery"
}
```

### `GET /api/orders`

Protected route. Get current user orders.

### `GET /api/orders/summary`

Protected route. Get current user order summary.

Response:

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalOrders": 5,
      "totalSpent": 4200,
      "byStatus": {
        "pending": 1,
        "delivered": 4
      }
    }
  }
}
```

### `GET /api/orders/:id`

Protected route. Get a single order. Users can only access their own order unless they are admin.

### `PUT /api/orders/:id/status`

Admin only. Update order status or tracking number.

Request body:

```json
{
  "status": "shipped",
  "trackingNumber": "TRACK123456"
}
```

### `GET /api/orders/admin/all`

Admin only. Get all orders with filters.

Query params:

- `status`
- `page`
- `limit`

## Users

### `GET /api/users/profile`

Protected route. Get current user profile.

### `PUT /api/users/profile`

Protected route. Update current user profile.

Request body:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+85512345678",
  "avatar": "avatars/user-1.png",
  "address": {
    "city": "Phnom Penh"
  }
}
```

### `PUT /api/users/password`

Protected route. Change password.

Request body:

```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

### `GET /api/users`

Admin only. Get all users.

### `GET /api/users/:id`

Admin only. Get one user.

### `PUT /api/users/:id`

Admin only. Update user.

### `DELETE /api/users/:id`

Admin only. Delete user.

## Upload

All upload endpoints require authentication. Product and category uploads are admin only.

### `POST /api/upload/product/:productId`

Admin only. Upload product images.

Content type:

- `multipart/form-data`

Field name:

- `images`

### `DELETE /api/upload/product/:productId/image`

Admin only. Delete product image.

Request body:

```json
{
  "imageUrl": "products/macbook-1.png"
}
```

### `POST /api/upload/category/:categoryId`

Admin only. Upload category image.

Content type:

- `multipart/form-data`

Field name:

- `image`

### `POST /api/upload/avatar`

Protected route. Upload current user avatar.

Content type:

- `multipart/form-data`

Field name:

- `image`

## Admin

All admin endpoints require:

- JWT token
- user role = `admin`

### `GET /api/admin`

Simple admin access check.

### `GET /api/admin/dashboard`

Dashboard summary statistics.

### `GET /api/admin/sales-report`

Sales report by date range.

Query params:

- `startDate`
- `endDate`
- `groupBy=day|week|month`

### `GET /api/admin/revenue-analytics`

Revenue analytics with chart data.

Query params:

- `period=7days|30days|90days|1year|all`

### `GET /api/admin/top-products`

Top-selling products.

Query params:

- `limit`
- `sortBy=revenue|quantity`

### `GET /api/admin/low-stock`

Low-stock products.

Query params:

- `threshold`

### `GET /api/admin/recent-orders`

Recent orders for admin dashboard.

Query params:

- `limit`

### `GET /api/admin/customer-stats`

Customer statistics for admin dashboard.

### `GET /api/admin/export-sales`

Export sales report.

Query params:

- `startDate`
- `endDate`
- `format=csv|json`

If `format=csv`, returns a CSV file download. Otherwise returns JSON.

## Health and Info

### `GET /health`

Health check.

### `GET /api`

API info endpoint.

## Notes for Frontend Integration

- Existing frontend endpoints remain compatible:
  - `POST /api/auth/login`
  - `POST /api/auth/register`
  - `GET /api/auth/me`
  - `GET /api/products`
  - `GET /api/products/:id`
  - `GET /api/categories`
  - `GET /api/categories/:id`
- New frontend-friendly endpoints were added without changing those existing response shapes.
- Product and category image fields store object keys, while `imageUrl` or `imageUrls` contain generated accessible URLs in responses.
