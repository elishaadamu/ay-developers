import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { notification, Dropdown, Menu } from "antd";
import { MoreOutlined } from "@ant-design/icons";

interface User {
  id?: number;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  photo?: string;
  role: "S/G Manager" | "Ambassador" | "Customer";
  status: "Active" | "Suspended" | "Inactive";
  suspended: boolean; // Add this field back
  createdAt: string;
  performance?: {
    totalSales: number;
    totalCommission: number;
    activeClients: number;
  };
}

interface UserTableProps {
  users: User[];
  loading: boolean;
  onDelete: (id: string | number) => Promise<void>;
  onUpdate?: (id: string | number, data: Partial<User>) => Promise<void>;
  onViewPerformance: (user: User) => void;
  onSuspend: (user: User) => Promise<void>;
}

export default function UserTable({
  users,
  loading,
  onDelete,
  onUpdate,
  onViewPerformance,
  onSuspend,
}: UserTableProps) {
  const [api, contextHolder] = notification.useNotification();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDelete = async (user: User) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${user.firstName} ${user.lastName}?`
      )
    ) {
      try {
        await onDelete(user._id || user.id!);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleSuspend = async (user: User) => {
    const currentlySuspended = user.suspended === true;
    const action = currentlySuspended ? "reactivate" : "suspend";

    if (
      window.confirm(
        `Are you sure you want to ${action} ${user.firstName} ${user.lastName}?`
      )
    ) {
      try {
        await onSuspend(user);
      } catch (error) {
        console.error("Error updating user status:", error);
      }
    }
  };

  // Create dropdown menu for actions
  const getActionMenu = (user: User) => {
    const currentlySuspended = user.suspended === true;

    const items = [
      {
        key: "performance",
        label: (
          <div className="flex items-center gap-2 px-3 py-2 text-green-600 hover:text-green-800">
            <svg
              className="w-4 h-4"
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
          </div>
        ),
        onClick: () => onViewPerformance(user),
      },
      {
        key: "suspend",
        label: (
          <div
            className={`flex items-center gap-2 px-3 py-2 ${
              currentlySuspended
                ? "text-blue-600 hover:text-blue-800"
                : "text-yellow-600 hover:text-yellow-800"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  currentlySuspended
                    ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    : "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                }
              />
            </svg>
            {currentlySuspended ? "Reactivate" : "Suspend"}
          </div>
        ),
        onClick: () => handleSuspend(user),
      },
      {
        type: "divider",
      },
      {
        key: "delete",
        label: (
          <div className="flex items-center gap-2 px-3 py-2 text-red-700 hover:text-white">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete User
          </div>
        ),
        onClick: () => handleDelete(user),
        danger: true,
      },
    ];

    return items;
  };

  const getStatusColor = (user: User) => {
    if (user.suspended === true) {
      return "warning"; // Show as suspended
    }
    switch (user.status) {
      case "Active":
        return "success";
      case "Inactive":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (user: User) => {
    if (user.suspended === true) {
      return "Suspended";
    }
    return user.status;
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Name
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Email
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Phone
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Created Date
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No users found. Add your first user to get started.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow
                    key={user._id || user.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {user.photo ? (
                            <img
                              src={user.photo}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-blue-600 dark:text-blue-300 font-medium text-sm">
                              {user.firstName.charAt(0)}
                              {user.lastName.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.role}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 text-gray-500 dark:text-gray-400">
                      {user.email}
                    </TableCell>

                    <TableCell className="py-4 text-gray-500 dark:text-gray-400">
                      {user.phone || "N/A"}
                    </TableCell>

                    <TableCell className="py-4">
                      <Badge size="sm" color={getStatusColor(user)}>
                        {getStatusText(user)}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      {formatDate(user.createdAt)}
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="flex justify-center">
                        <Dropdown
                          menu={{ items: getActionMenu(user) }}
                          trigger={["click"]}
                          placement="bottomRight"
                          arrow={{ pointAtCenter: true }}
                          overlayStyle={{
                            minWidth: "180px",
                          }}
                          overlayClassName="user-actions-dropdown"
                        >
                          <button
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                            onClick={(e) => e.preventDefault()}
                          >
                            <MoreOutlined
                              className="text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
                              style={{ fontSize: "16px", color: "grey" }}
                            />
                          </button>
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Custom CSS for dropdown styling */}
      <style jsx global>{`
        .user-actions-dropdown .ant-dropdown-menu {
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
          padding: 4px 0;
        }

        .user-actions-dropdown .ant-dropdown-menu-item {
          padding: 0;
          margin: 0;
          border-radius: 4px;
          margin: 2px 4px;
        }

        .user-actions-dropdown .ant-dropdown-menu-item:hover {
          background-color: #f9fafb;
        }

        .user-actions-dropdown .ant-dropdown-menu-item-danger:hover {
          background-color: #fef2f2;
        }

        .user-actions-dropdown .ant-dropdown-menu-item-divider {
          margin: 4px 0;
          background-color: #e5e7eb;
        }

        .dark .user-actions-dropdown .ant-dropdown-menu {
          background-color: #374151;
          border-color: #4b5563;
        }

        .dark .user-actions-dropdown .ant-dropdown-menu-item:hover {
          background-color: #4b5563;
        }

        .dark .user-actions-dropdown .ant-dropdown-menu-item-danger:hover {
          background-color: #7f1d1d;
        }

        .dark .user-actions-dropdown .ant-dropdown-menu-item-divider {
          background-color: #4b5563;
        }
      `}</style>
    </>
  );
}
