import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">

      {/* Sidebar */}
      <aside
        className={`transition-all duration-300 bg-slate-900 border-r border-slate-800
        ${collapsed ? "w-16" : "w-64"} flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          {!collapsed && (
            <span className="text-lg font-semibold">i-Tech Admin</span>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-white"
          >
            ☰
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 p-2">

          <NavLink
            to="/admin/products"
            end
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm transition
              ${isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800"}`
            }
          >
            {collapsed ? "📦" : "Products"}
          </NavLink>

          <NavLink
            to="/admin/products/new"
            end
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm transition
              ${isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800"}`
            }
          >
            {collapsed ? "➕" : "Add Product"}
          </NavLink>

        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>

    </div>
  );
}