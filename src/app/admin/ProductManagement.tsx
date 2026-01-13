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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

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
    // Validation: Only require image for new products
    if (!editingId && !imageFile) {
      setErrorMessage("An image is required for new products.");
      return;
    }

    // If editing and no existing image_url AND no new image file
    if (editingId && !form.image_url && !imageFile) {
      setErrorMessage("An image is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    
    let imageUrl = form.image_url;

    // Only upload if a new image file was selected
    if (imageFile) {
      const uploadedImageUrl = await uploadImage(imageFile);
      if (uploadedImageUrl) {
        imageUrl = uploadedImageUrl;
      } else {
        setErrorMessage("Failed to upload image.");
        setIsSubmitting(false);
        return;
      }
    }

    const productData = { 
      ...form, 
      image_url: imageUrl,
      price: Number(form.price)
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(productData);
        if (error) throw error;
      }

      // Reset form
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
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      setErrorMessage("Failed to save product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
    setImageFile(null);
    setEditingId(product.id);
    setErrorMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteProduct = async (id: number) => {
    // Show confirmation dialog
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return; // User cancelled
    }

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      console.error("Error deleting product:", error.message);
      alert("Failed to delete product. Please try again.");
    } else {
      // Optional: Show success message
      alert("Product deleted successfully!");
      fetchProducts();
    }
  };

  // Alternative: Custom confirmation modal (more stylish)
  const handleDeleteClick = (id: number, productName: string) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = async (id: number) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      console.error("Error deleting product:", error.message);
      alert("Failed to delete product. Please try again.");
    } else {
      fetchProducts();
    }
    setShowDeleteConfirm(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-center">Product Management</h2>

      {errorMessage && (
        <div className="bg-red-500 text-white p-2 rounded">
          {errorMessage}
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
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
        
        <div className="space-y-2">
          <label className="block font-medium">Product Image:</label>
          <input
            type="file"
            className="w-full p-2 border rounded"
            onChange={(e) => {
              setImageFile(e.target.files?.[0] || null);
              setErrorMessage("");
            }}
            accept="image/*"
          />
          {editingId && form.image_url && !imageFile && (
            <div className="mt-2 p-2 bg-gray-50 rounded border">
              <p className="text-sm text-gray-600 mb-1">Current image (select a new file only if you want to change it):</p>
              <div className="flex items-center space-x-4">
                <Image
                  src={`${form.image_url}?w=100&q=75`}
                  alt="Current product"
                  width={60}
                  height={60}
                  unoptimized
                  className="rounded"
                />
                <span className="text-sm text-blue-600">Image will be kept as-is</span>
              </div>
            </div>
          )}
          {!editingId && (
            <p className="text-sm text-gray-500">Image is required for new products</p>
          )}
        </div>
        
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
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : editingId ? "Update Product" : "Add Product"}
        </button>
        
        {editingId && (
          <button
            onClick={() => {
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
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg"
          >
            Cancel Edit
          </button>
        )}
      </div>

      <div>
        <h3 className="text-xl mb-4">Existing Products</h3>
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
                    unoptimized
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
                  {/* Using simple browser confirm */}
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                  
                  {/* OR using custom modal (uncomment if you prefer) */}
                  {/* 
                  <button
                    onClick={() => handleDeleteClick(product.id, product.name)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                  */}
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
