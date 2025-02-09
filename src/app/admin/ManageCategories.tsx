"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Category {
  id: number;
  name: string;
  subcategories: string[];
}

export default function ManageCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState<string>("");
  const [newSubcategory, setNewSubcategory] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<{ category?: number; subcategory?: string } | null>(
    null
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) {
      console.error("Error fetching categories:", error.message);
    } else {
      setCategories(data || []);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory) return;

    setIsSubmitting({ category: -1 });
    const { error } = await supabase
      .from("categories")
      .insert({ name: newCategory, subcategories: [] });
    if (error) {
      console.error("Error adding category:", error.message);
    } else {
      setNewCategory("");
      fetchCategories();
    }
    setIsSubmitting(null);
  };

  const handleAddSubcategory = async () => {
    if (!newSubcategory || selectedCategory === null) return;

    setIsSubmitting({ category: selectedCategory });
    const category = categories.find((cat) => cat.id === selectedCategory);
    if (!category) return;

    const updatedSubcategories = [...category.subcategories, newSubcategory];

    const { error } = await supabase
      .from("categories")
      .update({ subcategories: updatedSubcategories })
      .eq("id", selectedCategory);
    if (error) {
      console.error("Error adding subcategory:", error.message);
    } else {
      setNewSubcategory("");
      fetchCategories();
    }
    setIsSubmitting(null); // Reset submission state
  };

  const handleDeleteCategory = async (categoryId: number) => {
    setIsSubmitting({ category: categoryId });
    const { error } = await supabase.from("categories").delete().eq("id", categoryId);
    if (error) {
      console.error("Error deleting category:", error.message);
    } else {
      fetchCategories();
    }
    setIsSubmitting(null);
  };

  const handleDeleteSubcategory = async (categoryId: number, subcategory: string) => {
    setIsSubmitting({ subcategory });
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) return;

    const updatedSubcategories = category.subcategories.filter((sub) => sub !== subcategory);

    const { error } = await supabase
      .from("categories")
      .update({ subcategories: updatedSubcategories })
      .eq("id", categoryId);
    if (error) {
      console.error("Error deleting subcategory:", error.message);
    } else {
      fetchCategories();
    }
    setIsSubmitting(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-center">Manage Categories</h2>

      <div className="space-y-4">
        <h3 className="text-xl">Add a New Category</h3>
        <input
          type="text"
          placeholder="Category Name"
          className="w-full p-2 border rounded"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button
          onClick={handleAddCategory}
          className={`bg-green-500 text-white px-4 py-2 rounded-lg ${
            isSubmitting?.category !== undefined ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isSubmitting?.category !== undefined}
        >
          Add Category
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl">Add a Subcategory</h3>
        <select
          value={selectedCategory || ""}
          onChange={(e) => setSelectedCategory(Number(e.target.value))}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Subcategory Name"
          className="w-full p-2 border rounded"
          value={newSubcategory}
          onChange={(e) => setNewSubcategory(e.target.value)}
        />
        <button
          onClick={handleAddSubcategory}
          className={`bg-blue-500 text-white px-4 py-2 rounded-lg ${
            isSubmitting?.category === selectedCategory ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isSubmitting?.category === selectedCategory || selectedCategory === null}
        >
          Add Subcategory
        </button>
      </div>

      <div>
        <h3 className="text-xl">Categories</h3>
        <ul className="space-y-4">
          {categories.map((category) => (
            <li key={category.id} className="border p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">{category.name}</h4>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className={`bg-red-500 text-white px-4 py-2 rounded-lg ${
                    isSubmitting?.category === category.id ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isSubmitting?.category === category.id}
                >
                  Delete Category
                </button>
              </div>
              <ul className="pl-6 list-disc">
                {category.subcategories.map((sub) => (
                  <li key={sub} className="flex justify-between items-center py-2 border-b border-black/25">
                    <span>{sub}</span>
                    <button
                      onClick={() => handleDeleteSubcategory(category.id, sub)}
                      className={`bg-red-500 text-white px-4 py-2 rounded-lg ${
                        isSubmitting?.subcategory === sub ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={isSubmitting?.subcategory === sub}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
