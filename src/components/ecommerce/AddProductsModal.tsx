import { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  Upload,
  InputNumber,
} from "antd";
import type { RcFile, UploadFile } from "antd/es/upload/interface";
import {
  PlusOutlined,
  CloudServerOutlined,
  DesktopOutlined,
  SettingOutlined,
} from "@ant-design/icons";

// Update the Product interface
interface Product {
  name: string;
  price: number;
  description: string;
  images: string[];
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
  const [imageUrls, setImageUrls] = useState<string[]>([]);

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

  // Add file type validation
  const allowedFileTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];
  const maxFileSize = 0.5 * 1024 * 1024; // 500KB

  // Image upload handler with validation
  const handleImageUpload = async (file: RcFile) => {
    try {
      // Validate file type
      if (!allowedFileTypes.includes(file.type)) {
        message.error("Please upload an image file (JPG, JPEG, PNG, or WebP)");
        return false;
      }

      // Validate file size
      if (file.size > maxFileSize) {
        message.error("Image must be smaller than 2MB");
        return false;
      }

      const fakeUrl = URL.createObjectURL(file);
      setImageUrls((prev) => [...prev, fakeUrl]);
      return false; // Prevent default upload behavior
    } catch (error) {
      message.error("Failed to upload image");
      return false;
    }
  };

  // Add image removal handler
  const handleImageRemove = (file: UploadFile) => {
    const newImageUrls = imageUrls.filter((url) => url !== file.url);
    setImageUrls(newImageUrls);
  };

  return (
    <Modal
      title="Add New Product"
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
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
            { required: true, message: "Please select a product" },
            { min: 2, message: "Product name must be at least 2 characters" },
          ]}
        >
          <Select size="large" placeholder="Select product">
            <Option value="Reseller Hosting">
              <div className="flex items-center gap-2">
                <CloudServerOutlined className="text-lg" />
                <span>Reseller Hosting</span>
              </div>
            </Option>
            <Option value="Website Development">
              <div className="flex items-center gap-2">
                <DesktopOutlined className="text-lg" />
                <span>Website Development</span>
              </div>
            </Option>
            <Option value="Console Management">
              <div className="flex items-center gap-2">
                <SettingOutlined className="text-lg" />
                <span>Console Management</span>
              </div>
            </Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Price"
          name="price"
          rules={[{ required: true, message: "Please enter product price" }]}
        >
          <InputNumber
            prefix="₦"
            className="w-full"
            min={0}
            step={0.01}
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            { required: true, message: "Please enter product description" },
            { min: 10, message: "Description must be at least 10 characters" },
          ]}
        >
          <Input.TextArea rows={3} size="large" />
        </Form.Item>

        <Form.Item
          label="Images"
          name="images"
          rules={[
            { required: true, message: "Please upload at least one image" },
          ]}
        >
          <Upload
            listType="picture-card"
            fileList={imageUrls.map((url, index) => ({
              uid: `-${index}`,
              name: `image-${index}`,
              status: "done",
              url,
            }))}
            beforeUpload={handleImageUpload}
            onRemove={handleImageRemove}
            accept=".jpg,.jpeg,.png,.webp"
          >
            {imageUrls.length >= 8 ? null : (
              <div>
                <PlusOutlined />
                <div className="mt-2">Upload</div>
              </div>
            )}
          </Upload>
          <div className="mt-2 text-sm text-gray-500">
            Supported formats: JPG, JPEG, PNG, WebP. Max size: 500KB
          </div>
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
