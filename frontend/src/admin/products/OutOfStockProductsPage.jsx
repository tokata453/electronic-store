import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { getLowStockProducts } from "../../services/admin";
import { useTheme } from "./useTheme";

export default function OutOfStockProductsPage() {
  const { theme } = useTheme();
  const dark = theme === "dark";

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await getLowStockProducts({ threshold: 1 });
      const rows = res?.data?.lowStockProducts ?? [];
      setItems(rows.filter((item) => Number(item.stock) === 0));
    } catch (e) {
      setErr(e.message || "Failed to load out of stock products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      return (
        item.name?.toLowerCase().includes(q) ||
        item.sku?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
      );
    });
  }, [items, search]);

  const inputCls = `px-3 py-2 rounded ${dark ? "bg-slate-800 text-white" : "bg-white text-slate-900 border border-slate-300"}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>
            Products / Out of Stock
          </p>
          <h1 className="text-xl font-semibold">Out of Stock Products</h1>
        </div>

        <div className="flex gap-2">
          <button
            onClick={load}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
              dark
                ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                : "bg-slate-200 text-slate-900 hover:bg-slate-300"
            }`}
          >
            <RefreshCw size={16} /> Refresh
          </button>

          <Link
            to="/admin/products/new"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
          >
            + New Product
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, SKU, category..."
          className={`${inputCls} w-full sm:max-w-md`}
          aria-label="Search out of stock products"
        />

        <div className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${dark ? "bg-amber-500/10 text-amber-300" : "bg-amber-100 text-amber-800"}`}>
          <AlertTriangle size={16} />
          Total out of stock: <span className="font-semibold">{items.length}</span>
        </div>
      </div>

      {err && (
        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 ring-1 ring-red-500/30">
          {err}
        </div>
      )}

      <div className={`overflow-hidden rounded-xl ring-1 ${dark ? "ring-slate-800" : "ring-slate-200"}`}>
        <table className="w-full text-left text-sm">
          <thead className={dark ? "bg-slate-950 text-slate-300" : "bg-slate-50 text-slate-600"}>
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody className={`divide-y ${dark ? "divide-slate-800" : "divide-slate-100"}`}>
            {loading ? (
              <tr>
                <td className={`px-4 py-4 ${dark ? "text-slate-400" : "text-slate-500"}`} colSpan={6}>
                  Loading...
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td className={`px-4 py-4 ${dark ? "text-slate-400" : "text-slate-500"}`} colSpan={6}>
                  No out of stock products found.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className={dark ? "hover:bg-slate-950/40" : "hover:bg-slate-50"}>
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3">{item.sku || "-"}</td>
                  <td className="px-4 py-3">{item.category || "-"}</td>
                  <td className="px-4 py-3">${item.price ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-500">
                      0
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <Link
                        to={`/admin/products/${item.id}`}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                          dark
                            ? "bg-slate-800 hover:bg-slate-700 text-white"
                            : "bg-slate-200 hover:bg-slate-300 text-slate-800"
                        }`}
                      >
                        Restock
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
