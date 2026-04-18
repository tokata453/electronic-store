import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteProduct, listProducts } from "./api";
import { listCategories } from "./api";
import { useTheme } from "./useTheme";

export default function ProductsPage() {
  const { theme } = useTheme();
  const dark = theme === "dark";

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const result = await listProducts({
        search: q,
        categoryId: categoryId || undefined,
        includeInactive: true,
        page: page
      });
      setItems(result.products);
      setPagination(result.pagination);
    } catch (e) {
      setErr(e.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  // Single unified effect — debounces search while responding immediately to page/category changes
  useEffect(() => {
    const t = setTimeout(() => load(), q ? 300 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, categoryId, page]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await listCategories();
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    }
    loadCategories();
  }, []);

  async function onDelete(id) {
    try {
      await deleteProduct(id);
      setConfirmDeleteId(null);
      await load();
    } catch (e) {
      setErr(e.message || "Delete failed");
      setConfirmDeleteId(null);
    }
  }

  const inputCls = `px-3 py-2 rounded ${dark ? "bg-slate-800 text-white" : "bg-white text-slate-900 border border-slate-300"}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-lg font-semibold">Product List</span>
        <div className="flex gap-3 items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
            className={inputCls}
            aria-label="Search products"
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputCls}
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center justify-center rounded-lg bg-emerald-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
        >
          + New Product
        </Link>
      </div>

      {err && (
        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-200 ring-1 ring-red-500/30">
          {err}
        </div>
      )}

      <div className={`overflow-hidden rounded-xl ring-1 ${dark ? "ring-slate-800" : "ring-slate-200"}`}>
        <table className="w-full text-left text-sm">
          <thead className={dark ? "bg-slate-950 text-slate-300" : "bg-slate-50 text-slate-600"}>
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className={`divide-y ${dark ? "divide-slate-800" : "divide-slate-100"}`}>
            {loading ? (
              <tr>
                <td className={`px-4 py-4 ${dark ? "text-slate-400" : "text-slate-500"}`} colSpan={7}>
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className={`px-4 py-4 ${dark ? "text-slate-400" : "text-slate-500"}`} colSpan={7}>
                  No products found.
                </td>
              </tr>
            ) : (
              items.map((p) => (
                <tr key={p.id} className={dark ? "hover:bg-slate-950/40" : "hover:bg-slate-50"}>
                  <td className="px-4 py-3">
                    {p.imageUrls?.length > 0 ? (
                      <img
                        src={p.imageUrls[0]}
                        alt={p.name}
                        className={`h-12 w-12 rounded-lg object-cover ring-1 ${dark ? "ring-slate-700" : "ring-slate-200"}`}
                      />
                    ) : (
                      <div className={`h-12 w-12 rounded-lg ${dark ? "bg-slate-800" : "bg-slate-100"}`} />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">
                    {p.salePrice ? (
                      <div className="flex flex-col">
                        <span className="font-semibold">${p.salePrice}</span>
                        <span className="text-xs line-through text-slate-400">${p.price}</span>
                      </div>
                    ) : (
                      <span>${p.price}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">{p.category?.name ?? "-"}</td>

                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.isActive
                        ? "bg-emerald-500/15 text-emerald-500"
                        : dark ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"
                    }`}>
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/products/${p.id}`}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${dark ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-slate-200 hover:bg-slate-300 text-slate-800"}`}
                      >
                        Edit
                      </Link>

                      {confirmDeleteId === p.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onDelete(p.id)}
                            className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
                            aria-label={`Confirm delete ${p.name}`}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${dark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}
                            aria-label="Cancel delete"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(p.id)}
                          className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/30"
                          aria-label={`Delete ${p.name}`}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className={`px-3 py-2 rounded disabled:opacity-40 ${dark ? "bg-slate-800 text-white" : "bg-white border border-slate-300 text-slate-700"}`}
        >
          Previous
        </button>
        <span className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>
          Page {pagination?.page} of {pagination?.totalPages ?? 1}
        </span>
        <button
          disabled={page >= (pagination?.totalPages ?? 1)}
          onClick={() => setPage(page + 1)}
          className={`px-3 py-2 rounded disabled:opacity-40 ${dark ? "bg-slate-800 text-white" : "bg-white border border-slate-300 text-slate-700"}`}
        >
          Next
        </button>
      </div>

      {!loading && (
        <div className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{items.length} products</div>
      )}
    </div>
  );
}
