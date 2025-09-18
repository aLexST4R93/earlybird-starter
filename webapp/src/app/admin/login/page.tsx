// src/app/admin/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { merchantLogin } from "@/lib/adminApi";

export default function AdminLogin() {
  const [email, setEmail] = useState("admin@hemmerle.example");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function login() {
    setError(null);
    try {
      const res = await merchantLogin(email, password);
      // store token in localStorage for admin pages
      localStorage.setItem("earlybird_token", res.token);
      router.push("/admin/orders");
    } catch (e: any) {
      setError(e.message || "Login failed");
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
      <div>
        <label className="text-sm">E‑Mail</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded p-2 mb-2" />
        <label className="text-sm">Passwort</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded p-2 mb-2" />
        <button onClick={login} className="w-full bg-blue-600 text-white p-2 rounded">Einloggen</button>
        {error && <div className="mt-2 text-red-600">{error}</div>}
      </div>
    </main>
  );
}