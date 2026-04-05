import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "./products/useTheme";
import { Package, PlusCircle, LayoutGrid, PlusSquare, Settings, LogOut } from "lucide-react";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { theme } = useTheme();
  const dark = theme === "dark";
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <div className={`flex min-h-screen ${dark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"}`}>

      {/* Sidebar */}
      <aside
        className={`sticky top-0 h-screen transition-all duration-300 ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"} border-r
        ${collapsed ? "w-16" : "w-64"} flex flex-col`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${dark ? "border-slate-800" : "border-slate-200"}`}>
          {!collapsed && (
            <span className="text-lg font-semibold">i-Tech Admin</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`${dark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
          >
            ☰
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 p-2 flex-1">
          <NavLink
            to="/admin/products"
            end
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm transition
              ${isActive
                ? dark ? "bg-slate-800 text-white" : "bg-slate-200 text-slate-900"
                : dark ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            <span className="flex items-center gap-2">
              <Package size={18} /> {!collapsed && "Products"}
            </span>
          </NavLink>

          <NavLink
            to="/admin/products/new"
            end
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm transition
              ${isActive
                ? dark ? "bg-slate-800 text-white" : "bg-slate-200 text-slate-900"
                : dark ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            <span className="flex items-center gap-2">
              <PlusCircle size={18} /> {!collapsed && "Add Product"}
            </span>
          </NavLink>

          <NavLink
            to="/admin/categories"
            end
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm transition
              ${isActive
                ? dark ? "bg-slate-800 text-white" : "bg-slate-200 text-slate-900"
                : dark ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            <span className="flex items-center gap-2">
              <LayoutGrid size={18} /> {!collapsed && "Categories"}
            </span>
          </NavLink>

          <NavLink
            to="/admin/categories/new"
            end
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm transition
              ${isActive
                ? dark ? "bg-slate-800 text-white" : "bg-slate-200 text-slate-900"
                : dark ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            <span className="flex items-center gap-2">
              <PlusSquare size={18} /> {!collapsed && "Add Categories"}
            </span>
          </NavLink>
        </nav>

        {/* Settings & Logout at bottom */}
        <div className={`p-2 border-t ${dark ? "border-slate-800" : "border-slate-200"}`}>
          <NavLink
            to="/admin/settings"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition
              ${isActive
                ? dark ? "bg-slate-800 text-white" : "bg-slate-200 text-slate-900"
                : dark ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            <span className="flex items-center gap-2">
              <Settings size={18} /> {!collapsed && "Settings"}
            </span>
          </NavLink>

          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition w-full mt-1 ${
              dark ? "text-red-400 hover:bg-slate-800" : "text-red-500 hover:bg-slate-100"
            }`}
          >
            <LogOut size={18} /> {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>

    </div>
  );
}