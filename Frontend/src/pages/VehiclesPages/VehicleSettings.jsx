import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Breadcrumbs from '../../components/Breadcrumbs';
import { Tabs, Button, Table, Modal, Form, Input, Select, DatePicker, Upload, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileAddOutlined } from '@ant-design/icons';
import { FaCar } from 'react-icons/fa';

const { TabPane } = Tabs;
const { Option } = Select;

// Dummy vehicle data (replace with API data)
const initialVehicles = [
  { id: 1, regNo: 'MH12AB1234', model: 'Tata Ace', type: 'Mini Truck', status: 'Active', insuranceExpiry: '2025-01-01' },
  { id: 2, regNo: 'MH14CD5678', model: 'Mahindra Bolero', type: 'SUV', status: 'Inactive', insuranceExpiry: '2024-11-10' },
];

const vehicleTypes = ['Mini Truck', 'SUV', 'Sedan', 'Pickup', 'Van'];

// Top Indian vehicle insurance providers
const defaultInsuranceProviders = [
  "ICICI Lombard",
  "HDFC ERGO",
  "Bajaj Allianz",
  "SBI General",
  "Reliance General",
  "Tata AIG",
  "Bharti AXA",
  "Future Generali",
  "National Insurance",
  "United India Insurance"
];

// Initial report templates
const defaultReportTemplates = [
  { id: 1, name: 'Monthly Maintenance Summary', type: 'maintenance', format: 'PDF' },
  { id: 2, name: 'Fuel Consumption Analysis', type: 'fuel', format: 'Excel' },
  { id: 3, name: 'Vehicle Insurance Status', type: 'insurance', format: 'PDF' },
  { id: 4, name: 'Cost Analysis Report', type: 'cost', format: 'Excel' },
  { id: 5, name: 'Vehicle Utilization Report', type: 'utilization', format: 'PDF' }
];

const ProviderManager = ({ providers, setProviders }) => {
  const [newProvider, setNewProvider] = useState("");

  const addProvider = () => {
    if (newProvider && !providers.includes(newProvider)) {
      setProviders([...providers, newProvider]);
      setNewProvider("");
    }
  };
  const removeProvider = (provider) => {
    setProviders(providers.filter(p => p !== provider));
  };
  return (
    <div>
      <div className="flex mb-2 gap-2">
        <Input
          value={newProvider}
          onChange={e => setNewProvider(e.target.value)}
          placeholder="Add new provider"
          style={{ maxWidth: 200 }}
        />
        <Button type="primary" onClick={addProvider}>Add</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {providers.map((provider, idx) => (
          <span key={provider+idx} className="bg-blue-100 px-2 py-1 rounded flex items-center">
            {provider}
            <Button
              size="small"
              type="link"
              danger
              onClick={() => removeProvider(provider)}
              style={{ marginLeft: 4 }}
            >
              Remove
            </Button>
          </span>
        ))}
      </div>
    </div>
  );
};

