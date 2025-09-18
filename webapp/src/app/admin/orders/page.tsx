// src/app/admin/orders/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import OrderRow from "../../../components/admin/OrderRow";
import { fetchMerchantOrders, updateOrderStatus } from "../../../lib/adminApi";

type Order = any;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("earlybird_token");
    setToken(t);
    if (t) loadOrders(t);
  }, []);

  async function loadOrders(t: string) {
    setLoading(true);
    try {
      const res = await fetchMerchantOrders(t, "hemmerle");
      // the merchant endpoint returns { value: [...], Count: n } in our stub
      const list = res.value || res;
      setOrders(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function onChangeStatus(id: string, status: string) {
    if (!token) { alert("Not logged in"); return; }
    try {
      await updateOrderStatus(token, id, status);
      // reload
      await loadOrders(token);
    } catch (e: any) {
      alert("Fehler beim Aktualisieren: " + (e.message || e));
    }
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold mb-4">Admin — Bestellungen</h1>
      {!token && <div className="mb-4 text-red-600">Bitte zuerst unter /admin/login einloggen.</div>}
      {loading && <div>Lädt …</div>}
      {!loading && orders.length === 0 && <div className="text-sm text-gray-500">Keine Bestellungen</div>}
      <div className="bg-white rounded shadow">
        {orders.map((o: Order) => (
          <OrderRow key={o.id} order={o} onChangeStatus={onChangeStatus} />
        ))}
      </div>
    </main>
  );
}