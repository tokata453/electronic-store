import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ProductForm from "./ProductForm";
import { createProduct, getProduct, updateProduct, uploadProductImage, deleteProductImage } from "./api";
import { listCategories } from "./api";
import { useTheme } from "./useTheme";

const emptyProduct = {
  name: "",
  slug: "",
  description: "",
  specifications: {},
  price: "",
  salePrice: "",
  sku: "",
  stock: "",
  categoryId: "",
  images: [],
  imageUrls: [],
  imagesToDelete: [],
  newImagePreviews: [],
  badge: "",
  isFeatured: false,
  isActive: true,
};

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { theme } = useTheme();
  const dark = theme === "dark";

  const [value, setValue] = useState(emptyProduct);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [err, setErr] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  // Track blob URLs separately for safe cleanup
  const blobUrlsRef = useRef([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await listCategories();
        setCategories(cats);
      } catch (e) {
        console.error("Failed to load categories:", e);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    if (!isEdit) return;

    async function loadProduct() {
      setLoading(true);
      setErr("");
      try {
        const product = await getProduct(id);
        setValue({
          name: product?.name ?? "",
          slug: product?.slug ?? "",
          description: product?.description ?? "",
          specifications: product?.specifications ?? {},
          price: product?.price ?? "",
          salePrice: product?.salePrice ?? "",
          sku: product?.sku ?? "",
          stock: product?.stock ?? "",
          categoryId: String(product?.categoryId ?? product?.category?.id ?? ""),
          images: Array.isArray(product?.images) ? product.images : [],
          imageUrls: Array.isArray(product?.imageUrls) ? product.imageUrls : [],
          imagesToDelete: [],
          newImagePreviews: [],
          badge: product?.badge ?? "",
          isFeatured: Boolean(product?.isFeatured),
          isActive: product?.isActive ?? true,
        });
      } catch (e) {
        setErr(e.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id, isEdit]);

  // Clean up blob URLs on unmount only
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  async function handleFilesSelected(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    // Track blob URLs for cleanup
    blobUrlsRef.current.push(...previewUrls);

    if (!isEdit) {
      setSelectedFiles((prev) => [...prev, ...files]);
      setValue((prev) => ({
        ...prev,
        imageUrls: [...(prev.imageUrls || []), ...previewUrls],
      }));
      e.target.value = "";
      return;
    }

    try {
      setUploadingImages(true);
      const uploaded = await Promise.all(files.map(file => uploadProductImage(id, file)));
      const keys = uploaded.flatMap((i) => i.keys || []);
      const urls = uploaded.flatMap((i) => i.uploadedUrls || []);
      setValue((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...keys],
        imageUrls: [...(prev.imageUrls || []), ...urls],
      }));
    } catch (err) {
      setErr("Image upload failed");
    } finally {
      setUploadingImages(false);
      e.target.value = "";
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErr("");

    const payload = {
      name: value.name.trim(),
      slug: value.slug.trim(),
      description: value.description.trim(),
      specifications: value.specifications,
      price: Number(value.price),
      salePrice: value.salePrice === "" ? null : Number(value.salePrice),
      sku: value.sku.trim(),
      stock: Number(value.stock),
      categoryId: Number(value.categoryId),
      images: isEdit ? value.images : [],
      badge: value.badge || null,
      isFeatured: Boolean(value.isFeatured),
      isActive: Boolean(value.isActive),
    };

    try {
      if (isEdit) {
        await updateProduct(id, payload);
        if (value.imagesToDelete?.length > 0) {
          await Promise.all(value.imagesToDelete.map((key) => deleteProductImage(id, key)));
        }
        navigate("/admin/products");
        return;
      }
      const created = await createProduct(payload);
      const productId = created.id;
      if (selectedFiles.length > 0) {
        await Promise.all(selectedFiles.map((file) => uploadProductImage(productId, file)));
      }
      navigate("/admin/products");
    } catch (e) {
      setErr(e.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>
          <Link to="/admin/products" className="hover:underline">
            Products
          </Link>
          {" / "}
          {isEdit ? "Edit Product" : "Add Product"}
        </p>
        <h1 className={`text-2xl font-semibold ${dark ? "text-white" : "text-slate-900"}`}>
          {isEdit ? "Edit Product" : "Add Product"}
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
        <ProductForm
          value={value}
          onChange={setValue}
          onSubmit={onSubmit}
          saving={saving}
          categories={categories}
          onFilesSelected={handleFilesSelected}
          uploadingImages={uploadingImages}
          isEdit={isEdit}
        />
      )}
    </div>
  );
}