import { useState } from "react";
import { Modal, Form, Input, Select, Button, message } from "antd";

interface Product {
  name: string;
  category: string;
  status: "Active" | "Inactive";
}

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (product: Product) => Promise<void>;
}

const { Option } = Select;

export default function AddProductModal({
  open,
  onClose,
  onSubmit,
}: AddProductModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: Product) => {
    setLoading(true);
    try {
      await onSubmit(values);
      form.resetFields();
      message.success("Product added successfully!");
    } catch (error) {
      message.error("Failed to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Add New Product"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={500}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Form.Item
          label="Product Name"
          name="name"
          rules={[
            { required: true, message: "Please enter product name" },
            { min: 2, message: "Product name must be at least 2 characters" },
          ]}
        >
          <Input
            placeholder="e.g., Premium Hosting Package, Website Builder Pro"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Category"
          name="category"
          rules={[{ required: true, message: "Please select a category" }]}
        >
          <Select size="large" placeholder="Select product category">
            <Option value="Hosting (Reseller)">
              <div className="flex items-center">
                <span className="mr-2">🌐</span>
                Hosting (Reseller)
              </div>
            </Option>
            <Option value="Software (Websites)">
              <div className="flex items-center">
                <span className="mr-2">💻</span>
                Software (Websites)
              </div>
            </Option>
            <Option value="Services (Console Management)">
              <div className="flex items-center">
                <span className="mr-2">⚙️</span>
                Services (Console Management)
              </div>
            </Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Status"
          name="status"
          initialValue="Active"
          rules={[{ required: true, message: "Please select status" }]}
        >
          <Select size="large" placeholder="Select status">
            <Option value="Active">
              <div className="flex items-center">
                <span className="mr-2 text-green-500">●</span>
                Active
              </div>
            </Option>
            <Option value="Inactive">
              <div className="flex items-center">
                <span className="mr-2 text-red-500">●</span>
                Inactive
              </div>
            </Option>
          </Select>
        </Form.Item>

        <Form.Item className="mb-0 mt-6">
          <div className="flex gap-3 justify-end">
            <Button onClick={handleCancel} disabled={loading} size="large">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
            >
              Add Product
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
