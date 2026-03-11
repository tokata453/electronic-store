import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteCategory, listCategories } from "./api";
import { UseTheme } from "./UseTheme";

export default function CategoriesPage() {
  const { theme } = UseTheme();
  const dark = theme === "dark";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const cats = await listCategories();
      setItems(cats);
    } catch (e) {
      setErr(e.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onDelete(id) {
    const ok = confirm("Delete this category?");
    if (!ok) return;
    try {
      await deleteCategory(id);
      await load();
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold">Categories</span>
        <Link
          to="/admin/categories/new"
          className="inline-flex items-center justify-center rounded-lg bg-emerald-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
        >
          + New Category
        </Link>
      </div>

      {err && (
        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 ring-1 ring-red-500/30">
          {err}
        </div>
      )}

      {/* Table */}
      <div className={`overflow-hidden rounded-xl ring-1 ${dark ? "ring-slate-800" : "ring-slate-200"}`}>
        <table className="w-full text-left text-sm">
          <thead className={dark ? "bg-slate-950 text-slate-300" : "bg-slate-50 text-slate-600"}>
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Sort Order</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className={`divide-y ${dark ? "divide-slate-800" : "divide-slate-100"}`}>
            {loading ? (
              <tr>
                <td className={`px-4 py-4 ${dark ? "text-slate-400" : "text-slate-500"}`} colSpan={6}>
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className={`px-4 py-4 ${dark ? "text-slate-400" : "text-slate-500"}`} colSpan={6}>
                  No categories found.
                </td>
              </tr>
            ) : (
              items.map((cat) => (
                <tr key={cat.id} className={dark ? "hover:bg-slate-950/40" : "hover:bg-slate-50"}>

                  {/* Image */}
                  <td className="px-4 py-3">
                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className={`h-12 w-12 rounded-lg object-cover ring-1 ${dark ? "ring-slate-700" : "ring-slate-200"}`}
                      />
                    ) : (
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center text-xl ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
                        {cat.icon ?? "📁"}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className={`px-4 py-3 font-mono text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{cat.slug}</td>
                  <td className="px-4 py-3">{cat.sortOrder ?? "-"}</td>

                  {/* Status badge */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      cat.isActive
                        ? "bg-emerald-500/15 text-emerald-500"
                        : dark ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"
                    }`}>
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/categories/${cat.id}`}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${dark ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-slate-200 hover:bg-slate-300 text-slate-800"}`}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => onDelete(cat.id)}
                        className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/30"
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

      {!loading && (
        <div className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
          {items.length} {items.length === 1 ? "category" : "categories"}
        </div>
      )}
    </div>
  );
}