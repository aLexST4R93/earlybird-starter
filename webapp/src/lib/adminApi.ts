// src/lib/adminApi.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

export async function merchantLogin(email: string, password: string) {
  const res = await fetch(`${API_BASE}/merchant/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function fetchMerchantOrders(token: string, shopId = "hemmerle") {
  const res = await fetch(`${API_BASE}/merchant/shops/${encodeURIComponent(shopId)}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Fetch orders failed");
  return res.json();
}

export async function updateOrderStatus(token: string, orderId: string, status: string) {
  const res = await fetch(`${API_BASE}/merchant/orders/${encodeURIComponent(orderId)}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error || "Update failed");
  }
  return res.json();
}