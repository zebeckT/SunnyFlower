async function request(path, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch('/api' + path, options);

  if (response.status === 204) return null;

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    throw Error(
      'Phiên đăng nhập đã hết hạn hoặc không có quyền truy cập. Vui lòng đăng nhập lại.',
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.error || (typeof data?.title === 'string' ? data.title : 'Yêu cầu không thành công');
    throw Error(message);
  }

  return data;
}

export async function getCategories() {
  return await request('/categories');
}

export async function createCategory(data, token) {
  return await request('/categories', 'POST', data, token);
}

export async function updateCategory(id, data, token) {
  return await request(`/categories/${encodeURIComponent(id)}`, 'PUT', data, token);
}

export async function deleteCategory(id, token) {
  return await request(`/categories/${encodeURIComponent(id)}`, 'DELETE', null, token);
}

export async function listProducts(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) qs.set(key, value);
  });
  return await request(`/products?${qs}`);
}

export async function createProduct(data, token) {
  return await request('/products', 'POST', data, token);
}

export async function updateProduct(id, data, token) {
  return await request(`/products/${encodeURIComponent(id)}`, 'PUT', data, token);
}

export async function deleteProduct(id, token) {
  return await request(`/products/${encodeURIComponent(id)}`, 'DELETE', null, token);
}

export async function listOrders(params = {}, token) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) qs.set(key, value);
  });
  return await request(`/orders?${qs}`, 'GET', null, token);
}

export async function getOrder(id, token) {
  return await request(`/orders/${encodeURIComponent(id)}`, 'GET', null, token);
}

export async function updateOrderStatus(id, status, token) {
  return await request(`/orders/${encodeURIComponent(id)}/status`, 'PATCH', { status }, token);
}

export async function listUsers(params = {}, token) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) qs.set(key, value);
  });
  return await request(`/admin/users?${qs}`, 'GET', null, token);
}

export async function createUser(data, token) {
  return await request('/admin/users', 'POST', data, token);
}

export async function updateUserRole(userId, roleId, token) {
  return await request(`/admin/users/${userId}/role`, 'PATCH', { roleId }, token);
}

export async function toggleUserStatus(userId, isActive, token) {
  return await request(`/admin/users/${userId}/status`, 'PATCH', { isActive }, token);
}

export async function getMyOrders(token) {
  return await request('/me/orders', 'GET', null, token);
}

export {
  getCategories as getAdminCategories,
  listProducts as getAdminProducts,
  listOrders as getAdminOrders,
  getOrder as getAdminOrder,
  listUsers as getAdminUsers,
};
