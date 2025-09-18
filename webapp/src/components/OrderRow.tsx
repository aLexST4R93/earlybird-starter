// src/components/admin/OrderRow.tsx
"use client";
import React from "react";

type OrderItem = { product_id: string; qty: number; price: number };
type Order = {
  id: string;
  shop_id: string;
  items: OrderItem[];
  total: number;
  pickup_slot: string;
  phone?: string;
  payment_status: string;
  status: string;
  created_at: string;
};

export default function OrderRow({
  order,
  onChangeStatus,
}: {
  order: Order;
  onChangeStatus: (id: string, status: string) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 p-3 border-b">
      <div className="flex-1">
        <div className="text-sm text-gray-600">{new Date(order.created_at).toLocaleString()}</div>
        <div className="font-semibold">{order.id}</div>
        <div className="text-sm">
          {order.items.map((it) => (
            <div key={it.product_id}>
              {it.qty}× {it.product_id} — {(it.price * it.qty).toFixed(2).replace(".", ",")} €
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-600">Slot: {order.pickup_slot} • Tel: {order.phone || "-"}</div>
      </div>
      <div className="w-48">
        <div className="text-right font-medium mb-2">{order.total.toFixed(2).replace(".", ",")} €</div>
        <select
          value={order.status}
          onChange={(e) => onChangeStatus(order.id, e.target.value)}
          className="w-full rounded border px-2 py-1"
        >
          <option value="received">eingegangen</option>
          <option value="in_preparation">in Vorbereitung</option>
          <option value="ready">fertig</option>
          <option value="picked_up">abgeholt</option>
          <option value="cancelled">storniert</option>
        </select>
        <div className="mt-2 text-xs text-gray-500">Zahlungsstatus: {order.payment_status}</div>
      </div>
    </div>
  );
}