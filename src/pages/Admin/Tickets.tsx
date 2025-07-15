import { useState } from "react";
import { Tabs, Badge, Table } from "antd";
import type { TableProps } from "antd";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

interface Ticket {
  id: string;
  subject: string;
  status: "open" | "closed";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerEmail: string;
}

export default function Tickets() {
  const [activeTab, setActiveTab] = useState<string>("open");

  const columns: TableProps<Ticket>["columns"] = [
    {
      title: "Ticket ID",
      dataIndex: "id",
      key: "id",
      render: (id) => <span className="font-medium">#{id}</span>,
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
      render: (name, record) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-sm text-gray-500">{record.customerEmail}</div>
        </div>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority) => (
        <Badge
          color={
            priority === "high"
              ? "red"
              : priority === "medium"
              ? "yellow"
              : "blue"
          }
          text={priority.charAt(0).toUpperCase() + priority.slice(1)}
        />
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="space-x-2">
          <button
            className="text-blue-600 hover:text-blue-800"
            onClick={() => handleViewTicket(record.id)}
          >
            View
          </button>
          {record.status === "open" && (
            <button
              className="text-green-600 hover:text-green-800"
              onClick={() => handleCloseTicket(record.id)}
            >
              Close
            </button>
          )}
        </div>
      ),
    },
  ];

  // Sample data - replace with actual API call
  const tickets: Ticket[] = [
    {
      id: "TKT-001",
      subject: "Cannot access hosting panel",
      status: "open",
      priority: "high",
      createdAt: "2024-07-14T10:00:00Z",
      updatedAt: "2024-07-14T10:00:00Z",
      customerName: "John Doe",
      customerEmail: "john@example.com",
    },
    {
      id: "TKT-001",
      subject: "Cannot access hosting panel",
      status: "closed",
      priority: "high",
      createdAt: "2024-07-14T10:00:00Z",
      updatedAt: "2024-07-14T10:00:00Z",
      customerName: "John Doe",
      customerEmail: "john@example.com",
    },
    {
      id: "TKT-002",
      subject: "Website builder not responding",
      status: "closed",
      priority: "medium",
      createdAt: "2024-07-13T15:30:00Z",
      updatedAt: "2024-07-14T09:00:00Z",
      customerName: "Jane Smith",
      customerEmail: "jane@example.com",
    },
    // Add more sample tickets as needed
  ];

  const handleViewTicket = (ticketId: string) => {
    console.log("Viewing ticket:", ticketId);
    // Implement view ticket logic
  };

  const handleCloseTicket = (ticketId: string) => {
    console.log("Closing ticket:", ticketId);
    // Implement close ticket logic
  };

  return (
    <>
      <PageMeta
        title="AY Developers - Tickets"
        description="Support tickets management system"
      />
      <PageBreadcrumb pageTitle="Tickets" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Support Tickets
          </h3>
          <div className="flex items-center gap-5">
            <Badge
              count={tickets.filter((t) => t.status === "open").length}
              showZero
              style={{
                backgroundColor: "#1890ff",
                marginTop: "-7px",
                padding: "5px",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span className="mr-2">Open</span>
            </Badge>
            <Badge
              count={tickets.filter((t) => t.status === "closed").length}
              showZero
              style={{
                backgroundColor: "#52c41a",
                marginTop: "-7px",
                padding: "5px",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span className="mr-2 mt-10">Closed</span>
            </Badge>
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "open",
              label: "Open Tickets",
              children: (
                <Table
                  columns={columns}
                  dataSource={tickets.filter((t) => t.status === "open")}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
            {
              key: "closed",
              label: "Closed Tickets",
              children: (
                <Table
                  columns={columns}
                  dataSource={tickets.filter((t) => t.status === "closed")}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
          ]}
        />
      </div>
    </>
  );
}
