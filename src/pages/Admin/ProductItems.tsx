import { useState, useEffect } from "react";
import axios from "axios";
import { message } from "antd";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ProductTable from "../../components/ecommerce/ProductTable";
import AddProductModal from "../../components/ecommerce/AddProductsModal";
import { apiUrl, API_CONFIG } from "../../utilities/config";

interface Product {
  id: number;
  name: string;
  category: string;
  status: "Active" | "Inactive";
  createdDate: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(apiUrl("/api/products"));
      console.log("✅ Fetched products:", response.data);
      setProducts(response.data);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      message.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  // Add product via API
  const addProduct = async (
    productData: Omit<Product, "id" | "createdDate">
  ): Promise<void> => {
    try {
      const payload = {
        ...productData,
        createdDate: new Date().toISOString(),
      };

      console.log("📤 Sending product payload:", payload);
      console.log(
        "🔗 API endpoint:",
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.AddProducts)
      );

      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.AddProducts),
        payload
      );

      console.log("✅ Product added successfully:", response.data);
      console.log("📊 Response status:", response.status);
      console.log("📋 Response headers:", response.headers);

      // Add the new product to the local state
      setProducts((prev) => [...prev, response.data]);
      setShowAddModal(false);

      // Optionally refresh the list
      await fetchProducts();
    } catch (error) {
      console.error("❌ Error adding product:", error);

      // Log more detailed error information
      if (axios.isAxiosError(error)) {
        console.error("📋 Error response:", error.response?.data);
        console.error("📊 Error status:", error.response?.status);
        console.error("🔗 Error config:", error.config);
      }

      throw error; // Re-throw to let modal handle the error
    }
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      !categoryFilter || product.category === categoryFilter;
    const matchesStatus = !statusFilter || product.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories for filter dropdown
  const categories = [...new Set(products.map((p) => p.category))];

  useEffect(() => {
    fetchProducts();
  }, []);

  // Log filtered products when filters change
  useEffect(() => {
    console.log("🔍 Filtered products:", filteredProducts);
    console.log("📊 Search term:", searchTerm);
    console.log("🏷️ Category filter:", categoryFilter);
    console.log("📋 Status filter:", statusFilter);
  }, [filteredProducts, searchTerm, categoryFilter, statusFilter]);

  return (
    <div>
      <PageMeta
        title="AY Developers | Products"
        description="A list of products available in the AY Developers store"
      />
      <PageBreadcrumb pageTitle="Product Page" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {/* Header Section */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="mb-2 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
              Products Management
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your product inventory
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Product
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
          {/* Search Bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Products Table */}
        <ProductTable products={filteredProducts} loading={loading} />

        {/* Add Product Modal */}
        <AddProductModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={addProduct}
        />
      </div>
    </div>
  );
}
