import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createCategory, getCategory, updateCategory } from "./api";
import { useTheme } from "./useTheme";

const emptyCategory = {
  name: "",
  slug: "",
  description: "",
  icon: "",
  sortOrder: "",
  isActive: true,
};

export default function CategoryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { theme } = useTheme();
  const dark = theme === "dark";

  const [value, setValue] = useState(emptyCategory);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    async function loadCategory() {
      setLoading(true);
      setErr("");
      try {
        const cat = await getCategory(id);
        setValue({
          name: cat?.name ?? "",
          slug: cat?.slug ?? "",
          description: cat?.description ?? "",
          icon: cat?.icon ?? "",
          sortOrder: cat?.sortOrder ?? "",
          isActive: cat?.isActive ?? true,
        });
      } catch (e) {
        setErr(e.message || "Failed to load category");
      } finally {
        setLoading(false);
      }
    }
    loadCategory();
  }, [id, isEdit]);

  // Auto-generate slug from name (only on create)
  function handleNameChange(name) {
    setValue((prev) => ({
      ...prev,
      name,
      ...(!isEdit && {
        slug: name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      }),
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErr("");

    const payload = {
      name: value.name.trim(),
      slug: value.slug.trim(),
      description: value.description.trim(),
      icon: value.icon.trim() || null,
      sortOrder: value.sortOrder === "" ? null : Number(value.sortOrder),
      isActive: Boolean(value.isActive),
    };

    try {
      if (isEdit) {
        await updateCategory(id, payload);

        navigate("/admin/categories");
        return;
      }

      const created = await createCategory(payload);

      navigate("/admin/categories");
    } catch (e) {
      setErr(e.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  }

  const inputCls = `w-full rounded-lg border px-3 py-2 outline-none transition
    ${dark
      ? "border-slate-700 bg-slate-900 text-white focus:border-slate-500"
      : "border-slate-300 bg-white text-slate-900 focus:border-slate-400"
    }`;

  const labelCls = `mb-1 block text-sm ${dark ? "text-slate-300" : "text-slate-600"}`;

  return (
    <div className="space-y-5 max-w-2xl">

      {/* Breadcrumb + title */}
      <div>
        <p className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>
          <Link to="/admin/categories" className="hover:underline">Categories</Link>
          {" / "}
          {isEdit ? "Edit Category" : "Add Category"}
        </p>
        <h1 className={`text-2xl font-semibold ${dark ? "text-white" : "text-slate-900"}`}>
          {isEdit ? "Edit Category" : "Add Category"}
        </h1>
      </div>

      {err && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {err}
        </div>
      )}

      {loading ? (
        <div className={dark ? "text-slate-300" : "text-slate-600"}>Loading...</div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">

            <div>
              <label className={labelCls}>Name</label>
              <input
                required
                value={value.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Slug</label>
              <input
                required
                value={value.slug}
                onChange={(e) => setValue({ ...value, slug: e.target.value })}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Icon <span className={`text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>(e.g. Smartphone, Laptop)</span></label>
              <input
                value={value.icon}
                onChange={(e) => setValue({ ...value, icon: e.target.value })}
                placeholder="Optional icon name"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Sort Order</label>
              <input
                type="number"
                min="0"
                value={value.sortOrder}
                onChange={(e) => setValue({ ...value, sortOrder: e.target.value })}
                placeholder="Optional"
                className={inputCls}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelCls}>Description</label>
              <textarea
                rows={3}
                value={value.description}
                onChange={(e) => setValue({ ...value, description: e.target.value })}
                className={inputCls}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isActive"
                type="checkbox"
                checked={value.isActive}
                onChange={(e) => setValue({ ...value, isActive: e.target.checked })}
                className="h-4 w-4"
              />
              <label htmlFor="isActive" className={`text-sm ${dark ? "text-slate-300" : "text-slate-600"}`}>
                Active
              </label>
            </div>

          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Category"}
          </button>
        </form>
      )}
    </div>
  );
}
