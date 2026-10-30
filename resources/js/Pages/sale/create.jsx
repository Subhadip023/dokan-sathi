import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import SearchableSelect from '@/Components/SearchableSelect';
import { FaShoppingCart, FaArrowLeft, FaPlus, FaTrash, FaUser, FaCalendarAlt, FaRupeeSign, FaBoxes, FaReceipt, FaTag, FaKeyboard, FaTimes } from 'react-icons/fa';

export default function CreateSale({ products, customers }) {
    const current_dokan = usePage().props.auth.current_dokan;

    const getTodayDate = () => new Date().toISOString().split('T')[0];

    const createInitialItem = (productId = '') => ({
        product_id: productId || '',
        qty: 1,
        discount: 0,
    });

    const { data, setData, post, errors, processing } = useForm({
        dokan_id: current_dokan?.id,
        sale_date: getTodayDate(),
        customer_id: '',
        order_discount: 0,
        payment_status: 'full_paid',
        paid_amount: '',
        items: [createInitialItem()],
    });

    // Refs for keyboard shortcuts (strictly max 2 keys)
    const quickProductSelectRef = useRef(null);
    const customerSelectRef = useRef(null);
    const orderDiscountRef = useRef(null);
    const paidAmountRef = useRef(null);
    const [showShortcutsModal, setShowShortcutsModal] = useState(false);

    // Quick add product from search/dropdown selector
    const [quickSelectedProductId, setQuickSelectedProductId] = useState('');

    const selectedCustomer = useMemo(() => {
        if (!data.customer_id) return null;
        return customers.find(c => String(c.id) === String(data.customer_id)) || null;
    }, [customers, data.customer_id]);

    const handleAddQuickProduct = (productIdOverride = null) => {
        const prodId = productIdOverride || quickSelectedProductId;
        if (!prodId) return;

        // Check if already in cart, if so increase qty
        const existingIdx = data.items.findIndex(item => String(item.product_id) === String(prodId));
        if (existingIdx >= 0) {
            const newItems = [...data.items];
            newItems[existingIdx].qty = (parseInt(newItems[existingIdx].qty) || 0) + 1;
            setData('items', newItems);
            toast.success('Product quantity increased');
        } else {
            // If invoice has only 1 item and it has no product selected, replace it
            if (data.items.length === 1 && !data.items[0].product_id) {
                setData('items', [createInitialItem(prodId)]);
            } else {
                setData('items', [...data.items, createInitialItem(prodId)]);
            }
            toast.success('Product added to invoice');
        }
        setQuickSelectedProductId('');
    };

    const addItemRow = () => {
        setData('items', [...data.items, createInitialItem()]);
    };

    const removeItemRow = (index) => {
        if (data.items.length <= 1) {
            if (data.items[0].product_id) {
                setData('items', [createInitialItem('')]);
                toast.success('Product selection cleared');
            } else {
                toast.error('Invoice must contain at least one product row');
            }
            return;
        }
        const newItems = data.items.filter((_, i) => i !== index);
        setData('items', newItems);
    };

    const updateItemRow = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;
        setData('items', newItems);
    };

    // Calculate Grand Totals & Order Level Discount Split
    const grandTotals = useMemo(() => {
        let subtotal = 0;
        let itemDiscountsSum = 0;
        let totalPackets = 0;
        let totalPieces = 0;

        const numItems = data.items.length;
        const overallOrderDiscount = parseFloat(data.order_discount) || 0;
        const splitDiscountPerItem = numItems > 0 ? overallOrderDiscount / numItems : 0;

        data.items.forEach(item => {
            const product = products.find(p => String(p.id) === String(item.product_id));
            const qty = parseInt(item.qty) || 0;
            const discount = parseFloat(item.discount) || 0;

            if (product) {
                const lineTotal = qty * product.selling_rate;
                subtotal += lineTotal;
                itemDiscountsSum += discount;
                totalPackets += qty;
                totalPieces += qty * product.packet_size;
            }
        });

        const totalDiscount = itemDiscountsSum + overallOrderDiscount;
        const grandTotal = Math.max(0, subtotal - totalDiscount);

        return {
            subtotal,
            itemDiscountsSum,
            overallOrderDiscount,
            totalDiscount,
            splitDiscountPerItem,
            grandTotal,
            totalPackets,
            totalPieces
        };
    }, [data.items, data.order_discount, products]);

    const paymentBreakdown = useMemo(() => {
        const grandTotal = grandTotals.grandTotal;
        let paid = 0;
        let due = 0;

        if (data.payment_status === 'full_paid') {
            paid = grandTotal;
            due = 0;
        } else if (data.payment_status === 'credit') {
            paid = 0;
            due = grandTotal;
        } else {
            const rawPaid = parseFloat(data.paid_amount) || 0;
            paid = Math.min(grandTotal, Math.max(0, rawPaid));
            due = Math.max(0, grandTotal - paid);
        }

        return { paid, due };
    }, [grandTotals.grandTotal, data.payment_status, data.paid_amount]);

    const handleSubmitSale = (e) => {
        if (e && typeof e.preventDefault === 'function') {
            e.preventDefault();
        }

        // Validate items
        const validItems = data.items.filter(item => item.product_id);
        if (validItems.length === 0) {
            toast.error('Please select at least one product before saving invoice.');
            return;
        }

        const invalidItem = data.items.find(item => !item.product_id || item.qty <= 0);
        if (invalidItem) {
            toast.error('Please select valid products and positive quantity for all items.');
            return;
        }

        post(route('sales.store'), {
            onSuccess: () => {
                toast.success('Sale invoice created successfully!');
            },
            onError: (err) => {
                console.log(err);
                toast.error('Failed to create sale invoice. Please check inputs.');
            }
        });
    };

    // Keyboard Shortcuts Listener (Strictly Alt + Key only, NO function keys)
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Escape: Close help modal
            if (e.key === 'Escape') {
                if (showShortcutsModal) {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowShortcutsModal(false);
                    return;
                }
            }

            // Must have Alt key pressed
            if (!e.altKey) return;

            const code = e.code || '';
            const key = (e.key || '').toLowerCase();
            const isMatch = (targetCode, targetChar) => code === targetCode || key === targetChar;

            // Alt + H: Toggle shortcuts guide modal
            if (isMatch('KeyH', 'h')) {
                e.preventDefault();
                e.stopPropagation();
                setShowShortcutsModal(prev => !prev);
                return;
            }

            // Alt + P: Focus Quick Add Product
            if (isMatch('KeyP', 'p')) {
                e.preventDefault();
                e.stopPropagation();
                quickProductSelectRef.current?.focus();
                return;
            }

            // Alt + C: Focus Customer selector
            if (isMatch('KeyC', 'c')) {
                e.preventDefault();
                e.stopPropagation();
                customerSelectRef.current?.focus();
                return;
            }

            // Alt + S: Submit / Complete Sale
            if (isMatch('KeyS', 's')) {
                e.preventDefault();
                e.stopPropagation();
                handleSubmitSale();
                return;
            }

            // Alt + N: Add Another Product Row
            if (isMatch('KeyN', 'n')) {
                e.preventDefault();
                e.stopPropagation();
                addItemRow();
                toast.success('New product row added');
                return;
            }

            // Alt + D: Focus Overall Order Discount
            if (isMatch('KeyD', 'd')) {
                e.preventDefault();
                e.stopPropagation();
                orderDiscountRef.current?.focus();
                orderDiscountRef.current?.select?.();
                return;
            }

            // Alt + 1: Full Paid
            if (isMatch('Digit1', '1')) {
                e.preventDefault();
                e.stopPropagation();
                setData('payment_status', 'full_paid');
                toast('Payment status: Full Paid', { icon: '💳' });
                return;
            }

            // Alt + 2: Partial Paid
            if (isMatch('Digit2', '2')) {
                e.preventDefault();
                e.stopPropagation();
                setData('payment_status', 'partially_paid');
                toast('Payment status: Partial', { icon: '📝' });
                setTimeout(() => {
                    paidAmountRef.current?.focus();
                    paidAmountRef.current?.select?.();
                }, 80);
                return;
            }

            // Alt + 3: Credit / Due
            if (isMatch('Digit3', '3')) {
                e.preventDefault();
                e.stopPropagation();
                setData('payment_status', 'credit');
                toast('Payment status: Credit / Due', { icon: '⏳' });
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [showShortcutsModal, data, products]);

    return (
        <AuthenticatedLayout header="Record New Sale">
            <Head title="Create Sale Invoice" />

            <div className="mx-auto w-full sm:px-6 lg:px-8 py-6">
                {/* Header Action Bar */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('sales.index')}
                            className="p-2.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
                            title="Back to Sales List"
                        >
                            <FaArrowLeft size={16} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <FaReceipt className="mr-2 text-indigo-600" /> New Sale Invoice
                            </h1>
                            <p className="text-xs text-gray-500">Record a new sale transaction for multiple products</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowShortcutsModal(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors shadow-2xs text-xs font-semibold"
                        title="View keyboard shortcuts (Alt+H)"
                    >
                        <FaKeyboard size={14} />
                        <span>Shortcuts</span>
                        <kbd className="ml-1 px-1.5 py-0.5 text-[10px] bg-white border border-indigo-200 rounded font-mono font-bold text-indigo-600 shadow-2xs">
                            Alt + H
                        </kbd>
                    </button>
                </div>

                <form onSubmit={handleSubmitSale}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Billing Section (Left 2 Columns) */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Customer & Sale Date Details */}
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center">
                                    <FaUser className="mr-2 text-indigo-500" /> Customer & Invoice Info
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="sale_date" className="block text-xs font-medium text-gray-700 mb-1">
                                            Sale Date <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                id="sale_date"
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm pl-9"
                                                value={data.sale_date}
                                                onChange={(e) => setData('sale_date', e.target.value)}
                                                required
                                            />
                                            <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" size={14} />
                                        </div>
                                        {errors.sale_date && (
                                            <p className="text-xs text-red-600 mt-1">{errors.sale_date}</p>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label htmlFor="customer_id" className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                                                <span>Customer Name</span>
                                                <kbd className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded border border-gray-300 font-mono font-bold whitespace-nowrap shrink-0" title="Press Alt+C">
                                                    Alt+C
                                                </kbd>
                                            </label>
                                            <Link
                                                href={route('coustomers.create')}
                                                target="_blank"
                                                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-colors"
                                                title="Add new customer (opens in new tab)"
                                            >
                                                <FaPlus size={9} /> New Customer
                                            </Link>
                                        </div>
                                        <SearchableSelect
                                            ref={customerSelectRef}
                                            id="customer_id"
                                            options={customers}
                                            value={data.customer_id}
                                            onChange={(val) => setData('customer_id', val)}
                                            placeholder="Walk-in / Cash Customer"
                                            searchPlaceholder="Search customer by name, phone, shop... (Alt+C)"
                                            emptyOption={{ id: '', name: 'Walk-in / Cash Customer', subtitle: 'Standard counter sale (no customer account)' }}
                                            icon={FaUser}
                                            error={Boolean(errors.customer_id)}
                                        />
                                        {errors.customer_id && (
                                            <p className="text-xs text-red-600 mt-1">{errors.customer_id}</p>
                                        )}

                                        {/* Selected Customer Quick Info Card */}
                                        {selectedCustomer && (
                                            <div className="mt-2.5 p-2.5 bg-indigo-50/60 rounded-lg border border-indigo-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in duration-150">
                                                <div className="min-w-0">
                                                    <div className="font-bold text-gray-900 flex items-center gap-1.5 truncate">
                                                        <span>{selectedCustomer.name}</span>
                                                        {selectedCustomer.shop_name && (
                                                            <span className="text-[10px] bg-indigo-100 text-indigo-800 font-medium px-1.5 py-0.5 rounded">
                                                                {selectedCustomer.shop_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-gray-600 mt-0.5 flex flex-wrap items-center gap-3">
                                                        {selectedCustomer.phone && (
                                                            <span className="font-mono text-gray-700 font-medium">📞 {selectedCustomer.phone}</span>
                                                        )}
                                                        {selectedCustomer.email && (
                                                            <span className="text-gray-500">✉️ {selectedCustomer.email}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <Link
                                                    href={route('coustomers.edit', selectedCustomer.id)}
                                                    target="_blank"
                                                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold shrink-0"
                                                >
                                                    View / Edit Profile →
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Cart / Products Items Section */}
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center">
                                        <FaBoxes className="mr-2 text-indigo-500" /> Product Items ({data.items.length})
                                    </h2>
                                </div>

                                {/* Quick Add Product Bar */}
                                {products.length > 0 && (
                                    <div className="bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-100 mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span className="text-xs font-bold text-indigo-900">Quick Add Product to Cart</span>
                                                <kbd className="px-1.5 py-0.5 text-[10px] bg-indigo-100 text-indigo-700 rounded border border-indigo-200 font-mono font-bold" title="Press Alt+P">
                                                    Alt + P
                                                </kbd>
                                            </div>
                                            <SearchableSelect
                                                ref={quickProductSelectRef}
                                                options={products}
                                                value={quickSelectedProductId}
                                                onChange={(val) => {
                                                    if (val) {
                                                        handleAddQuickProduct(val);
                                                    } else {
                                                        setQuickSelectedProductId('');
                                                    }
                                                }}
                                                placeholder="Search product name, description... (Press Alt+P to focus)"
                                            />
                                        </div>
                                        <div className="sm:self-end shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => handleAddQuickProduct()}
                                                disabled={!quickSelectedProductId}
                                                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center justify-center transition-colors shadow-xs"
                                            >
                                                <FaPlus className="mr-1.5" size={11} /> Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {products.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                        <p className="text-sm text-red-600 font-medium">No products available in your Dokan.</p>
                                        <p className="text-xs text-gray-500 mt-1">Please add products first under the Products page.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {/* Items Table */}
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead>
                                                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-semibold text-gray-500">
                                                        <th className="py-2.5 px-3 w-10">#</th>
                                                        <th className="py-2.5 px-3 min-w-[220px]">Product & Description</th>
                                                        <th className="py-2.5 px-3 w-28">Rate/Pkt</th>
                                                        <th className="py-2.5 px-3 w-28">Packets Qty</th>
                                                        <th className="py-2.5 px-3 w-28">Item Disc (₹)</th>
                                                        <th className="py-2.5 px-3 w-32 text-right">Subtotal</th>
                                                        <th className="py-2.5 px-3 w-12 text-center"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {data.items.map((item, idx) => {
                                                        const itemProduct = products.find(p => String(p.id) === String(item.product_id));
                                                        const rate = itemProduct ? itemProduct.selling_rate : 0;
                                                        const qty = parseInt(item.qty) || 0;
                                                        const itemDisc = parseFloat(item.discount) || 0;
                                                        const totalItemDisc = itemDisc + grandTotals.splitDiscountPerItem;
                                                        const lineTotal = itemProduct ? Math.max(0, (qty * rate) - totalItemDisc) : 0;

                                                        return (
                                                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors align-top">
                                                                <td className="py-3 px-3 text-xs text-gray-400 font-mono">{idx + 1}</td>
                                                                <td className="py-3 px-3">
                                                                    <SearchableSelect
                                                                        options={products}
                                                                        value={item.product_id}
                                                                        onChange={(val) => updateItemRow(idx, 'product_id', val)}
                                                                        placeholder="Search product name, description..."
                                                                    />
                                                                    {itemProduct && (
                                                                        <div className="mt-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                                                                            <div className="font-bold text-gray-900 text-xs">{itemProduct.name}</div>
                                                                            {itemProduct.description ? (
                                                                                <div className="text-[11px] text-gray-600 italic leading-snug">
                                                                                    {itemProduct.description}
                                                                                </div>
                                                                            ) : (
                                                                                <div className="text-[11px] text-gray-400 italic">No description available</div>
                                                                            )}
                                                                            <div className="text-[10px] text-gray-500 font-mono pt-1 border-t border-gray-200 flex justify-between">
                                                                                <span>{qty * itemProduct.packet_size} pcs total</span>
                                                                                <span>Stock: {itemProduct.purchased_packets} pkts</span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className="py-3 px-3 font-mono text-gray-700">
                                                                    ₹{rate}
                                                                </td>
                                                                <td className="py-3 px-3">
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs font-mono"
                                                                        value={item.qty}
                                                                        onChange={(e) => updateItemRow(idx, 'qty', e.target.value)}
                                                                        required
                                                                    />
                                                                </td>
                                                                <td className="py-3 px-3">
                                                                    <input
                                                                        type="number"
                                                                        step="0.01"
                                                                        min="0"
                                                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs font-mono"
                                                                        value={item.discount}
                                                                        onChange={(e) => updateItemRow(idx, 'discount', e.target.value)}
                                                                    />
                                                                    {grandTotals.splitDiscountPerItem > 0 && (
                                                                        <span className="text-[10px] text-amber-600 block mt-0.5 font-sans">
                                                                            +₹{grandTotals.splitDiscountPerItem.toFixed(2)} order disc
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="py-3 px-3 font-mono font-bold text-emerald-700 text-right">
                                                                    ₹{lineTotal.toFixed(2)}
                                                                </td>
                                                                <td className="py-3 px-3 text-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeItemRow(idx)}
                                                                        disabled={data.items.length <= 1 && !item.product_id}
                                                                        className={`p-1.5 rounded-md transition-colors ${data.items.length <= 1 && !item.product_id ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                                                                        title={data.items.length <= 1 ? (item.product_id ? 'Clear product selection' : 'Empty item') : 'Remove item'}
                                                                    >
                                                                        <FaTrash size={13} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                type="button"
                                                onClick={addItemRow}
                                                className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 text-gray-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                                            >
                                                <span className="flex items-center">
                                                    <FaPlus className="mr-1.5" size={11} /> Add Another Product Row
                                                </span>
                                                <kbd className="px-1.5 py-0.5 text-[10px] bg-white border border-gray-300 rounded font-mono text-gray-600 font-bold shadow-2xs">
                                                    Alt + N
                                                </kbd>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Summary & Completion Sidebar (Right Column) */}
                        <div className="space-y-6">
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm sticky top-6">
                                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 border-b pb-2 flex items-center">
                                    <FaShoppingCart className="mr-2 text-indigo-500" /> Invoice Summary
                                </h2>

                                <div className="space-y-3 text-sm text-gray-600">
                                    <div className="flex justify-between items-center">
                                        <span>Total Product Items</span>
                                        <span className="font-semibold text-gray-900">{data.items.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Total Packets</span>
                                        <span className="font-semibold text-gray-900">{grandTotals.totalPackets} pkt(s)</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Total Pieces</span>
                                        <span className="font-semibold text-gray-900">{grandTotals.totalPieces} pcs</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                        <span>Gross Subtotal</span>
                                        <span className="font-mono font-medium text-gray-900">₹{grandTotals.subtotal.toFixed(2)}</span>
                                    </div>

                                    {/* Overall Order Discount Input Box */}
                                    <div className="pt-2 border-t border-gray-100">
                                        <div className="flex items-center justify-between mb-1">
                                            <label htmlFor="order_discount" className="text-xs font-semibold text-indigo-900 flex items-center">
                                                <FaTag className="mr-1 text-indigo-500" size={11} /> Overall Order Discount (₹)
                                            </label>
                                            <kbd className="px-1.5 py-0.5 text-[10px] bg-indigo-50 border border-indigo-200 rounded font-mono text-indigo-700 font-bold shadow-2xs" title="Press Alt+D">
                                                Alt + D
                                            </kbd>
                                        </div>
                                        <input
                                            ref={orderDiscountRef}
                                            type="number"
                                            id="order_discount"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm font-mono"
                                            value={data.order_discount}
                                            onChange={(e) => setData('order_discount', e.target.value)}
                                        />
                                        {grandTotals.overallOrderDiscount > 0 && (
                                            <p className="text-[11px] text-indigo-600 mt-1 font-medium">
                                                Splits ₹{grandTotals.splitDiscountPerItem.toFixed(2)} discount per product ({data.items.length} items)
                                            </p>
                                        )}
                                    </div>

                                    {/* Total Discounts Display */}
                                    <div className="flex justify-between items-center text-red-600 text-xs font-semibold pt-1">
                                        <span>Total Combined Discount</span>
                                        <span className="font-mono text-sm">- ₹{grandTotals.totalDiscount.toFixed(2)}</span>
                                    </div>

                                    {/* Grand Total Highlight Box */}
                                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 mt-4 text-emerald-950">
                                        <span className="text-xs uppercase font-bold tracking-wider block text-emerald-800">
                                            Grand Total Payable
                                        </span>
                                        <div className="text-3xl font-extrabold text-emerald-700 mt-1 flex items-center">
                                            <FaRupeeSign className="text-2xl mr-1" />
                                            {grandTotals.grandTotal.toFixed(2)}
                                        </div>
                                    </div>

                                    {/* Payment Status Selection */}
                                    <div className="pt-4 border-t border-gray-200">
                                        <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                                            Payment Status <span className="text-red-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-3 gap-1.5 text-xs mb-3">
                                            <button
                                                type="button"
                                                onClick={() => setData('payment_status', 'full_paid')}
                                                className={`py-2 px-1.5 rounded-lg font-bold border transition-colors flex flex-col items-center justify-center gap-0.5 ${data.payment_status === 'full_paid' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                                            >
                                                <span>Full Paid</span>
                                                <kbd className={`text-[9px] font-mono px-1 py-0.2 rounded font-semibold ${data.payment_status === 'full_paid' ? 'bg-emerald-700 text-emerald-100' : 'bg-gray-200 text-gray-600'}`}>
                                                    Alt + 1
                                                </kbd>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setData('payment_status', 'partially_paid');
                                                    setTimeout(() => {
                                                        paidAmountRef.current?.focus();
                                                        paidAmountRef.current?.select?.();
                                                    }, 80);
                                                }}
                                                className={`py-2 px-1.5 rounded-lg font-bold border transition-colors flex flex-col items-center justify-center gap-0.5 ${data.payment_status === 'partially_paid' ? 'bg-amber-500 text-white border-amber-500 shadow-xs' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                                            >
                                                <span>Partial</span>
                                                <kbd className={`text-[9px] font-mono px-1 py-0.2 rounded font-semibold ${data.payment_status === 'partially_paid' ? 'bg-amber-600 text-amber-100' : 'bg-gray-200 text-gray-600'}`}>
                                                    Alt + 2
                                                </kbd>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setData('payment_status', 'credit')}
                                                className={`py-2 px-1.5 rounded-lg font-bold border transition-colors flex flex-col items-center justify-center gap-0.5 ${data.payment_status === 'credit' ? 'bg-red-600 text-white border-red-600 shadow-xs' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                                            >
                                                <span>Credit / Due</span>
                                                <kbd className={`text-[9px] font-mono px-1 py-0.2 rounded font-semibold ${data.payment_status === 'credit' ? 'bg-red-700 text-red-100' : 'bg-gray-200 text-gray-600'}`}>
                                                    Alt + 3
                                                </kbd>
                                            </button>
                                        </div>

                                        {data.payment_status === 'partially_paid' && (
                                            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 space-y-2 text-xs">
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <label htmlFor="paid_amount" className="font-bold text-amber-900">
                                                            Amount Paid Now (₹)
                                                        </label>
                                                        <kbd className="px-1.5 py-0.2 text-[9px] bg-amber-100 text-amber-800 rounded border border-amber-200 font-mono">
                                                            Alt + 2
                                                        </kbd>
                                                    </div>
                                                    <input
                                                        ref={paidAmountRef}
                                                        type="number"
                                                        id="paid_amount"
                                                        step="0.01"
                                                        min="0"
                                                        max={grandTotals.grandTotal}
                                                        placeholder="0.00"
                                                        className="w-full border-amber-300 rounded-md shadow-xs focus:ring-amber-500 focus:border-amber-500 font-mono text-sm"
                                                        value={data.paid_amount}
                                                        onChange={(e) => setData('paid_amount', e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center pt-1 text-amber-950 font-semibold">
                                                    <span>Remaining Due Balance:</span>
                                                    <span className="font-mono text-red-600 font-bold text-sm">
                                                        ₹{paymentBreakdown.due.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {data.payment_status === 'credit' && (
                                            <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-xs text-red-900 flex justify-between items-center">
                                                <span>Total Customer Due:</span>
                                                <span className="font-mono font-bold text-red-700 text-sm">
                                                    ₹{paymentBreakdown.due.toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <PrimaryButton
                                        type="submit"
                                        disabled={processing || products.length === 0 || !data.items.some(i => i.product_id)}
                                        className="w-full py-3 justify-center text-sm font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2"
                                    >
                                        <FaShoppingCart className="mr-1" />
                                        <span>Complete & Save Sale</span>
                                        <kbd className="ml-1 px-1.5 py-0.5 text-[10px] bg-emerald-800 text-emerald-100 rounded border border-emerald-500/50 font-mono font-bold shadow-xs">
                                            Alt + S
                                        </kbd>
                                    </PrimaryButton>

                                    <Link
                                        href={route('sales.index')}
                                        className="w-full block text-center py-2.5 text-xs text-gray-500 hover:text-gray-800 font-medium"
                                    >
                                        Cancel & Return
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Keyboard Shortcuts Help Modal (Alt+H) */}
                {showShortcutsModal && (
                    <div
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
                        onClick={() => setShowShortcutsModal(false)}
                    >
                        <div
                            className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-lg w-full p-6 animate-in zoom-in-95 duration-150"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                        <FaKeyboard size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900">Billing Keyboard Shortcuts</h3>
                                        <p className="text-xs text-gray-500">Fast counter checkout (Alt + key shortcuts)</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowShortcutsModal(false)}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Close (Esc)"
                                >
                                    <FaTimes size={14} />
                                </button>
                            </div>

                            <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-xs">
                                {/* Navigation */}
                                <div>
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Search & Focus</div>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-indigo-50/50 transition-colors">
                                            <span className="text-gray-700 font-medium">Focus Quick Product Search</span>
                                            <kbd className="px-2 py-0.5 bg-white border border-gray-300 rounded font-mono font-bold shadow-2xs">Alt + P</kbd>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-indigo-50/50 transition-colors">
                                            <span className="text-gray-700 font-medium">Focus Customer Selector</span>
                                            <kbd className="px-2 py-0.5 bg-white border border-gray-300 rounded font-mono font-bold shadow-2xs">Alt + C</kbd>
                                        </div>
                                    </div>
                                </div>

                                {/* Items & Rows */}
                                <div>
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Cart & Discount</div>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-indigo-50/50 transition-colors">
                                            <span className="text-gray-700 font-medium">Add Another Product Row</span>
                                            <kbd className="px-2 py-0.5 bg-white border border-gray-300 rounded font-mono font-bold shadow-2xs">Alt + N</kbd>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-indigo-50/50 transition-colors">
                                            <span className="text-gray-700 font-medium">Focus Overall Discount</span>
                                            <kbd className="px-2 py-0.5 bg-white border border-gray-300 rounded font-mono font-bold shadow-2xs">Alt + D</kbd>
                                        </div>
                                    </div>
                                </div>

                                {/* Payments */}
                                <div>
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Status</div>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-indigo-50/50 transition-colors">
                                            <span className="text-gray-700 font-medium">Set Full Paid</span>
                                            <kbd className="px-2 py-0.5 bg-white border border-gray-300 rounded font-mono font-bold shadow-2xs">Alt + 1</kbd>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-indigo-50/50 transition-colors">
                                            <span className="text-gray-700 font-medium">Set Partial Paid (Focus Paid Amount)</span>
                                            <kbd className="px-2 py-0.5 bg-white border border-gray-300 rounded font-mono font-bold shadow-2xs">Alt + 2</kbd>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-indigo-50/50 transition-colors">
                                            <span className="text-gray-700 font-medium">Set Credit / Due</span>
                                            <kbd className="px-2 py-0.5 bg-white border border-gray-300 rounded font-mono font-bold shadow-2xs">Alt + 3</kbd>
                                        </div>
                                    </div>
                                </div>

                                {/* Submission & Modal */}
                                <div>
                                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Save & Help</div>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 border border-emerald-100 transition-colors">
                                            <span className="text-emerald-900 font-bold">Complete & Save Invoice</span>
                                            <kbd className="px-2 py-0.5 bg-white border border-emerald-200 rounded font-mono font-bold shadow-2xs text-emerald-800">Alt + S</kbd>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-indigo-50/50 transition-colors">
                                            <span className="text-gray-700 font-medium">Open / Close Shortcuts Help</span>
                                            <kbd className="px-2 py-0.5 bg-white border border-gray-300 rounded font-mono font-bold shadow-2xs">Alt + H</kbd>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-indigo-50/50 transition-colors">
                                            <span className="text-gray-700 font-medium">Close Modal / Popover</span>
                                            <kbd className="px-2 py-0.5 bg-white border border-gray-300 rounded font-mono font-bold shadow-2xs">Esc</kbd>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                <span>Tip: All shortcuts are Alt + key combinations.</span>
                                <button
                                    type="button"
                                    onClick={() => setShowShortcutsModal(false)}
                                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-2xs"
                                >
                                    Got it
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
