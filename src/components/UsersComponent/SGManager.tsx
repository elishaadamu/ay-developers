import { useState, useEffect } from "react";
import axios from "axios";
import { message, DatePicker } from "antd";
import type { RangePickerProps } from "antd/es/date-picker";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";
import AddUserModal from "./AddUserModal";
import UserTable from "./UserTable";
import PerformanceModal from "./PerformanceModal";
import { apiUrl, API_CONFIG } from "../../utilities/config";
import { decryptData } from "../../utilities/encryption";

dayjs.extend(isBetween);

interface User {
  id?: number;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: "SGManager" | "ambassador";
  status: "Active" | "Suspended" | "Inactive";
  suspended: boolean; // Add this field
  createdDate: string;
  performance?: {
    totalSales: number;
    totalCommission: number;
    activeClients: number;
  };
}

export default function SGManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState<"day" | "month">(
    "day"
  );
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null]
  >([null, null]);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    try {
      const encryptedUserData = localStorage.getItem("userData");
      if (encryptedUserData) {
        const decryptedUserData = decryptData(encryptedUserData);
        setUserData(decryptedUserData);
      }
    } catch (error) {
      console.error("Failed to decrypt user data:", error);
    }
  }, []);

  // Fetch S/G Managers from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log("🔄 Fetching S/G Managers from API...");
      const response = await axios.get(
        apiUrl(`${API_CONFIG.ENDPOINTS.AUTH.GetUsers}`)
      );

      console.log("✅ S/G Managers fetched successfully:", response.data);

      // Filter to ensure we only get S/G Managers
      const sgManagers = (response.data.users || response.data || []).filter(
        (user: User) => user.role === "SGManager"
      );

      setUsers(sgManagers);
    } catch (error) {
      console.error("❌ Error fetching S/G Managers:", error);
      message.error("Failed to fetch S/G Managers");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Add user via API
  const addUser = async (
    userData: Omit<User, "id" | "createdDate" | "performance">
  ): Promise<void> => {
    try {
      const payload = {
        ...userData,
        role: "S/G Manager",
        createdBy: userData?.id,
        createdDate: new Date().toISOString(),
        status: "Active",
      };

      console.log("📤 Sending user creation payload:", payload);
      const response = await axios.post(
        apiUrl(API_CONFIG.ENDPOINTS.AUTH.AddUsers),
        payload
      );

      console.log("✅ S/G Manager added successfully:", response.data);
      message.success("S/G Manager added successfully");

      await fetchUsers();
      setShowAddModal(false);
    } catch (error) {
      console.error("❌ Error adding S/G Manager:", error);
      if (axios.isAxiosError(error)) {
        console.error("📋 Error response:", error.response?.data);
        console.error("📊 Error status:", error.response?.status);
      }
      throw error;
    }
  };

  // Update user via API
  const updateUser = async (
    userId: string | number,
    userData: Partial<User>
  ) => {
    try {
      console.log("🔄 Updating S/G Manager:", userId, userData);
      const response = await axios.put(
        apiUrl(`${API_CONFIG.ENDPOINTS.AUTH.UpdateUser}${userId}`),
        {
          ...userData,
          updatedBy: userData?.id,
        }
      );

      console.log("✅ S/G Manager updated successfully:", response.data);
      message.success("S/G Manager updated successfully");

      await fetchUsers();
    } catch (error) {
      console.error("❌ Error updating S/G Manager:", error);
      if (axios.isAxiosError(error)) {
        console.error("📋 Error response:", error.response?.data);
        console.error("📊 Error status:", error.response?.status);
        message.error(
          error.response?.data?.message || "Failed to update S/G Manager"
        );
      } else {
        message.error("Failed to update S/G Manager");
      }
      throw error;
    }
  };

  // Delete user via API
  const deleteUser = async (userId: string | number) => {
    try {
      console.log("🗑️ Deleting S/G Manager:", userId);
      const response = await axios.delete(
        apiUrl(`${API_CONFIG.ENDPOINTS.AUTH.DeleteUser}${userId}`)
      );

      console.log("✅ S/G Manager deleted successfully:", response.data);
      message.success("S/G Manager deleted successfully");

      await fetchUsers();
    } catch (error) {
      console.error("❌ Error deleting S/G Manager:", error);
      if (axios.isAxiosError(error)) {
        console.error("📋 Error response:", error.response?.data);
        console.error("📊 Error status:", error.response?.status);
        message.error(
          error.response?.data?.message || "Failed to delete S/G Manager"
        );
      } else {
        message.error("Failed to delete S/G Manager");
      }
    }
  };

  // Handle suspend/activate user using specific endpoints
  const handleSuspendUser = async (user: User) => {
    try {
      const userId = user._id || user.id!;
      const isSuspended = user.suspended === true; // Check current suspended status

      console.log(
        `🔄 ${isSuspended ? "Activating" : "Suspending"} S/G Manager:`,
        userId,
        `Current suspended status: ${user.suspended}`
      );

      let response;
      if (isSuspended) {
        // User is currently suspended (suspended: true), so ACTIVATE them
        response = await axios.patch(
          apiUrl(`${API_CONFIG.ENDPOINTS.AUTH.ActivateUser}${userId}`)
        );
        console.log("✅ S/G Manager activated successfully:", response.data);
        message.success("Sales and Growth Manager activated successfully");
      } else {
        // User is currently active (suspended: false), so SUSPEND them
        response = await axios.patch(
          apiUrl(`${API_CONFIG.ENDPOINTS.AUTH.SuspendUser}${userId}`)
        );
        console.log("✅ S/G Manager suspended successfully:", response.data);
        message.success("Sales and Growth Manager suspended successfully");
      }

      await fetchUsers();
    } catch (error) {
      console.error("❌ Error updating S/G Manager status:", error);
      if (axios.isAxiosError(error)) {
        console.error("📋 Error response:", error.response?.data);
        console.error("📊 Error status:", error.response?.status);
        message.error(
          error.response?.data?.message || "Failed to update S/G Manager status"
        );
      } else {
        message.error("Failed to update S/G Manager status");
      }
      throw error;
    }
  };

  // Handle performance view
  const handleViewPerformance = (user: User) => {
    setSelectedUser(user);
    setShowPerformanceModal(true);
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    // First, ensure this is a S/G Manager
    if (user.role !== "SGManager") {
      // Change this line to match the role value from API
      return false;
    }

    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Update status filter logic to handle suspended boolean
    let matchesStatus = true;
    if (statusFilter) {
      if (statusFilter === "Suspended") {
        matchesStatus = user.suspended === true;
      } else if (statusFilter === "Active") {
        matchesStatus = user.suspended === false && user.status === "Active";
      } else {
        matchesStatus = user.status === statusFilter;
      }
    }

    const matchesDate =
      !dateRange[0] ||
      !dateRange[1] ||
      dayjs(user.createdDate).isBetween(
        dateRange[0],
        dateRange[1],
        "day",
        "[]"
      );

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleDateRangeChange: RangePickerProps["onChange"] = (dates) => {
    setDateRange(dates || [null, null]);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <PageMeta
        title="AY Developers | S/G Managers"
        description="Manage S/G Managers and track their performance"
      />
      <PageBreadcrumb pageTitle="S/G Managers Management" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {/* Header Section with Action Buttons */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="mb-2 font-semibold text-gray-800 dark:text-white/90 text-xl md:text-xl">
              Sales and Growth Management
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-[12px] md:text-xs">
              Manage Sales and Growth Managers, track performance, and handle
              user operations
            </p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-end gap-2 w-full mt-[0px] md:mt-[-20px]">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-[11px] md:text-[14px] font-medium text-white hover:bg-blue-700"
            >
              Add Sales and Growth Manager
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
          {/* Search Bar */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search Sales and Growth Managers..."
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
            <option value="Suspended">Suspended</option>
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

        {/* Users Table */}
        <UserTable
          users={filteredUsers}
          loading={loading}
          onDelete={deleteUser}
          onUpdate={updateUser}
          onViewPerformance={handleViewPerformance}
          onSuspend={handleSuspendUser}
        />

        {/* Modals */}
        <AddUserModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={addUser}
          defaultRole="S/G Manager"
        />

        <PerformanceModal
          open={showPerformanceModal}
          onClose={() => {
            setShowPerformanceModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          timeframe={selectedTimeframe}
          onTimeframeChange={setSelectedTimeframe}
        />
      </div>
    </div>
  );
}
