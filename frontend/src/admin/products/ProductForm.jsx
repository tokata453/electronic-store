import ImageUploader from "./ImageUploader";

export default function ProductForm({
  value,
  onChange,
  onSubmit,
  saving,
  categories = [],
  onFilesSelected,
  uploadingImages = false,
}) {
  function set(field, v) {
    onChange({ ...value, [field]: v });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-slate-300">Name</label>
          <input
            required
            value={value.name}
            onChange={(e) => set("name", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Slug</label>
          <input
            required
            value={value.slug}
            onChange={(e) => set("slug", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Price</label>
          <input
            required
            type="number"
            step="0.01"
            min="0"
            value={value.price}
            onChange={(e) => set("price", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Sale Price</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={value.salePrice}
            onChange={(e) => set("salePrice", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-slate-500"
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">SKU</label>
          <input
            value={value.sku}
            onChange={(e) => set("sku", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Stock</label>
          <input
            required
            type="number"
            min="0"
            value={value.stock}
            onChange={(e) => set("stock", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Category</label>
          <select
            required
            value={value.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-slate-500"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-300">Badge</label>
          <select
            value={value.badge}
            onChange={(e) => set("badge", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-slate-500"
          >
            <option value="">No badge</option>
            <option value="Hot">Hot</option>
            <option value="Sale">Sale</option>
            <option value="New">New</option>
            <option value="Featured">Featured</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm text-slate-300">Description</label>
          <textarea
            rows={5}
            value={value.description}
            onChange={(e) => set("description", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-slate-500"
          />
        </div>
        <div className="flex items-start gap-2">
          <input
            id="isActive"
            type="checkbox"
            checked={value.isActive}
            onChange={(e) => set("isActive", e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="isActive" className="text-sm text-slate-300">
            Active
          </label>

          <input
            id="isFeatured"
            type="checkbox"
            checked={value.isFeatured}
            onChange={(e) => set("isFeatured", e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="isFeatured" className="text-sm text-slate-300">
            Featured
          </label>
        </div>
        <div></div>
        
        <ImageUploader
          images={value.images}
          imageUrls={value.imageUrls}
          onFilesSelected={onFilesSelected}
          onRemove={(index) => {
            const newKeys = [...value.images];
            const newUrls = [...value.imageUrls];

            newKeys.splice(index, 1);
            newUrls.splice(index, 1);

            onChange({
              ...value,
              images: newKeys,
              imageUrls: newUrls
            });
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