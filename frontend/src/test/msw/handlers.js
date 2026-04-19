import { http, HttpResponse } from 'msw';

const baseProducts = [
  {
    id: 10,
    name: 'Phone X',
    price: 500,
    salePrice: 450,
    badge: 'Hot',
    stock: 5,
    rating: 5,
    reviewCount: 12,
    imageUrls: ['https://example.com/phone.jpg'],
    category: { id: 1, name: 'Phones' },
    categoryId: 1,
  },
  {
    id: 11,
    name: 'Laptop Pro',
    price: 1300,
    stock: 3,
    rating: 4,
    reviewCount: 8,
    imageUrls: ['https://example.com/laptop.jpg'],
    category: { id: 2, name: 'Laptops' },
    categoryId: 2,
  },
];

const baseCategories = [
  { id: 1, name: 'Phones', slug: 'phones', sortOrder: 1, description: 'Mobile devices', icon: 'Smartphone', isActive: true },
  { id: 2, name: 'Laptops', slug: 'laptops', sortOrder: 2, description: 'Portable computers', icon: 'Laptop', isActive: true },
];

function calculateSummary(items) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

let cartState;
let lastPlacedOrder;
let lastProductsQuery;

export function resetMockData() {
  cartState = {
    items: [
      {
        id: 1,
        productId: 10,
        quantity: 2,
        price: 500,
        subtotal: 1000,
        product: { name: 'Phone X', imageUrls: ['https://example.com/phone.jpg'], stock: 5 },
      },
    ],
    summary: calculateSummary([
      {
        id: 1,
        productId: 10,
        quantity: 2,
        price: 500,
        subtotal: 1000,
        product: { name: 'Phone X', imageUrls: ['https://example.com/phone.jpg'], stock: 5 },
      },
    ]),
  };
  lastPlacedOrder = null;
  lastProductsQuery = null;
}

export function getLastPlacedOrder() {
  return lastPlacedOrder;
}

export function getLastProductsQuery() {
  return lastProductsQuery;
}

resetMockData();

export const handlers = [
  http.get('*/health', () => {
    return HttpResponse.json({ success: true, status: 'OK' });
  }),

  http.get('*/api/products', ({ request }) => {
    const url = new URL(request.url);
    const search = (url.searchParams.get('search') || '').toLowerCase();
    lastProductsQuery = Object.fromEntries(url.searchParams.entries());

    const products = search
      ? baseProducts.filter((product) => product.name.toLowerCase().includes(search))
      : baseProducts;

    const page = Number(url.searchParams.get('page') || 1);

    return HttpResponse.json({
      data: {
        products,
        pagination: { total: products.length, page, pages: 1 },
      },
    });
  }),

  http.get('*/api/products/:id', ({ params }) => {
    const product = baseProducts.find((p) => String(p.id) === String(params.id));
    if (!product) {
      return HttpResponse.json({ error: { message: 'Not found' } }, { status: 404 });
    }
    return HttpResponse.json({ data: { product } });
  }),

  http.get('*/api/categories', () => {
    return HttpResponse.json({ data: { categories: baseCategories } });
  }),

  http.get('*/api/categories/:id', ({ params }) => {
    const category = baseCategories.find((c) => String(c.id) === String(params.id));
    if (!category) {
      return HttpResponse.json({ error: { message: 'Not found' } }, { status: 404 });
    }
    return HttpResponse.json({ data: { category } });
  }),

  http.get('*/api/cart', () => {
    return HttpResponse.json({ data: cartState });
  }),

  http.put('*/api/cart/items/:itemId', async ({ params, request }) => {
    const { quantity } = await request.json();
    cartState.items = cartState.items.map((item) => {
      if (String(item.id) !== String(params.itemId)) return item;
      return { ...item, quantity: Number(quantity), subtotal: item.price * Number(quantity) };
    });
    cartState.summary = calculateSummary(cartState.items);
    return HttpResponse.json({ data: cartState });
  }),

  http.delete('*/api/cart/items/:itemId', ({ params }) => {
    cartState.items = cartState.items.filter((item) => String(item.id) !== String(params.itemId));
    cartState.summary = calculateSummary(cartState.items);
    return HttpResponse.json({ data: cartState });
  }),

  http.get('*/api/users/profile', () => {
    return HttpResponse.json({
      success: true,
      data: {
        user: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          phone: '012345678',
          address: { street: '123 Main', city: 'Phnom Penh', state: 'PP', zipCode: '12000' },
        },
      },
    });
  }),

  http.post('*/api/orders', async ({ request }) => {
    const payload = await request.json();
    lastPlacedOrder = payload;
    return HttpResponse.json({ success: true, data: { order: { id: 1001 } } });
  }),
];
