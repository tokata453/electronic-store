import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteProduct, listProducts } from "./api";
import { getCategories } from "../../services/categories";

export default function ProductsPage() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  async function load() {
    setLoading(true);
    setErr("");

    try {
      const result = await listProducts({
        search: q,
        categoryId: categoryId || undefined,
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

  useEffect(() => {
    const t = setTimeout(() => load(), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, categoryId]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, categoryId]);

  const filteredCount = useMemo(() => items.length, [items]);

  async function onDelete(id) {
    const ok = confirm("Delete this product?");
    if (!ok) return;
    try {
      await deleteProduct(id);
      await load();
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-lg font-semibold">Product List</span>
        <div className="flex gap-3 items-center">
          {/* Search */}
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
            className="px-3 py-2 rounded bg-slate-800 text-white"
          />

          {/* Category filter */}
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="px-3 py-2 rounded bg-slate-800 text-white"
          >
            <option value="">All Categories</option>

            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
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

      <div className="overflow-hidden rounded-xl ring-1 ring-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950 text-slate-300">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-slate-400" colSpan={5}>
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-400" colSpan={5}>
                  No products found.
                </td>
              </tr>
            ) : (
              items.map((p) => (
                <tr key={p.id} className="hover:bg-slate-950/40">

                  {/* Image */}
                  <td className="px-4 py-3">
                    {p.imageUrls?.length > 0 ? (
                      <img
                        src={p.imageUrls[0]}
                        alt={p.name}
                        className="h-12 w-12 rounded-lg object-cover ring-1 ring-slate-700"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-slate-800" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">
                    {p.salePrice ? (
                      <div className="flex flex-col">
                        <span className="font-semibold">${p.salePrice}</span>
                        <span className="text-xs text-slate-400 line-through">${p.price}</span>
                      </div>
                    ) : (
                      <span>${p.price}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">{p.category?.name ?? "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/products/${p.id}`}
                        className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold hover:bg-slate-700"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => onDelete(p.id)}
                        className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/30"
                      >
                        Delete
                      </button>
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
          className="px-3 py-2 bg-slate-800 rounded disabled:opacity-40"
        >
          Previous
        </button>

        <span className="text-sm text-slate-400">
          Page {pagination?.page} of {pagination?.totalPages ?? 1}
        </span>

        <button
          disabled={page >= (pagination?.totalPages ?? 1)}
          onClick={() => setPage(page + 1)}
          className="px-3 py-2 bg-slate-800 rounded disabled:opacity-40"
        >
          Next
        </button>

      </div>

      {!loading && (
        <div className="text-xs text-slate-400">{filteredCount} products</div>
      )}
    </div>
  );
}