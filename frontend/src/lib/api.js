import { stripAccents } from './format';
import sampleData from '/products.sample.json';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export class ApiError extends Error {
  constructor(status, body) {
    const message =
      typeof body === 'string'
        ? body
        : body?.message || 'Có lỗi xảy ra từ máy chủ';
    super(message);
    this.status = status;
    this.code = body?.code;
    this.details = body?.details || [];
  }
}

export class ApiUnavailable extends Error {
  constructor(message = 'Không thể kết nối đến máy chủ') {
    super(message);
    this.name = 'Unavailable';
  }
}

export async function apiFetch(path, options = {}) {
  let response;
  try {
    response = await fetch(API_BASE + path, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch {
    throw new ApiUnavailable();
  }

  const isJson = (response.headers.get('content-type') || '').includes('json');
  let data = null;
  if (isJson) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const error =
      data?.error ||
      data?.message ||
      (response.status >= 500
        ? 'Hệ thống máy chủ đang bận hoặc gặp sự cố, vui lòng thử lại.'
        : 'Yêu cầu không thành công');
    throw new ApiError(
      response.status,
      typeof error === 'string' ? { message: error } : error,
    );
  }

  return data;
}

const { categories: sampleCategories, products: sampleProducts } = sampleData;

const pickProductFields = ({ id, name, price, image, categoryId, stock, featured }) => ({
  id,
  name,
  price,
  image,
  categoryId,
  stock,
  featured,
});

function offlineGetProducts(params) {
  let items = [...sampleProducts];

  const category = params.category || params.categoryId;
  const q = params.q || params.search;

  if (category) items = items.filter((p) => p.categoryId === category);
  if (q) items = items.filter((p) => stripAccents(p.name).includes(stripAccents(q)));
  if (params.minPrice != null) items = items.filter((p) => p.price >= params.minPrice);
  if (params.maxPrice != null) items = items.filter((p) => p.price <= params.maxPrice);
  if (params.featured != null) items = items.filter((p) => !!p.featured === !!params.featured);

  const sorters = {
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
    name: (a, b) => a.name.localeCompare(b.name, 'vi'),
    newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  };
  items.sort(sorters[params.sort] || sorters.newest);

  const limit = params.limit || params.pageSize || 12;
  const page = params.page || 1;
  const total = items.length;
  const data = items.slice((page - 1) * limit, page * limit).map(pickProductFields);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    data,
    items: data,
    meta: { page, limit, total, totalPages },
    total,
    totalPages,
  };
}

export async function getProducts(params = {}) {
  const query = {};

  if (params.category || params.categoryId)
    query.categoryId = params.category || params.categoryId;
  if (params.q || params.search) query.search = params.q || params.search;
  if (params.minPrice != null) query.minPrice = params.minPrice;
  if (params.maxPrice != null) query.maxPrice = params.maxPrice;
  if (params.featured != null) query.featured = params.featured;
  if (params.inStock != null) query.inStock = params.inStock;

  if (params.sort === 'price_asc') {
    query.sortBy = 'price';
    query.sortDir = 'asc';
  } else if (params.sort === 'price_desc') {
    query.sortBy = 'price';
    query.sortDir = 'desc';
  } else if (params.sort === 'name') {
    query.sortBy = 'name';
    query.sortDir = 'asc';
  } else if (params.sort === 'newest') {
    query.sortBy = 'createdAt';
    query.sortDir = 'desc';
  } else {
    if (params.sortBy) query.sortBy = params.sortBy;
    if (params.sortDir) query.sortDir = params.sortDir;
  }

  query.page = params.page || 1;
  query.pageSize = params.limit || params.pageSize || 12;

  const qs = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) qs.set(k, v);
  });

  try {
    const result = await apiFetch(`/products?${qs}`);
    const items = result?.items || result?.data || (Array.isArray(result) ? result : []);
    const total = result?.totalCount ?? result?.total ?? items.length;
    const page = result?.page ?? query.page;
    const pageSize = result?.pageSize ?? query.pageSize;
    const totalPages = result?.totalPages ?? Math.max(1, Math.ceil(total / pageSize));

    return {
      data: items,
      items,
      meta: { page, limit: pageSize, total, totalPages },
      total,
      totalPages,
    };
  } catch (err) {
    if (err instanceof ApiUnavailable) return offlineGetProducts(params);
    throw err;
  }
}

export async function getProduct(id) {
  try {
    const result = await apiFetch(`/products/${encodeURIComponent(id)}`);
    return result?.data || result;
  } catch (err) {
    if (!(err instanceof ApiUnavailable)) throw err;
    const product = sampleProducts.find((p) => p.id === id);
    if (!product)
      throw new ApiError(404, { code: 'NOT_FOUND', message: 'Không tìm thấy sản phẩm' });
    return product;
  }
}

export async function getCategories() {
  try {
    const result = await apiFetch('/categories');
    return Array.isArray(result) ? result : result?.data || [];
  } catch (err) {
    if (!(err instanceof ApiUnavailable)) throw err;
    return sampleCategories.map((c) => ({
      ...c,
      productCount: sampleProducts.filter((p) => p.categoryId === c.id).length,
    }));
  }
}

export async function createOrder(data) {
  const result = await apiFetch('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return result?.data || result;
}

export async function createContact(data) {
  const result = await apiFetch('/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return result?.data || result;
}
