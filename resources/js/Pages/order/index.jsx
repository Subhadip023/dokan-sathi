import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import Input from '@/Components/Input';
import Pagination from '@/Components/Pagination';
import {
    FaClipboardList,
    FaPlus,
    FaTrash,
    FaEye,
    FaRegEdit,
    FaTruck,
    FaBoxes,
    FaCalendarAlt,
    FaRupeeSign,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaChevronDown,
    FaChevronUp,
    FaReceipt,
    FaTag,
    FaInfoCircle
} from 'react-icons/fa';
import { MdDeleteOutline } from 'react-icons/md';
import debounce from 'lodash/debounce';

export default function OrderIndex({ orders, summary, suppliers, products, filters }) {
    const current_dokan = usePage().props.auth.current_dokan;
    const user = usePage().props.auth.user;
    const isOwner = (user?.role ?? 1) === 1;

    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    const { data, setData, post, put, delete: deleteOrder, reset, errors } = useForm({
        id: null,
        supplier_id: '',
        order_date: new Date().toISOString().split('T')[0],
        status: 'pending',
        notes: '',
        items: [
            { product_id: '', product_name: '', quantity: 1, unit_cost: 0, selling_rate: 0, packet_size: 1, description: '' }
        ],
    });

    const performFilter = useCallback(
        debounce((searchQuery, statusVal) => {
            router.get(
                route('orders.index'),
                { search: searchQuery, status: statusVal },
                { preserveState: true, replace: true }
            );
        }, 400),
        []
    );

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        performFilter(val, statusFilter);
    };

    const handleStatusFilterChange = (statusVal) => {
        setStatusFilter(statusVal);
        performFilter(search, statusVal);
    };

    const resetForm = () => {
        reset();
        setData({
            id: null,
            supplier_id: suppliers.length > 0 ? suppliers[0].id : '',
            order_date: new Date().toISOString().split('T')[0],
            status: 'pending',
            notes: '',
            items: [
                { product_id: '', product_name: '', quantity: 1, unit_cost: 0, selling_rate: 0, packet_size: 1, description: '' }
            ],
        });
    };

    const openAddModal = () => {
        resetForm();
        setIsEdit(false);
        setShowModal(true);
    };

    const openEditModal = (order) => {
        setIsEdit(true);
        setData({
            id: order.id,
            supplier_id: order.supplier_id || '',
            order_date: order.order_date,
            status: order.status,
            notes: order.notes || '',
            items: order.items.map(item => {
                const prod = item.product || {};
                return {
                    product_id: item.product_id || '',
                    product_name: item.product_name,
                    quantity: item.quantity,
                    unit_cost: item.unit_cost,
                    selling_rate: prod.selling_rate || item.unit_cost,
                    packet_size: prod.packet_size || 1,
                    description: prod.description || '',
                };
            }),
        });
        setShowModal(true);
    };

    const openDetailModal = (order) => {
        setSelectedOrder(order);
        setShowDetailModal(true);
    };

    const handleAddItem = () => {
        setData('items', [
            ...data.items,
            { product_id: '', product_name: '', quantity: 1, unit_cost: 0, selling_rate: 0, packet_size: 1, description: '' }
        ]);
    };

    const handleRemoveItem = (index) => {
        if (data.items.length === 1) {
            toast.error('Order must have at least one product item');
            return;
        }
        const updated = data.items.filter((_, idx) => idx !== index);
        setData('items', updated);
    };

    const handleItemChange = (index, field, value) => {
        const updated = [...data.items];
        updated[index][field] = value;

        // If product selected from dropdown, auto fill fields
        if (field === 'product_id' && value) {
            const selectedProd = products.find(p => p.id === parseInt(value));
            if (selectedProd) {
                updated[index].product_name = selectedProd.name;
                updated[index].unit_cost = selectedProd.cost_rate || 0;
                updated[index].selling_rate = selectedProd.selling_rate || selectedProd.cost_rate || 0;
                updated[index].packet_size = selectedProd.packet_size || 1;
                updated[index].description = selectedProd.description || '';
            }
        }

        // Auto default selling_rate to unit_cost if selling_rate is 0
        if (field === 'unit_cost' && (parseFloat(updated[index].selling_rate) === 0 || !updated[index].selling_rate)) {
            updated[index].selling_rate = value;
        }

        setData('items', updated);
    };

    const calculateFormTotal = () => {
        return data.items.reduce((sum, item) => {
            const qty = parseFloat(item.quantity) || 0;
            const cost = parseFloat(item.unit_cost) || 0;
            return sum + (qty * cost);
        }, 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Check if items are valid
        for (let i = 0; i < data.items.length; i++) {
            if (!data.items[i].product_name.trim()) {
                toast.error(`Please provide product name for item #${i + 1}`);
                return;
            }
            if (data.items[i].quantity <= 0) {
                toast.error(`Quantity for item #${i + 1} must be at least 1`);
                return;
            }
        }

        const options = {
            onSuccess: () => {
                toast.success(isEdit ? 'Order updated successfully' : 'Purchase order created & product catalog updated!');
                setShowModal(false);
                resetForm();
            },
            onError: () => {
                toast.error(isEdit ? 'Failed to update order' : 'Failed to create order');
            }
        };

        if (isEdit) {
            put(route('orders.update', data.id), options);
        } else {
            post(route('orders.store'), options);
        }
    };

    const handleStatusQuickChange = (orderId, newStatus) => {
        router.patch(route('orders.status-update', orderId), { status: newStatus }, {
            onSuccess: () => {
                toast.success(`Order status changed to ${newStatus}`);
            },
            onError: () => {
                toast.error('Failed to update order status');
            }
        });
    };

    const handleDeleteOrder = (order) => {
        if (!confirm(`Are you sure you want to delete purchase order "${order.order_number}"?`)) {
            return;
        }

        deleteOrder(route('orders.destroy', order.id), {
            onSuccess: () => {
                toast.success('Purchase order deleted successfully');
                if (showDetailModal) setShowDetailModal(false);
            },
            onError: () => {
                toast.error('Failed to delete purchase order');
            }
        });
    };

    const renderStatusBadge = (status) => {
        switch (status) {
            case 'received':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <FaCheckCircle className="mr-1" size={10} /> Received
                    </span>
                );
            case 'ordered':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        <FaTruck className="mr-1" size={10} /> Ordered
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                        <FaTimesCircle className="mr-1" size={10} /> Cancelled
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        <FaClock className="mr-1" size={10} /> Pending
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout header="Supplier Purchase Orders">
            <Head title="Purchase Orders" />

            {/* Modal for Order Add / Edit */}
            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="3xl">
                <div className="p-6 text-gray-900">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2 flex items-center">
                        <FaClipboardList className="mr-2 text-indigo-600" />
                        {isEdit ? 'Edit Purchase Order' : 'Create New Purchase Order'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    Supplier / Vendor
                                </label>
                                <select
                                    className="w-full rounded-md border-gray-300 text-sm shadow-xs focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.supplier_id}
                                    onChange={(e) => setData('supplier_id', e.target.value)}
                                >
                                    <option value="">Select Supplier (Optional)</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} {s.company_name ? `(${s.company_name})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    Order Date
                                </label>
                                <input
                                    type="date"
                                    className="w-full rounded-md border-gray-300 text-sm shadow-xs focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.order_date}
                                    onChange={(e) => setData('order_date', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    Order Status
                                </label>
                                <select
                                    className="w-full rounded-md border-gray-300 text-sm shadow-xs focus:border-indigo-500 focus:ring-indigo-500 font-bold"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    required
                                >
                                    <option value="pending">Pending</option>
                                    <option value="ordered">Ordered</option>
                                    <option value="received">Received (Adds Stock & Creates Product)</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-indigo-50/70 border border-indigo-200 p-3 rounded-lg text-xs text-indigo-900 flex items-start">
                            <FaInfoCircle className="mr-2 text-indigo-600 mt-0.5 shrink-0" size={14} />
                            <span>
                                <strong>Automatic Product Catalog Creation:</strong> Custom products added here will be automatically registered in your product table with their selling price (SP), packet size, and description, and their generated Product ID will be attached to this order.
                            </span>
                        </div>

                        {/* Order Items Table */}
                        <div className="mt-4 border rounded-xl overflow-hidden">
                            <div className="bg-gray-100 px-4 py-2.5 font-bold text-xs uppercase tracking-wider text-gray-700 flex justify-between items-center">
                                <span>Order Items & Product Specification</span>
                                <button
                                    type="button"
                                    onClick={handleAddItem}
                                    className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center bg-white px-2.5 py-1 rounded-md border border-indigo-200"
                                >
                                    <FaPlus size={10} className="mr-1" /> Add Product Line
                                </button>
                            </div>

                            <div className="p-3 space-y-4 bg-gray-50/50 max-h-96 overflow-y-auto divide-y divide-gray-200">
                                {data.items.map((item, idx) => (
                                    <div key={idx} className="pt-3 first:pt-0 space-y-2">
                                        {/* Main Line: Product selection, name, Qty, CP, SP, Pkt Size */}
                                        <div className="grid grid-cols-12 gap-2 items-end">
                                            <div className="col-span-12 md:col-span-4">
                                                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                                                    Product Dropdown / Custom Name
                                                </label>
                                                <select
                                                    className="w-full rounded-md border-gray-300 text-xs shadow-xs mb-1"
                                                    value={item.product_id}
                                                    onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                                                >
                                                    <option value="">Custom Product (Or Pick Existing)</option>
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.name} (Stock: {p.purchased_packets} pkt)
                                                        </option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="text"
                                                    placeholder="Product name..."
                                                    className="w-full rounded-md border-gray-300 text-xs font-bold"
                                                    value={item.product_name}
                                                    onChange={(e) => handleItemChange(idx, 'product_name', e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="col-span-4 md:col-span-2">
                                                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                                                    Packets (Qty)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="w-full rounded-md border-gray-300 text-xs font-mono text-center"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="col-span-4 md:col-span-2">
                                                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                                                    Cost / Pkt (CP ₹)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    className="w-full rounded-md border-gray-300 text-xs font-mono"
                                                    value={item.unit_cost}
                                                    onChange={(e) => handleItemChange(idx, 'unit_cost', e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="col-span-4 md:col-span-2">
                                                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                                                    Selling / Pkt (SP ₹)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    className="w-full rounded-md border-gray-300 text-xs font-mono"
                                                    value={item.selling_rate}
                                                    onChange={(e) => handleItemChange(idx, 'selling_rate', e.target.value)}
                                                />
                                            </div>

                                            <div className="col-span-12 md:col-span-2 flex items-center justify-between pb-1">
                                                <div className="w-full mr-2">
                                                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                                                        Pkt Size (Units)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        className="w-full rounded-md border-gray-300 text-xs font-mono text-center"
                                                        value={item.packet_size}
                                                        onChange={(e) => handleItemChange(idx, 'packet_size', e.target.value)}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(idx)}
                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md shrink-0 mt-4"
                                                    title="Remove Item"
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Row 2: Description & Subtotal preview */}
                                        <div className="grid grid-cols-12 gap-2 items-center bg-gray-100/60 p-2 rounded-md text-xs">
                                            <div className="col-span-9 md:col-span-10">
                                                <input
                                                    type="text"
                                                    placeholder="Optional product description / remarks..."
                                                    className="w-full rounded-md border-gray-200 text-xs py-1 px-2 text-gray-600"
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-span-3 md:col-span-2 text-right">
                                                <span className="text-[10px] text-gray-400 block">Line Total</span>
                                                <span className="font-mono font-bold text-xs text-indigo-700">
                                                    ₹{((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_cost) || 0)).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-indigo-50/60 p-3 border-t flex justify-between items-center text-xs font-bold text-indigo-900">
                                <span>GRAND TOTAL ESTIMATE COST:</span>
                                <span className="text-lg font-mono font-extrabold text-indigo-700">
                                    ₹{calculateFormTotal().toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                Order Notes / Instructions (Optional)
                            </label>
                            <textarea
                                rows={2}
                                className="w-full rounded-md border-gray-300 text-sm shadow-xs"
                                placeholder="Add payment terms, delivery expectations, or supplier instructions..."
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end space-x-2 pt-4 border-t">
                            <SecondaryButton onClick={() => setShowModal(false)}>
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton type="submit">
                                {isEdit ? 'Update Purchase Order' : 'Save Purchase Order'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Modal for Order Details View */}
            <Modal show={showDetailModal} onClose={() => setShowDetailModal(false)} maxWidth="2xl">
                {selectedOrder && (
                    <div className="p-6 text-gray-900">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                    <FaReceipt className="mr-2 text-indigo-600" /> Order #{selectedOrder.order_number}
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Date: {selectedOrder.order_date} • Dokan Purchase Sheet
                                </p>
                            </div>
                            <div className="flex items-center space-x-2">
                                {renderStatusBadge(selectedOrder.status)}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDetailModal(false);
                                        openEditModal(selectedOrder);
                                    }}
                                    className="p-1.5 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold flex items-center"
                                >
                                    <FaRegEdit size={12} className="mr-1" /> Edit
                                </button>
                            </div>
                        </div>

                        {/* Supplier Info */}
                        <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-200 mb-4 flex justify-between items-center text-xs">
                            <div>
                                <span className="text-gray-500 font-medium block">Supplier / Vendor</span>
                                <span className="font-bold text-gray-900 text-sm">
                                    {selectedOrder.supplier ? selectedOrder.supplier.name : 'General Supplier / Direct Market'}
                                </span>
                                {selectedOrder.supplier?.company_name && (
                                    <span className="text-indigo-600 font-semibold block">{selectedOrder.supplier.company_name}</span>
                                )}
                                {selectedOrder.supplier?.phone && (
                                    <span className="text-gray-500 block">{selectedOrder.supplier.phone}</span>
                                )}
                            </div>
                            <div className="text-right">
                                <span className="text-gray-500 font-medium block">Created By</span>
                                <span className="font-bold text-gray-800 block">
                                    {selectedOrder.added_by ? selectedOrder.added_by.name : 'Store Administrator'}
                                </span>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="overflow-x-auto mb-4 border rounded-lg">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-gray-100 uppercase text-gray-600 font-semibold border-b">
                                        <th className="py-2.5 px-3">#</th>
                                        <th className="py-2.5 px-3">Product Name & Spec</th>
                                        <th className="py-2.5 px-3 text-center">Packets</th>
                                        <th className="py-2.5 px-3 text-right">Cost (CP)</th>
                                        <th className="py-2.5 px-3 text-right">Selling (SP)</th>
                                        <th className="py-2.5 px-3 text-right">Total Cost</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {selectedOrder.items.map((item, idx) => {
                                        const prod = item.product || {};
                                        return (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="py-2.5 px-3 font-mono text-gray-400">{idx + 1}</td>
                                                <td className="py-2.5 px-3">
                                                    <span className="font-bold text-gray-900 block">{item.product_name}</span>
                                                    {prod.packet_size > 1 && (
                                                        <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded mr-1">
                                                            Pkt Size: {prod.packet_size} units
                                                        </span>
                                                    )}
                                                    {prod.description && (
                                                        <span className="text-[11px] text-gray-500 block italic">{prod.description}</span>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3 text-center font-mono font-semibold">{item.quantity} pkt</td>
                                                <td className="py-2.5 px-3 text-right font-mono">₹{item.unit_cost}</td>
                                                <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-semibold">
                                                    ₹{prod.selling_rate || item.unit_cost}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-700">₹{item.total_cost}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Grand Total */}
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 mb-6 flex justify-between items-center">
                            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Grand Total Order Amount</span>
                            <span className="text-2xl font-extrabold text-indigo-700 font-mono">₹{selectedOrder.total_amount}</span>
                        </div>

                        {selectedOrder.notes && (
                            <div className="bg-gray-50 p-3 rounded-lg border text-xs text-gray-700 mb-6">
                                <span className="font-bold block text-gray-900 mb-1">Notes:</span>
                                {selectedOrder.notes}
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-2 border-t">
                            <button
                                type="button"
                                onClick={() => handleDeleteOrder(selectedOrder)}
                                className="text-red-600 hover:text-red-800 text-xs font-semibold flex items-center px-3 py-2 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                            >
                                <MdDeleteOutline size={16} className="mr-1" /> Delete Order
                            </button>
                            <SecondaryButton onClick={() => setShowDetailModal(false)}>
                                Close
                            </SecondaryButton>
                        </div>
                    </div>
                )}
            </Modal>

            <div className="mx-auto w-full sm:px-6 lg:px-8 py-6">
                {/* Stats Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Orders</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{summary.totalOrders}</h3>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                            <FaClipboardList />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Purchase Cost</p>
                            <h3 className="text-2xl font-bold text-indigo-700 mt-1">₹{summary.totalCost.toLocaleString()}</h3>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl">
                            <FaRupeeSign />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock Received</p>
                            <h3 className="text-2xl font-bold text-emerald-700 mt-1">{summary.receivedOrders}</h3>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
                            <FaCheckCircle />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Orders</p>
                            <h3 className="text-2xl font-bold text-amber-600 mt-1">{summary.pendingOrders}</h3>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xl">
                            <FaClock />
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-xs sm:rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 md:p-6 text-gray-900">
                        {/* Header & Actions */}
                        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between mb-6 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                    <FaClipboardList className="mr-2 text-indigo-600" /> Supplier Purchase Orders
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">Manage stock inventory procurement from suppliers</p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <Input
                                    placeholder="Search order #, supplier, or product..."
                                    value={search}
                                    onChange={handleSearchChange}
                                    addClass="w-full sm:w-64"
                                />
                                <PrimaryButton
                                    onClick={openAddModal}
                                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5"
                                >
                                    <FaPlus className="mr-1.5" size={12} /> New Order
                                </PrimaryButton>
                            </div>
                        </div>

                        {/* Status Filter Tabs */}
                        <div className="flex items-center space-x-2 border-b border-gray-200 pb-3 mb-6 overflow-x-auto">
                            <button
                                onClick={() => handleStatusFilterChange('')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${statusFilter === '' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                All Orders ({summary.totalOrders})
                            </button>
                            <button
                                onClick={() => handleStatusFilterChange('pending')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${statusFilter === 'pending' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => handleStatusFilterChange('ordered')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${statusFilter === 'ordered' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                Ordered
                            </button>
                            <button
                                onClick={() => handleStatusFilterChange('received')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${statusFilter === 'received' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                Received ({summary.receivedOrders})
                            </button>
                            <button
                                onClick={() => handleStatusFilterChange('cancelled')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${statusFilter === 'cancelled' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                Cancelled
                            </button>
                        </div>

                        {orders.data.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <FaBoxes className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                <h3 className="text-lg font-medium text-gray-900">No Purchase Orders Found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {search || statusFilter
                                        ? 'No orders match your filter criteria.'
                                        : 'Create your first supplier purchase order to restock products.'}
                                </p>
                                {!search && !statusFilter && (
                                    <div className="mt-4">
                                        <PrimaryButton onClick={openAddModal}>
                                            <FaPlus className="mr-1.5" size={12} /> Create First Order
                                        </PrimaryButton>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Table View */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left whitespace-nowrap min-w-max border rounded-lg overflow-hidden text-sm">
                                        <thead>
                                            <tr className="bg-gray-100 text-xs font-semibold uppercase text-gray-700 border-b">
                                                <th className="py-3 px-4 w-8"></th>
                                                <th className="py-3 px-4">Order #</th>
                                                <th className="py-3 px-4">Date</th>
                                                <th className="py-3 px-4">Supplier</th>
                                                <th className="py-3 px-4">Status</th>
                                                <th className="py-3 px-4">Purchased Items</th>
                                                <th className="py-3 px-4 text-right">Total Cost (₹)</th>
                                                <th className="py-3 px-4 text-center w-28">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {orders.data.map((order) => {
                                                const isExpanded = expandedOrderId === order.id;
                                                const totalPkts = order.items.reduce((sum, i) => sum + i.quantity, 0);

                                                return (
                                                    <React.Fragment key={order.id}>
                                                        <tr className="hover:bg-gray-50/80 transition-colors">
                                                            <td className="py-3.5 px-4 text-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                                                    className="text-gray-400 hover:text-indigo-600 p-1"
                                                                >
                                                                    {isExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                                                                </button>
                                                            </td>
                                                            <td className="py-3.5 px-4 font-mono font-bold text-gray-900 text-xs">
                                                                {order.order_number}
                                                            </td>
                                                            <td className="py-3.5 px-4 font-mono text-gray-700 text-xs">
                                                                <div className="flex items-center">
                                                                    <FaCalendarAlt className="mr-1.5 text-gray-400" size={12} />
                                                                    {order.order_date}
                                                                </div>
                                                            </td>
                                                            <td className="py-3.5 px-4">
                                                                <div className="flex items-center">
                                                                    <div className="h-7 w-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold mr-2">
                                                                        <FaTruck size={10} />
                                                                    </div>
                                                                    <div>
                                                                        <span className="font-bold text-gray-900 block text-xs">
                                                                            {order.supplier ? order.supplier.name : 'General Supplier'}
                                                                        </span>
                                                                        {order.supplier?.company_name && (
                                                                            <span className="text-[11px] text-gray-400">{order.supplier.company_name}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-3.5 px-4">
                                                                <div className="flex items-center space-x-1.5">
                                                                    {renderStatusBadge(order.status)}
                                                                    <select
                                                                        value={order.status}
                                                                        onChange={(e) => handleStatusQuickChange(order.id, e.target.value)}
                                                                        className="text-[11px] py-0.5 px-1.5 border-gray-200 rounded text-gray-600 bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
                                                                        title="Change Status"
                                                                    >
                                                                        <option value="pending">Pending</option>
                                                                        <option value="ordered">Ordered</option>
                                                                        <option value="received">Received</option>
                                                                        <option value="cancelled">Cancelled</option>
                                                                    </select>
                                                                </div>
                                                            </td>
                                                            <td className="py-3.5 px-4">
                                                                <div className="flex items-center space-x-1.5">
                                                                    <span className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                                                                        {order.items.length} product{order.items.length > 1 ? 's' : ''} ({totalPkts} pkts)
                                                                    </span>
                                                                    <span className="text-xs text-gray-600 truncate max-w-xs">
                                                                        {order.items.map(i => `${i.product_name} (${i.quantity} pkt)`).join(', ')}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="py-3.5 px-4 text-right font-mono font-extrabold text-indigo-700">
                                                                ₹{parseFloat(order.total_amount).toFixed(2)}
                                                            </td>
                                                            <td className="py-3.5 px-4 text-center">
                                                                <div className="flex items-center justify-center space-x-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openDetailModal(order)}
                                                                        className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                                                        title="View Details"
                                                                    >
                                                                        <FaEye size={13} />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openEditModal(order)}
                                                                        className="p-1.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
                                                                        title="Edit Order"
                                                                    >
                                                                        <FaRegEdit size={13} />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDeleteOrder(order)}
                                                                        className="p-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                                                                        title="Delete Order"
                                                                    >
                                                                        <MdDeleteOutline size={16} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>

                                                        {/* Expanded Inline Items */}
                                                        {isExpanded && (
                                                            <tr className="bg-indigo-50/40">
                                                                <td colSpan="8" className="p-4">
                                                                    <div className="bg-white rounded-lg border border-indigo-100 p-3 shadow-inner">
                                                                        <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">
                                                                            Order Product Breakdown & Inventory IDs
                                                                        </h4>
                                                                        <div className="space-y-1 text-xs">
                                                                            {order.items.map((item, itemIdx) => {
                                                                                const prod = item.product || {};
                                                                                return (
                                                                                    <div key={itemIdx} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
                                                                                        <div>
                                                                                            <span className="font-semibold text-gray-800 mr-2">
                                                                                                {item.product_name}
                                                                                            </span>
                                                                                            {item.product_id && (
                                                                                                <span className="bg-gray-100 text-gray-600 font-mono text-[10px] px-1.5 py-0.5 rounded">
                                                                                                    Prod ID #{item.product_id}
                                                                                                </span>
                                                                                            )}
                                                                                            {prod.packet_size > 1 && (
                                                                                                <span className="ml-1 text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                                                                                    Pkt Size: {prod.packet_size} units
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="flex items-center space-x-4 font-mono">
                                                                                            <span className="text-gray-600">{item.quantity} pkt</span>
                                                                                            <span className="text-gray-500">CP: ₹{item.unit_cost}/pkt</span>
                                                                                            <span className="text-emerald-700 font-semibold">
                                                                                                SP: ₹{prod.selling_rate || item.unit_cost}/pkt
                                                                                            </span>
                                                                                            <span className="font-bold text-indigo-700">₹{item.total_cost}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-center mt-6">
                                    <Pagination links={orders.links} />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
