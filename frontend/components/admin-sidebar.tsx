"use client";

import Link from "next/link";

export function AdminSidebar() {
  return (
    <aside className="w-64 min-h-screen border-r p-5">
      <h2 className="text-2xl font-bold mb-10">Admin</h2>

      <nav className="flex flex-col gap-4">
        <Link href="/admin">Dashboard</Link>

        <Link href="/products">Productos</Link>
      </nav>
    </aside>
  );
}
