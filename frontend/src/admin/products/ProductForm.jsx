import ImageUploader from "./ImageUploader";
import SpecsEditor from "./SpecsEditor";
import { UseTheme } from "./UseTheme";

export default function ProductForm({
  value,
  onChange,
  onSubmit,
  saving,
  categories = [],
  onFilesSelected,
  uploadingImages = false,
}) {
  const { theme } = UseTheme();
  const dark = theme === "dark";

  function set(field, v) {
    onChange({ ...value, [field]: v });
  }

  const inputCls = `w-full rounded-lg border px-3 py-2 outline-none transition
    ${dark
      ? "border-slate-700 bg-slate-900 text-white focus:border-slate-500"
      : "border-slate-300 bg-white text-slate-900 focus:border-slate-400"
    }`;

  const labelCls = `mb-1 block text-sm ${dark ? "text-slate-300" : "text-slate-600"}`;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">

        <div>
          <label className={labelCls}>Name</label>
          <input required value={value.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Slug</label>
          <input required value={value.slug} onChange={(e) => set("slug", e.target.value)} className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Price</label>
          <input required type="number" step="0.01" min="0" value={value.price} onChange={(e) => set("price", e.target.value)} className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Sale Price</label>
          <input type="number" step="0.01" min="0" value={value.salePrice} onChange={(e) => set("salePrice", e.target.value)} className={inputCls} placeholder="Optional" />
        </div>

        <div>
          <label className={labelCls}>SKU</label>
          <input value={value.sku} onChange={(e) => set("sku", e.target.value)} className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Stock</label>
          <input required type="number" min="0" value={value.stock} onChange={(e) => set("stock", e.target.value)} className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Category</label>
          <select required value={value.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inputCls}>
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>Badge</label>
          <select value={value.badge} onChange={(e) => set("badge", e.target.value)} className={inputCls}>
            <option value="">No badge</option>
            <option value="Hot">Hot</option>
            <option value="Sale">Sale</option>
            <option value="New">New</option>
            <option value="Featured">Featured</option>
          </select>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex items-center gap-2">
            <input
              id="isActive"
              type="checkbox"
              checked={value.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="isActive" className={`text-sm ${dark ? "text-slate-300" : "text-slate-600"}`}>Active</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="isFeatured"
              type="checkbox"
              checked={value.isFeatured}
              onChange={(e) => set("isFeatured", e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="isFeatured" className={`text-sm ${dark ? "text-slate-300" : "text-slate-600"}`}>Featured</label>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className={labelCls}>Description</label>
          <textarea
            rows={5}
            value={value.description}
            onChange={(e) => set("description", e.target.value)}
            className={inputCls}
          />
        </div>

        <SpecsEditor
          specifications={value.specifications}
          onChange={(nextSpecifications) => onChange({ ...value, specifications: nextSpecifications })}
        />

        <ImageUploader
          images={value.images}
          imageUrls={value.imageUrls}
          onFilesSelected={onFilesSelected}
          onRemove={(index) => {
            const newKeys = [...value.images];
            const newUrls = [...value.imageUrls];
            newKeys.splice(index, 1);
            newUrls.splice(index, 1);
            onChange({ ...value, images: newKeys, imageUrls: newUrls });
          }}
        />
      </div>

      <button
        type="submit"
        disabled={saving || uploadingImages}
        className="rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save Product"}
      </button>
    </form>
  );
}