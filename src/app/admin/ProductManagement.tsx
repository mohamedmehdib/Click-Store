"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category: string;
  subcategory: string;
  is_available: boolean;
}

interface Category {
  id: number;
  name: string;
  subcategories: string[];
}

const ProductManagement = () => {
  const [form, setForm] = useState({
    name: "",
    price: 0,
    image_url: "",
    category: "",
    subcategory: "",
    is_available: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (error) {
      console.error("Error fetching products:", error.message);
    } else {
      setProducts(data || []);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) {
      console.error("Error fetching categories:", error.message);
    } else {
      setCategories(data || []);
    }
  };

  const uploadImage = async (file: File) => {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("products").upload(fileName, file);

    if (error) {
      console.error("Error uploading image:", error.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);

    return publicUrlData?.publicUrl || null;
  };

  const handleSaveProduct = async () => {
    if (!imageFile) {
      setErrorMessage("An image is required.");
      return;
    }

    setIsSubmitting(true);
    let imageUrl = form.image_url;

    if (imageFile) {
      const uploadedImageUrl = await uploadImage(imageFile);
      if (uploadedImageUrl) {
        imageUrl = uploadedImageUrl;
      }
    }

    const productData = { ...form, image_url: imageUrl };

    if (editingId) {
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingId);
      if (error) {
        console.error("Error updating product:", error.message);
      }
    } else {
      const { error } = await supabase.from("products").insert(productData);
      if (error) {
        console.error("Error adding product:", error.message);
      }
    }

    setForm({
      name: "",
      price: 0,
      image_url: "",
      category: "",
      subcategory: "",
      is_available: true,
    });
    setImageFile(null);
    setEditingId(null);
    setErrorMessage("");
    fetchProducts();
    setIsSubmitting(false);
  };

  const handleEditProduct = (product: Product) => {
    setForm({
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      category: product.category,
      subcategory: product.subcategory,
      is_available: product.is_available,
    });
    setEditingId(product.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteProduct = async (id: number) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      console.error("Error deleting product:", error.message);
    }
    fetchProducts();
  };

  const handleToggleAvailability = async (product: Product) => {
    const updatedStatus = !product.is_available;
    const { error } = await supabase
      .from("products")
      .update({ is_available: updatedStatus })
      .eq("id", product.id);
    if (error) {
      console.error("Error toggling availability:", error.message);
    }
    fetchProducts();
  };

  const filteredSubcategories = form.category
    ? categories.find((cat) => cat.name === form.category)?.subcategories || []
    : [];

  const isFormValid = !!imageFile;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-center">Product Management</h2>

      {errorMessage && (
        <div className="bg-red-500 text-white p-2 rounded">
          {errorMessage}
        </div>
      )}

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Product Name"
          className="w-full p-2 border rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          className="w-full p-2 border rounded"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: "" })}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          value={form.subcategory}
          onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
          className="w-full p-2 border rounded"
          disabled={!filteredSubcategories.length}
        >
          <option value="">Select Subcategory</option>
          {filteredSubcategories.map((subcategory, idx) => (
            <option key={idx} value={subcategory}>
              {subcategory}
            </option>
          ))}
        </select>
        <input
          type="file"
          className="w-full p-2 border rounded"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          required
        />
        <div className="flex items-center space-x-2">
          <span>Available:</span>
          <input
            type="checkbox"
            checked={form.is_available}
            onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
            className="w-6 h-6"
          />
        </div>
        <button
          onClick={handleSaveProduct}
          className={`bg-green-500 text-white px-4 py-2 rounded-lg ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={isSubmitting || !isFormValid}
        >
          {editingId ? "Update Product" : "Add Product"}
        </button>
      </div>

      <div>
        <h3 className="text-xl">Existing Products</h3>
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Price</th>
              <th className="border px-4 py-2">Category</th>
              <th className="border px-4 py-2">Subcategory</th>
              <th className="border px-4 py-2">Available</th>
              <th className="border px-4 py-2">Image</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="border px-4 py-2">{product.name}</td>
                <td className="border px-4 py-2">{product.price} Dt</td>
                <td className="border px-4 py-2">{product.category}</td>
                <td className="border px-4 py-2">{product.subcategory}</td>
                <td className="border px-4 py-2">
                  <input
                    type="checkbox"
                    checked={product.is_available}
                    onChange={() => handleToggleAvailability(product)}
                    className="w-6 h-6"
                  />
                </td>
                <td className="border px-4 py-2">
                  <Image
                    src={`${product.image_url}?w=500&q=75`}
                    alt={product.name}
                    width={50}
                    height={50}
                    className="block mx-auto"
                  />
                </td>
                <td className="border px-4 py-2 space-x-2">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManagement;