const VehicleSettings = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [form] = Form.useForm();
  const [insuranceProviders, setInsuranceProviders] = useState([...defaultInsuranceProviders]);
  const [reportTemplates, setReportTemplates] = useState(defaultReportTemplates);
  const [editingTemplate, setEditingTemplate] = useState(null);

  // Table columns
  const columns = [
    { title: 'Reg. No', dataIndex: 'regNo', key: 'regNo' },
    { title: 'Model', dataIndex: 'model', key: 'model' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Insurance Expiry', dataIndex: 'insuranceExpiry', key: 'insuranceExpiry' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <span>
          <Button icon={<EditOutlined />} size="small" className="mr-2" onClick={() => onEditVehicle(record)} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => onDeleteVehicle(record.id)} />
        </span>
      ),
    },
  ];

  // Table columns for report templates
  const reportTemplateColumns = [
    { title: 'Report Name', dataIndex: 'name', key: 'name' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Format', dataIndex: 'format', key: 'format' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <span>
          <Button icon={<EditOutlined />} size="small" className="mr-2" onClick={() => handleEditTemplate(record)} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDeleteTemplate(record.id)} />
        </span>
      ),
    }
  ];

  // Modal handlers
  const showAddModal = () => {
    setEditingVehicle(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const onEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    form.setFieldsValue(vehicle);
    setIsModalVisible(true);
  };

  const onDeleteVehicle = (id) => {
    setVehicles(vehicles.filter(v => v.id !== id));
    message.success('Vehicle deleted');
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingVehicle) {
        setVehicles(vehicles.map(v => v.id === editingVehicle.id ? { ...editingVehicle, ...values } : v));
        message.success('Vehicle updated');
      } else {
        setVehicles([...vehicles, { ...values, id: Date.now() }]);
        message.success('Vehicle added');
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  // Report template handlers
  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    form.setFieldsValue(template);
    setIsModalVisible(true);
  };

  const handleDeleteTemplate = (id) => {
    setReportTemplates(templates => templates.filter(t => t.id !== id));
    message.success('Report template deleted');
  };

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  return (
    <div className="w-screen h-screen bg-gray-100">
      <Header />
      <div className="flex w-screen h-full pt-[64px]">
        <div className="hidden md:block w-64 h-full bg-white shadow-md">
          <Sidebar />
        </div>
        
        <div className="w-full h-full overflow-y-auto bg-gray-50 p-5">
          {/* Page Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Vehicle Settings</h1>
                <p className="text-gray-600 mt-1">Configure and manage vehicle-related settings</p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  to="/vehicles-dashboard"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                  <span>Dashboard</span>
                  <span className="ml-2">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow p-6">
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="Vehicle List" key="1">
                <div className="flex justify-end mb-4">
                  <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
                    Add Vehicle
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <Table columns={columns} dataSource={vehicles} rowKey="id" pagination={{ pageSize: 5 }} className="min-w-[600px]" />
                </div>
              </TabPane>
              
              <TabPane tab="Insurance/Documents" key="2">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Insurance Providers</h3>
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <ProviderManager providers={insuranceProviders} setProviders={setInsuranceProviders} />
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="font-medium mb-4">Insurance Form Settings</h4>
                  <Form layout="vertical">
                    <Form.Item label="Insurance Provider" required>
                      <Select placeholder="Select provider">
                        {insuranceProviders.map((provider, idx) => (
                          <Option key={provider+idx} value={provider}>{provider}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item label="Policy Number">
                      <Input placeholder="Enter policy number" />
                    </Form.Item>
                  </Form>
                </div>
              </TabPane>

              <TabPane tab="Report Settings" key="3">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Report Templates</h3>
                  <div className="flex justify-end mb-4">
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTemplate}>
                      Add Template
                    </Button>
                  </div>
                  <Table 
                    columns={reportTemplateColumns} 
                    dataSource={reportTemplates} 
                    rowKey="id" 
                    pagination={{ pageSize: 5 }} 
                  />
                </div>
              </TabPane>
            </Tabs>

            {/* Add/Edit Vehicle Modal */}
            <Modal
              title={editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
              open={isModalVisible}
              onOk={handleModalOk}
              onCancel={() => setIsModalVisible(false)}
              okText={editingVehicle ? 'Update' : 'Add'}
              destroyOnClose
            >
              <Form form={form} layout="vertical" initialValues={{ status: 'Active', type: vehicleTypes[0] }}>
                <Form.Item name="regNo" label="Registration No" rules={[{ required: true, message: 'Please enter registration number' }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="model" label="Model" rules={[{ required: true, message: 'Please enter model' }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="type" label="Type" rules={[{ required: true, message: 'Please select vehicle type' }]}>
                  <Select>
                    {vehicleTypes.map(type => <Option key={type} value={type}>{type}</Option>)}
                  </Select>
                </Form.Item>
                <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                  <Select>
                    <Option value="Active">Active</Option>
                    <Option value="Inactive">Inactive</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="insuranceExpiry" label="Insurance Expiry">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Form>
            </Modal>

            {/* Template Modal */}
            <Modal
              title={editingTemplate ? 'Edit Report Template' : 'Add Report Template'}
              open={isModalVisible}
              onOk={handleModalOk}
              onCancel={() => setIsModalVisible(false)}
              okText={editingTemplate ? 'Update' : 'Add'}
              destroyOnClose
            >
              <Form form={form} layout="vertical">
                <Form.Item name="name" label="Template Name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="type" label="Report Type" rules={[{ required: true }]}>
                  <Select>
                    <Option value="maintenance">Maintenance Report</Option>
                    <Option value="fuel">Fuel Consumption Report</Option>
                    <Option value="insurance">Insurance Report</Option>
                    <Option value="cost">Cost Analysis Report</Option>
                    <Option value="utilization">Vehicle Utilization Report</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="format" label="Report Format" rules={[{ required: true }]}>
                  <Select>
                    <Option value="PDF">PDF</Option>
                    <Option value="Excel">Excel</Option>
                    <Option value="CSV">CSV</Option>
                  </Select>
                </Form.Item>
              </Form>
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleSettings;