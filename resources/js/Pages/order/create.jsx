import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import React, { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import SearchableSelect from '@/Components/SearchableSelect';
import {
    FaClipboardList,
    FaArrowLeft,
    FaPlus,
    FaTrash,
    FaTruck,
    FaUser,
    FaCalendarAlt,
    FaRupeeSign,
    FaBoxes,
    FaReceipt,
    FaTag,
    FaInfoCircle,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaStore
} from 'react-icons/fa';
import { MdDeleteOutline } from 'react-icons/md';

export default function CreateOrder({ suppliers = [], customers = [], products = [], order = null, isEdit = false }) {
    const current_dokan = usePage().props.auth.current_dokan;

    const getTodayDate = () => new Date().toISOString().split('T')[0];

    const createInitialItem = (productId = '') => {
        if (productId) {
            const prod = products.find(p => String(p.id) === String(productId));
            if (prod) {
                return {
                    product_id: prod.id,
                    product_name: prod.name,
                    quantity: 1,
                    unit_cost: prod.cost_rate || 0,
                    selling_rate: prod.selling_rate || prod.cost_rate || 0,
                    packet_size: prod.packet_size || 1,
                    description: prod.description || '',
                };
            }
        }

        return {
            product_id: '',
            product_name: '',
            quantity: 1,
            unit_cost: 0,
            selling_rate: 0,
            packet_size: 1,
            description: '',
        };
    };

    const initialItems = useMemo(() => {
        if (isEdit && order?.items && order.items.length > 0) {
            return order.items.map(item => {
                const prod = item.product || {};
                return {
                    product_id: item.product_id || '',
                    product_name: item.product_name || '',
                    quantity: item.quantity || 1,
                    unit_cost: item.unit_cost || 0,
                    selling_rate: prod.selling_rate || item.unit_cost || 0,
                    packet_size: prod.packet_size || 1,
                    description: prod.description || '',
                };
            });
        }
        return [createInitialItem()];
    }, [isEdit, order]);

    const { data, setData, post, put, errors, processing } = useForm({
        supplier_id: isEdit && order?.supplier_id ? String(order.supplier_id) : '',
        customer_id: isEdit && order?.customer_id ? String(order.customer_id) : '',
        order_date: isEdit && order?.order_date ? order.order_date : getTodayDate(),
        status: isEdit && order?.status ? order.status : 'pending',
        notes: isEdit && order?.notes ? order.notes : '',
        items: initialItems,
    });

    const [quickProductId, setQuickProductId] = useState('');

    const selectedSupplier = useMemo(() => {
        if (!data.supplier_id) return null;
        return suppliers.find(s => String(s.id) === String(data.supplier_id)) || null;
    }, [suppliers, data.supplier_id]);

    const selectedCustomer = useMemo(() => {
        if (!data.customer_id) return null;
        return customers.find(c => String(c.id) === String(data.customer_id)) || null;
    }, [customers, data.customer_id]);

    // Handle Quick Add Product from Catalog
    const handleAddQuickProduct = () => {
        if (!quickProductId) return;

        const prod = products.find(p => String(p.id) === String(quickProductId));
        if (!prod) return;

        // Check if already in order items
        const existingIdx = data.items.findIndex(item => String(item.product_id) === String(quickProductId));
        if (existingIdx >= 0) {
            const updated = [...data.items];
            updated[existingIdx].quantity = (parseInt(updated[existingIdx].quantity) || 0) + 1;
            setData('items', updated);
            toast.success(`Increased quantity for "${prod.name}"`);
        } else {
            if (data.items.length === 1 && !data.items[0].product_id && !data.items[0].product_name) {
                setData('items', [createInitialItem(quickProductId)]);
            } else {
                setData('items', [...data.items, createInitialItem(quickProductId)]);
            }
            toast.success(`Added "${prod.name}" to order`);
        }

        setQuickProductId('');
    };

    const handleAddBlankItem = () => {
        setData('items', [...data.items, createInitialItem()]);
    };

    const handleRemoveItem = (index) => {
        if (data.items.length <= 1) {
            toast.error('Order must contain at least one item');
            return;
        }
        const updated = data.items.filter((_, i) => i !== index);
        setData('items', updated);
    };

    const handleItemChange = (index, field, value) => {
        const updated = [...data.items];
        updated[index] = { ...updated[index], [field]: value };

        // If product_id changed via inline dropdown, auto-populate details
        if (field === 'product_id') {
            if (value) {
                const prod = products.find(p => String(p.id) === String(value));
                if (prod) {
                    updated[index].product_name = prod.name;
                    updated[index].unit_cost = prod.cost_rate || 0;
                    updated[index].selling_rate = prod.selling_rate || prod.cost_rate || 0;
                    updated[index].packet_size = prod.packet_size || 1;
                    updated[index].description = prod.description || '';
                }
            } else {
                updated[index].product_id = '';
            }
        }

        setData('items', updated);
    };

    // Financial calculations
    const summary = useMemo(() => {
        let totalCost = 0;
        let totalPackets = 0;
        let totalUnits = 0;

        data.items.forEach(item => {
            const qty = parseInt(item.quantity) || 0;
            const cost = parseFloat(item.unit_cost) || 0;
            const size = parseInt(item.packet_size) || 1;

            totalCost += qty * cost;
            totalPackets += qty;
            totalUnits += qty * size;
        });

        return {
            totalItems: data.items.length,
            totalPackets,
            totalUnits,
            totalCost: Math.max(0, totalCost),
        };
    }, [data.items]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate items
        const invalidItem = data.items.find(item => !item.product_name.trim() || item.quantity <= 0);
        if (invalidItem) {
            toast.error('Please specify valid product name and positive quantity for all items.');
            return;
        }

        if (isEdit) {
            put(route('orders.update', order.id), {
                onSuccess: () => {
                    toast.success('Purchase order updated successfully!');
                },
                onError: (err) => {
                    console.error(err);
                    toast.error('Failed to update purchase order. Please check inputs.');
                }
            });
        } else {
            post(route('orders.store'), {
                onSuccess: () => {
                    toast.success('Purchase order created successfully!');
                },
                onError: (err) => {
                    console.error(err);
                    toast.error('Failed to create purchase order. Please check inputs.');
                }
            });
        }
    };

    // Supplier options for SearchableSelect
    const supplierOptions = useMemo(() => {
        return suppliers.map(s => ({
            id: s.id,
            name: s.name,
            subtitle: [s.company_name, s.phone].filter(Boolean).join(' • '),
            company_name: s.company_name,
            phone: s.phone,
        }));
    }, [suppliers]);

    // Customer options for SearchableSelect
    const customerOptions = useMemo(() => {
        return customers.map(c => ({
            id: c.id,
            name: c.name,
            subtitle: [c.shop_name, c.phone].filter(Boolean).join(' • '),
            shop_name: c.shop_name,
            phone: c.phone,
        }));
    }, [customers]);

    // Product options for Quick Add & item rows with description & stock
    const productOptions = useMemo(() => {
        return products.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            subtitle: `${p.description ? `${p.description} • ` : ''}Stock: ${p.purchased_packets} pkt • CP: ₹${p.cost_rate} • SP: ₹${p.selling_rate}`,
            purchased_packets: p.purchased_packets,
            packet_size: p.packet_size || 1,
            stock: p.purchased_packets,
            cost_rate: p.cost_rate,
            selling_rate: p.selling_rate,
        }));
    }, [products]);

    return (
        <AuthenticatedLayout header={isEdit ? 'Edit Purchase Order' : 'Create Purchase Order'}>
            <Head title={isEdit ? `Edit Order #${order?.order_number}` : 'Create Purchase Order'} />

            <div className="mx-auto w-full sm:px-6 lg:px-8 py-6">
                {/* Header Action Bar */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('orders.index')}
                            className="p-2.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-xs"
                            title="Back to Purchase Orders"
                        >
                            <FaArrowLeft size={16} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <FaClipboardList className="mr-2 text-indigo-600" />
                                {isEdit ? `Edit Purchase Order #${order?.order_number}` : 'New Supplier Purchase Order'}
                            </h1>
                            <p className="text-xs text-gray-500">
                                {isEdit
                                    ? 'Update procurement line items, quantities, and status'
                                    : 'Procure inventory items from vendors or automatically register new product lines into catalog'}
                            </p>
                        </div>
                    </div>

                    {isEdit && (
                        <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-gray-500">Order ID:</span>
                            <span className="font-mono text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-200">
                                #{order?.order_number}
                            </span>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Procurement Details (Left 2 Columns) */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Supplier & Customer Order Info Card */}
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center">
                                    <FaClipboardList className="mr-2 text-indigo-500" /> Order Details & Contact Information
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Supplier Selector */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label htmlFor="supplier_id" className="block text-xs font-medium text-gray-700">
                                                Supplier / Vendor
                                            </label>
                                            <Link
                                                href={route('suppliers.index')}
                                                target="_blank"
                                                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-colors"
                                                title="Manage suppliers in new tab"
                                            >
                                                <FaPlus size={9} /> Manage
                                            </Link>
                                        </div>
                                        <SearchableSelect
                                            id="supplier_id"
                                            options={supplierOptions}
                                            value={data.supplier_id}
                                            onChange={(val) => setData('supplier_id', val)}
                                            placeholder="Supplier (Optional)"
                                            searchPlaceholder="Search supplier..."
                                            emptyOption={{
                                                id: '',
                                                name: 'No Supplier Linked',
                                                subtitle: 'Direct or customer-only order'
                                            }}
                                            icon={FaTruck}
                                            error={Boolean(errors.supplier_id)}
                                        />
                                        {errors.supplier_id && (
                                            <p className="text-xs text-red-600 mt-1">{errors.supplier_id}</p>
                                        )}
                                    </div>

                                    {/* Customer Selector */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label htmlFor="customer_id" className="block text-xs font-medium text-gray-700">
                                                Customer
                                            </label>
                                            <Link
                                                href={route('coustomers.index')}
                                                target="_blank"
                                                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-colors"
                                                title="Manage customers in new tab"
                                            >
                                                <FaPlus size={9} /> Manage
                                            </Link>
                                        </div>
                                        <SearchableSelect
                                            id="customer_id"
                                            options={customerOptions}
                                            value={data.customer_id}
                                            onChange={(val) => setData('customer_id', val)}
                                            placeholder="Customer (Optional)"
                                            searchPlaceholder="Search customer by name, shop, phone..."
                                            emptyOption={{
                                                id: '',
                                                name: 'No Customer Linked',
                                                subtitle: 'Supplier restocking / general order'
                                            }}
                                            icon={FaUser}
                                            error={Boolean(errors.customer_id)}
                                        />
                                        {errors.customer_id && (
                                            <p className="text-xs text-red-600 mt-1">{errors.customer_id}</p>
                                        )}
                                    </div>

                                    {/* Order Date */}
                                    <div>
                                        <label htmlFor="order_date" className="block text-xs font-medium text-gray-700 mb-1">
                                            Order Date <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                id="order_date"
                                                className="w-full border-gray-300 rounded-md shadow-xs focus:ring-indigo-500 focus:border-indigo-500 text-sm pl-9"
                                                value={data.order_date}
                                                onChange={(e) => setData('order_date', e.target.value)}
                                                required
                                            />
                                            <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" size={14} />
                                        </div>
                                        {errors.order_date && (
                                            <p className="text-xs text-red-600 mt-1">{errors.order_date}</p>
                                        )}
                                    </div>

                                    {/* Order Status */}
                                    <div>
                                        <label htmlFor="status" className="block text-xs font-medium text-gray-700 mb-1">
                                            Order Status <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="status"
                                            className="w-full rounded-md border-gray-300 text-sm shadow-xs focus:border-indigo-500 focus:ring-indigo-500 font-medium"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            required
                                        >
                                            <option value="pending">Pending (Draft)</option>
                                            <option value="ordered">Ordered</option>
                                            <option value="received">Received (Adds Stock & Products)</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                        {errors.status && (
                                            <p className="text-xs text-red-600 mt-1">{errors.status}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Selected Contact Info Cards */}
                                {(selectedSupplier || selectedCustomer) && (
                                    <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {selectedSupplier && (
                                            <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100 text-xs flex items-center justify-between gap-2">
                                                <div className="min-w-0">
                                                    <div className="font-bold text-gray-900 flex items-center gap-1.5 truncate">
                                                        <FaTruck className="text-indigo-600 shrink-0" size={11} />
                                                        <span className="truncate">{selectedSupplier.name}</span>
                                                        {selectedSupplier.company_name && (
                                                            <span className="text-[10px] bg-indigo-100 text-indigo-800 font-semibold px-1.5 py-0.5 rounded truncate">
                                                                {selectedSupplier.company_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {selectedSupplier.phone && (
                                                        <div className="text-[11px] text-gray-500 mt-0.5">
                                                            Phone: <span className="font-mono">{selectedSupplier.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200 shrink-0">
                                                    Supplier
                                                </span>
                                            </div>
                                        )}

                                        {selectedCustomer && (
                                            <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100 text-xs flex items-center justify-between gap-2">
                                                <div className="min-w-0">
                                                    <div className="font-bold text-gray-900 flex items-center gap-1.5 truncate">
                                                        <FaUser className="text-emerald-600 shrink-0" size={11} />
                                                        <span className="truncate">{selectedCustomer.name}</span>
                                                        {selectedCustomer.shop_name && (
                                                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded truncate">
                                                                {selectedCustomer.shop_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {selectedCustomer.phone && (
                                                        <div className="text-[11px] text-gray-500 mt-0.5">
                                                            Phone: <span className="font-mono">{selectedCustomer.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                                                    Customer
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Auto-Catalog Banner */}
                            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 p-4 rounded-xl text-xs text-indigo-900 flex items-start gap-3 shadow-xs">
                                <FaInfoCircle className="text-indigo-600 mt-0.5 shrink-0" size={16} />
                                <div>
                                    <h4 className="font-bold text-indigo-950">Automatic Product Catalog Synchronization</h4>
                                    <p className="text-indigo-800 mt-0.5 leading-relaxed">
                                        Select existing store products to restock them, or type a brand new product name with its cost, selling price (SP), and packet size. Dokan-Sathi will automatically register custom products in your catalog. When status is set to <strong>Received</strong>, inventory counts will be credited immediately.
                                    </p>
                                </div>
                            </div>

                            {/* Quick Add Product Bar */}
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    Quick Restock from Product Catalog
                                </label>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    <div className="flex-1">
                                        <SearchableSelect
                                            options={productOptions}
                                            value={quickProductId}
                                            onChange={(val) => setQuickProductId(val)}
                                            placeholder="Search product from inventory to restock..."
                                            searchPlaceholder="Type product name to search..."
                                            icon={FaBoxes}
                                        />
                                    </div>
                                    <PrimaryButton
                                        type="button"
                                        onClick={handleAddQuickProduct}
                                        disabled={!quickProductId}
                                        className="sm:w-auto inline-flex items-center justify-center px-4 py-2 text-xs"
                                    >
                                        <FaPlus className="mr-1.5" size={11} /> Add to Order
                                    </PrimaryButton>
                                    <button
                                        type="button"
                                        onClick={handleAddBlankItem}
                                        className="inline-flex items-center justify-center px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                                    >
                                        <FaTag className="mr-1.5 text-indigo-600" size={11} /> + New Product Line
                                    </button>
                                </div>
                            </div>

                            {/* Order Line Items Card */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                                <div className="bg-gray-100/80 px-5 py-3 border-b flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <FaBoxes className="text-gray-600" size={14} />
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                                            Order Products & Specifications ({data.items.length})
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddBlankItem}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center bg-white px-2.5 py-1 rounded-md border border-indigo-200 shadow-2xs transition-colors"
                                    >
                                        <FaPlus size={10} className="mr-1" /> Add Product Row
                                    </button>
                                </div>

                                <div className="p-4 space-y-4 divide-y divide-gray-200">
                                    {data.items.map((item, idx) => {
                                        const isCatalogProduct = Boolean(item.product_id);
                                        const catalogProd = isCatalogProduct ? products.find(p => String(p.id) === String(item.product_id)) : null;
                                        const lineTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_cost) || 0);

                                        return (
                                            <div key={idx} className="pt-4 first:pt-0 space-y-3">
                                                {/* Header / Product Selector Row */}
                                                <div className="grid grid-cols-12 gap-3 items-start">
                                                    <div className="col-span-12 md:col-span-5">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <label className="block text-[11px] font-semibold text-gray-700">
                                                                Product Name & Catalog Link
                                                            </label>
                                                            {isCatalogProduct ? (
                                                                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                                                                    Catalog #{item.product_id} (Stock: {catalogProd?.purchased_packets || 0} pkt)
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] bg-amber-50 text-amber-800 font-medium px-2 py-0.5 rounded border border-amber-200">
                                                                    Custom / New Product
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <SearchableSelect
                                                                options={productOptions}
                                                                value={item.product_id}
                                                                onChange={(val) => handleItemChange(idx, 'product_id', val)}
                                                                placeholder="Search existing product or custom..."
                                                                searchPlaceholder="Search product name, description..."
                                                                emptyOption={{
                                                                    id: '',
                                                                    name: 'Custom Product (Enter title below)',
                                                                    subtitle: 'Type product title & description manually'
                                                                }}
                                                                icon={FaBoxes}
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="Enter product title..."
                                                                className="w-full rounded-md border-gray-300 text-xs font-bold text-gray-900 shadow-2xs"
                                                                value={item.product_name}
                                                                onChange={(e) => handleItemChange(idx, 'product_name', e.target.value)}
                                                                required
                                                            />
                                                        </div>

                                                        {/* Description Preview Banner */}
                                                        {(item.description || catalogProd?.description) ? (
                                                            <div className="mt-1.5 text-[11px] text-gray-600 bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5 flex items-start gap-1.5">
                                                                <FaInfoCircle size={11} className="text-indigo-500 mt-0.5 shrink-0" />
                                                                <div className="min-w-0">
                                                                    <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Description</span>
                                                                    <p className="italic text-gray-700 leading-snug">
                                                                        {item.description || catalogProd?.description}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="mt-1 text-[11px] text-gray-400 italic flex items-center gap-1">
                                                                <FaInfoCircle size={10} className="text-gray-300 shrink-0" />
                                                                <span>No description set</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Quantity (Packets) */}
                                                    <div className="col-span-6 md:col-span-2">
                                                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                                                            Packets (Qty) <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            className="w-full rounded-md border-gray-300 text-xs font-mono font-bold text-center shadow-2xs"
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                                            required
                                                        />
                                                    </div>

                                                    {/* Cost / Packet (CP) */}
                                                    <div className="col-span-6 md:col-span-2">
                                                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                                                            Cost / Pkt (₹) <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            className="w-full rounded-md border-gray-300 text-xs font-mono font-bold text-gray-900 shadow-2xs"
                                                            value={item.unit_cost}
                                                            onChange={(e) => handleItemChange(idx, 'unit_cost', e.target.value)}
                                                            required
                                                        />
                                                    </div>

                                                    {/* Selling Rate / Packet (SP) */}
                                                    <div className="col-span-6 md:col-span-2">
                                                        <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                                                            Selling / Pkt (₹)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            className="w-full rounded-md border-gray-300 text-xs font-mono font-semibold text-emerald-700 shadow-2xs"
                                                            value={item.selling_rate}
                                                            onChange={(e) => handleItemChange(idx, 'selling_rate', e.target.value)}
                                                            placeholder="Retail SP"
                                                        />
                                                    </div>

                                                    {/* Action Button */}
                                                    <div className="col-span-6 md:col-span-1 flex items-end justify-center pb-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem(idx)}
                                                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                                                            title="Remove Item Row"
                                                        >
                                                            <FaTrash size={14} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Second Row: Packet Size, Description, Line Subtotal */}
                                                <div className="grid grid-cols-12 gap-3 items-center bg-gray-50/80 p-3 rounded-lg text-xs border border-gray-100">
                                                    <div className="col-span-12 md:col-span-3">
                                                        <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                                                            Units / Packet
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            className="w-full rounded border-gray-300 text-xs py-1.5 px-2 font-mono text-center shadow-2xs"
                                                            value={item.packet_size}
                                                            onChange={(e) => handleItemChange(idx, 'packet_size', e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="col-span-12 md:col-span-6">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                                                                Product Description / Specs
                                                            </label>
                                                            {catalogProd?.description && !item.description && (
                                                                <span className="text-[10px] text-gray-400 italic">Inherited from catalog</span>
                                                            )}
                                                        </div>
                                                        <input
                                                            type="text"
                                                            placeholder="Enter product description, specifications, or remarks..."
                                                            className="w-full rounded border-gray-300 text-xs py-1.5 px-2.5 text-gray-800 shadow-2xs focus:border-indigo-500 focus:ring-indigo-500"
                                                            value={item.description || ''}
                                                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="col-span-12 md:col-span-3 text-right">
                                                        <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Line Total</span>
                                                        <span className="font-mono font-extrabold text-sm text-indigo-700">
                                                            ₹{lineTotal.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Table Footer Summary */}
                                <div className="bg-indigo-50/70 p-4 border-t flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold text-indigo-900 gap-2">
                                    <div className="flex items-center gap-4">
                                        <span>Total Lines: <strong>{summary.totalItems}</strong></span>
                                        <span>Total Packets: <strong>{summary.totalPackets}</strong></span>
                                        <span>Total Units: <strong>{summary.totalUnits}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600 uppercase tracking-wider text-[11px]">Subtotal Cost:</span>
                                        <span className="font-mono text-lg font-extrabold text-indigo-700">
                                            ₹{summary.totalCost.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Notes Card */}
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    Order Notes & Supplier Instructions (Optional)
                                </label>
                                <textarea
                                    rows={3}
                                    className="w-full rounded-md border-gray-300 text-sm shadow-2xs focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Enter payment agreements, delivery instructions, invoice references, or supplier remarks..."
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                />
                                {errors.notes && (
                                    <p className="text-xs text-red-600 mt-1">{errors.notes}</p>
                                )}
                            </div>
                        </div>

                        {/* Right Summary Column (1 Column) */}
                        <div className="space-y-6">
                            {/* Financial Summary Card */}
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs sticky top-6 space-y-5">
                                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center border-b pb-3">
                                    <FaReceipt className="mr-2 text-indigo-500" /> Order Financial Summary
                                </h2>

                                <div className="space-y-3 text-xs">
                                    <div className="flex justify-between items-center text-gray-600">
                                        <span>Total Products:</span>
                                        <span className="font-semibold text-gray-800">{summary.totalItems} items</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-600">
                                        <span>Total Quantity:</span>
                                        <span className="font-mono font-semibold text-gray-800">{summary.totalPackets} packets</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-600">
                                        <span>Total Units / Pieces:</span>
                                        <span className="font-mono font-semibold text-gray-800">{summary.totalUnits} units</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-600">
                                        <span>Supplier Linkage:</span>
                                        <span className="font-semibold text-gray-800">
                                            {selectedSupplier ? selectedSupplier.name : 'Open / Unlinked'}
                                        </span>
                                    </div>
                                </div>

                                {/* Grand Total Box */}
                                <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100/60 rounded-xl border border-indigo-200">
                                    <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block mb-1">
                                        Grand Total Estimated Cost
                                    </span>
                                    <div className="text-3xl font-extrabold font-mono text-indigo-700 flex items-center">
                                        <FaRupeeSign className="text-indigo-500 text-xl mr-1" />
                                        {summary.totalCost.toFixed(2)}
                                    </div>
                                    <span className="text-[10px] text-indigo-600 block mt-1">
                                        * Subject to final vendor invoice
                                    </span>
                                </div>

                                {/* Status Card Indicator */}
                                <div className="p-3 bg-gray-50 rounded-lg border text-xs space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 font-semibold">Active Status:</span>
                                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                                            data.status === 'received'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : data.status === 'ordered'
                                                ? 'bg-blue-100 text-blue-800'
                                                : data.status === 'cancelled'
                                                ? 'bg-rose-100 text-rose-800'
                                                : 'bg-amber-100 text-amber-800'
                                        }`}>
                                            {data.status}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 leading-tight">
                                        {data.status === 'received'
                                            ? 'Stock packets will be credited to your product inventory upon saving.'
                                            : data.status === 'ordered'
                                            ? 'Order is placed with vendor. Inventory is not incremented yet.'
                                            : data.status === 'cancelled'
                                            ? 'Order is marked cancelled. No inventory adjustments.'
                                            : 'Draft procurement order for planning and quotation.'}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-2 space-y-3">
                                    <PrimaryButton
                                        type="submit"
                                        disabled={processing}
                                        className="w-full justify-center py-3 text-sm font-bold shadow-md"
                                    >
                                        <FaCheckCircle className="mr-2" size={14} />
                                        {processing
                                            ? 'Saving Order...'
                                            : isEdit
                                            ? 'Update Purchase Order'
                                            : 'Create Purchase Order'}
                                    </PrimaryButton>

                                    <Link
                                        href={route('orders.index')}
                                        className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-lg border border-gray-300 shadow-2xs transition-colors"
                                    >
                                        Cancel & Back
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
