// src/admin/products/api.js

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function getToken() {
  // Adjust to wherever you store it after login
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();
  console.log("FETCH ABOUT TO RUN:", `${API_BASE}${path}`);
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || (data && data.success === false)) {
    const msg =
      data?.error?.message ||
      data?.message ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

export async function listProducts({
  search = "",
  categoryId,
  minPrice,
  maxPrice,
  badge,
  isFeatured,
  sortBy,
  order,
  page = 1,
  limit = 20,
} = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (categoryId) params.set("categoryId", String(categoryId));
  if (minPrice != null) params.set("minPrice", String(minPrice));
  if (maxPrice != null) params.set("maxPrice", String(maxPrice));
  if (badge) params.set("badge", badge);
  if (isFeatured != null) params.set("isFeatured", String(isFeatured));
  if (sortBy) params.set("sortBy", sortBy);
  if (order) params.set("order", order);
  params.set("page", String(page));
  params.set("limit", String(limit));

  const res = await request(`/api/products?${params.toString()}`);
  return {
    products: res.data?.products ?? [],
    pagination: res.data?.pagination ?? null,
  };
}

export async function getProduct(id) {
  const res = await request(`/api/products/${id}`);
  return res.data?.product;
}

export async function createProduct(product) {
  const res = await request(`/api/products`, {
    method: "POST",
    body: JSON.stringify(product),
  });
  return res.data?.product ?? res.data;
}

export async function updateProduct(id, product) {
  const res = await request(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(product),
  });
  return res.data?.product ?? res.data;
}

export async function deleteProduct(id) {
  await request(`/api/products/${id}`, { method: "DELETE" });
  return true;
}

export async function uploadProductImage(id, file) {
  const formData = new FormData();
  formData.append("images", file);

  const token = getToken();

  const res = await fetch(`${API_BASE}/api/upload/product/${id}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || "Upload failed");
  }

  return {
    keys: json?.data?.keys ?? [],
    uploadedUrls: json?.data?.uploadedUrls ?? [],
    allImages: json?.data?.allImages ?? [],
    product: json?.data?.product ?? null,
  };
}