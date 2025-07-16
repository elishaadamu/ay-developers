import { useState, useEffect } from "react";
import axios from "axios";
import { message, DatePicker } from "antd";
import type { RangePickerProps } from "antd/es/date-picker";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

import ProductTable from "../../components/ecommerce/ProductTable";
import AddProductModal from "../../components/ecommerce/AddProductsModal";
import PerformanceModal from "../../components/ecommerce/PerformanceModal";
import SGListModal from "../../components/ecommerce/SGListModal";
import { apiUrl, API_CONFIG } from "../../utilities/config";
dayjs.extend(isBetween);

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  images: string[];
  status: "Active" | "Inactive";
  createdDate: string;
  salesCount: number;
}

const sampleProducts: Product[] = [
  {
    id: 1,
    name: "Basic Reseller Hosting",
    price: 299.99,
    description: "Entry level reseller hosting package with essential features",
    images: ["https://placehold.co/100x100"],
    status: "Active",
    createdDate: new Date().toISOString(),
    salesCount: 15,
  },
  {
    id: 2,
    name: "Premium Reseller Hosting",
    price: 599.99,
    description: "Advanced reseller hosting with premium resources and support",
    images: ["https://placehold.co/100x100"],
    status: "Active",
    createdDate: new Date().toISOString(),
    salesCount: 8,
  },
  {
    id: 3,
    name: "Business Website Package",
    price: 799.99,
    description: "Professional website development for businesses",
    images: ["https://placehold.co/100x100"],
    status: "Active",
    createdDate: new Date().toISOString(),
    salesCount: 12,
  },
  {
    id: 4,
    name: "E-commerce Website",
    price: 1499.99,
    description: "Complete e-commerce website solution",
    images: ["https://placehold.co/100x100"],
    status: "Inactive",
    createdDate: new Date().toISOString(),
    salesCount: 5,
  },
  {
    id: 5,
    name: "Premium Console Service",
    price: 399.99,
    description: "24/7 console management and monitoring",
    images: ["https://placehold.co/100x100"],
    status: "Active",
    createdDate: new Date().toISOString(),
    salesCount: 20,
  },
];

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showSGListModal, setShowSGListModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState<"day" | "month">(
    "day"
  );
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null]
  >([null, null]);

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProducts(sampleProducts);
      console.log("✅ Fetched products:", sampleProducts);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      message.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  // Add product via API
  const addProduct = async (
    productData: Omit<Product, "id" | "createdDate" | "salesCount">
  ): Promise<void> => {
    try {
      const payload = {
        ...productData,
        createdDate: new Date().toISOString(),
        salesCount: 0, // Initialize with 0 sales for new products
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

  // Update the deleteProduct function to work with sample data
  const deleteProduct = async (productId: number) => {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== productId)
      );
      message.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      message.error("Failed to delete product");
    }
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || product.status === statusFilter;

    // Add date range filtering
    const matchesDate =
      !dateRange[0] ||
      !dateRange[1] ||
      dayjs(product.createdDate).isBetween(
        dateRange[0],
        dateRange[1],
        "day",
        "[]"
      );

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Add date range change handler
  const handleDateRangeChange: RangePickerProps["onChange"] = (dates) => {
    setDateRange(dates || [null, null]);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Log filtered products when filters change
  useEffect(() => {
    console.log("🔍 Filtered products:", filteredProducts);
    console.log("📊 Search term:", searchTerm);
    console.log("📋 Status filter:", statusFilter);
  }, [filteredProducts, searchTerm, statusFilter]);

  return (
    <div>
      <PageMeta
        title="AY Developers | Products"
        description="Product management and performance tracking"
      />
      <PageBreadcrumb pageTitle="Product Management" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {/* Header Section with Action Buttons */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="mb-2 font-semibold text-gray-800 dark:text-white/90 text-xl md:text-2xl">
              Products Management
            </h3>
            <p className="text-gray-600  dark:text-gray-400 text-[12px] md:text-sm">
              Manage products, track performance, and handle S&G lists
            </p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-end gap-2 w-full mt-[0px] md:mt-[-20px]">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-[11px] md:text-[14px] font-medium text-white hover:bg-blue-700"
            >
              <svg
                className="h-3 w-3 md:h-5 md:w-5"
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

            <button
              onClick={() => setShowSGListModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-[11px] md:text-[14px] font-medium text-white hover:bg-purple-700"
            >
              <svg
                className="h-3 w-3 md:h-5 md:w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Manage S&G Lists
            </button>

            <button
              onClick={() => setShowPerformanceModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-[11px] md:text-[14px] font-medium text-white hover:bg-green-700"
            >
              <svg
                className="h-3 w-3 md:h-5 md:w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              View Performance
            </button>
          </div>
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

          {/* Date Range Picker */}
          <DatePicker.RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            className="w-full sm:w-auto dark:bg-gray-700"
            placeholder={["Start date", "End date"]}
            style={{ borderRadius: "0.375rem" }}
          />
        </div>

        {/* Products Table */}
        <ProductTable
          products={filteredProducts}
          loading={loading}
          onDelete={deleteProduct}
        />

        {/* Modals */}
        <AddProductModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={addProduct}
        />

        <PerformanceModal
          open={showPerformanceModal}
          onClose={() => setShowPerformanceModal(false)}
          timeframe={selectedTimeframe}
          onTimeframeChange={setSelectedTimeframe}
          products={products}
        />

        <SGListModal
          open={showSGListModal}
          onClose={() => setShowSGListModal(false)}
        />
      </div>
    </div>
  );
}
