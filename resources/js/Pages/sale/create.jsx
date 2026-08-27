import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { FaShoppingCart, FaArrowLeft, FaPlus, FaTrash, FaUser, FaCalendarAlt, FaRupeeSign, FaBoxes, FaReceipt, FaTag } from 'react-icons/fa';

export default function CreateSale({ products, customers }) {
    const current_dokan = usePage().props.auth.current_dokan;

    const getTodayDate = () => new Date().toISOString().split('T')[0];

    const createInitialItem = (productId = '') => ({
        product_id: productId || (products.length > 0 ? products[0].id : ''),
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

    // Quick add product from search/dropdown selector
    const [quickSelectedProductId, setQuickSelectedProductId] = useState('');

    const handleAddQuickProduct = () => {
        if (!quickSelectedProductId) return;
        // Check if already in cart, if so increase qty
        const existingIdx = data.items.findIndex(item => String(item.product_id) === String(quickSelectedProductId));
        if (existingIdx >= 0) {
            const newItems = [...data.items];
            newItems[existingIdx].qty = (parseInt(newItems[existingIdx].qty) || 0) + 1;
            setData('items', newItems);
            toast.success('Product quantity increased');
        } else {
            setData('items', [...data.items, createInitialItem(quickSelectedProductId)]);
            toast.success('Product added to invoice');
        }
        setQuickSelectedProductId('');
    };

    const addItemRow = () => {
        setData('items', [...data.items, createInitialItem()]);
    };

    const removeItemRow = (index) => {
        if (data.items.length <= 1) {
            toast.error('Invoice must contain at least one product');
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
        e.preventDefault();

        // Validate items
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

    return (
        <AuthenticatedLayout header="Record New Sale">
            <Head title="Create Sale Invoice" />

            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 py-6">
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
                                        <label htmlFor="customer_id" className="block text-xs font-medium text-gray-700 mb-1">
                                            Customer Name
                                        </label>
                                        <select
                                            id="customer_id"
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                            value={data.customer_id}
                                            onChange={(e) => setData('customer_id', e.target.value)}
                                        >
                                            <option value="">Walk-in / Cash Customer</option>
                                            {customers.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name} {c.phone ? `(${c.phone})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.customer_id && (
                                            <p className="text-xs text-red-600 mt-1">{errors.customer_id}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Cart / Products Items Section */}
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                                    <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center">
                                        <FaBoxes className="mr-2 text-indigo-500" /> Product Items ({data.items.length})
                                    </h2>

                                    {/* Quick Add Product Bar */}
                                    {products.length > 0 && (
                                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                                            <select
                                                className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs py-1.5"
                                                value={quickSelectedProductId}
                                                onChange={(e) => setQuickSelectedProductId(e.target.value)}
                                            >
                                                <option value="">-- Add Product --</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name} (Stock: {p.purchased_packets} pkts | ₹{p.selling_rate}/pkt)
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={handleAddQuickProduct}
                                                disabled={!quickSelectedProductId}
                                                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-md flex items-center transition-colors"
                                            >
                                                <FaPlus className="mr-1" size={10} /> Add
                                            </button>
                                        </div>
                                    )}
                                </div>

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
                                                        <th className="py-2.5 px-3 min-w-[180px]">Product</th>
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
                                                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                                <td className="py-3 px-3 text-xs text-gray-400 font-mono">{idx + 1}</td>
                                                                <td className="py-3 px-3">
                                                                    <select
                                                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                                                                        value={item.product_id}
                                                                        onChange={(e) => updateItemRow(idx, 'product_id', e.target.value)}
                                                                        required
                                                                    >
                                                                        <option value="">Choose Product</option>
                                                                        {products.map(p => (
                                                                            <option key={p.id} value={p.id}>
                                                                                {p.name} (Stock: {p.purchased_packets} pkts | {p.packet_size} pcs/pkt)
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                    {itemProduct && (
                                                                        <span className="text-[11px] text-gray-400 block mt-0.5">
                                                                            Total pcs: {qty * itemProduct.packet_size}
                                                                        </span>
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
                                                                        disabled={data.items.length <= 1}
                                                                        className={`p-1.5 rounded-md transition-colors ${data.items.length <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                                                                        title="Remove item"
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
                                                className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 text-gray-700 text-xs font-semibold rounded-lg flex items-center justify-center transition-colors"
                                            >
                                                <FaPlus className="mr-1.5" size={11} /> Add Another Product Row
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
                                        <label htmlFor="order_discount" className="block text-xs font-semibold text-indigo-900 mb-1 flex items-center">
                                            <FaTag className="mr-1 text-indigo-500" size={11} /> Overall Order Discount (₹)
                                        </label>
                                        <input
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
                                                className={`py-2 px-2 rounded-lg font-bold border transition-colors ${data.payment_status === 'full_paid' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                                            >
                                                Full Paid
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setData('payment_status', 'partially_paid')}
                                                className={`py-2 px-2 rounded-lg font-bold border transition-colors ${data.payment_status === 'partially_paid' ? 'bg-amber-500 text-white border-amber-500 shadow-xs' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                                            >
                                                Partial
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setData('payment_status', 'credit')}
                                                className={`py-2 px-2 rounded-lg font-bold border transition-colors ${data.payment_status === 'credit' ? 'bg-red-600 text-white border-red-600 shadow-xs' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                                            >
                                                Credit / Due
                                            </button>
                                        </div>

                                        {data.payment_status === 'partially_paid' && (
                                            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 space-y-2 text-xs">
                                                <div>
                                                    <label htmlFor="paid_amount" className="block font-bold text-amber-900 mb-1">
                                                        Amount Paid Now (₹)
                                                    </label>
                                                    <input
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
                                        disabled={processing || products.length === 0}
                                        className="w-full py-3 justify-center text-sm font-bold shadow-md bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        <FaShoppingCart className="mr-2" /> Complete & Save Sale
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
            </div>
        </AuthenticatedLayout>
    );
}
