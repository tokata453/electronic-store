import api from '../../services/api.js';

// ─── Products ────────────────────────────────────────────────

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
  const params = {
    search,
    categoryId,
    minPrice,
    maxPrice,
    badge,
    isFeatured,
    sortBy,
    order,
    page,
    limit,
  };

  const res = await api.get('/api/products', { params });

  return {
    products: res.data?.data?.products ?? [],
    pagination: res.data?.data?.pagination ?? null,
  };
}

export async function getProduct(id) {
  const res = await api.get(`/api/products/${id}`);
  return res.data?.data?.product;
}

export async function createProduct(product) {
  const res = await api.post(`/api/products`, product);
  return res.data?.data?.product ?? res.data?.data;
}

export async function updateProduct(id, product) {
  const res = await api.put(`/api/products/${id}`, product);
  return res.data?.data?.product ?? res.data?.data;
}

export async function deleteProduct(id) {
  await api.delete(`/api/products/${id}`);
  return true;
}

export async function uploadProductImage(id, file) {
  const formData = new FormData();
  formData.append("images", file);

  const res = await api.post(`/api/upload/product/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return {
    keys: res.data?.data?.keys ?? [],
    uploadedUrls: res.data?.data?.uploadedUrls ?? [],
    allImages: res.data?.data?.allImages ?? [],
    product: res.data?.data?.product ?? null,
  };
}

export async function deleteProductImage(id, imageKey) {
  const res = await api.delete(`/api/upload/product/${id}/image`, {
    data: { imageKey }
  });
  return res.data;
}

// ─── Categories ──────────────────────────────────────────────

export async function listCategories() {
  const res = await api.get(`/api/categories`);
  return res.data?.data?.categories ?? res.data?.data ?? [];
}

export async function getCategory(id) {
  const res = await api.get(`/api/categories/${id}`);
  return res.data?.data?.category ?? res.data?.data;
}

export async function createCategory(category) {
  const res = await api.post(`/api/categories`, category);
  return res.data?.data?.category ?? res.data?.data;
}

export async function updateCategory(id, category) {
  const res = await api.put(`/api/categories/${id}`, category);
  return res.data?.data?.category ?? res.data?.data;
}

export async function deleteCategory(id) {
  await api.delete(`/api/categories/${id}`);
  return true;
}

export async function uploadCategoryImage(id, file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await api.post(`/api/upload/category/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return {
    key: res.data?.data?.key ?? null,
    imageUrl: res.data?.data?.imageUrl ?? null,
    category: res.data?.data?.category ?? null,
  };
}