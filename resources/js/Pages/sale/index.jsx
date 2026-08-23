import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import Input from '@/Components/Input';
import Pagination from '@/Components/Pagination';
import { FaShoppingCart, FaCalendarAlt, FaUser, FaBoxOpen, FaChartLine, FaRupeeSign, FaPlus, FaEye, FaChevronDown, FaChevronUp, FaReceipt } from 'react-icons/fa';
import { MdDeleteOutline } from 'react-icons/md';
import debounce from 'lodash/debounce';

export default function SaleIndex({ invoices, summary, products, customers, filters }) {
    const current_dokan = usePage().props.auth.current_dokan;

    const [search, setSearch] = useState(filters.search || '');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [expandedInvoiceId, setExpandedInvoiceId] = useState(null);

    const { delete: deleteSale } = useForm();

    const performSearch = useCallback(
        debounce((query) => {
            router.get(
                route('sales.index'),
                { search: query },
                { preserveState: true, replace: true }
            );
        }, 500),
        []
    );

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        performSearch(value);
    };

    const toggleExpandInvoice = (id) => {
        setExpandedInvoiceId(expandedInvoiceId === id ? null : id);
    };

    const openInvoiceDetails = (inv) => {
        setSelectedInvoice(inv);
        setShowDetailModal(true);
    };

    const handleDeleteInvoice = (inv) => {
        if (!confirm(`Are you sure you want to delete this invoice (${inv.items_count} item(s) total ₹${inv.total_amount})? Product inventory stock will be restored.`)) {
            return;
        }

        router.delete(route('sales.destroy', inv.first_sale_id), {
            data: { sale_ids: inv.sale_ids },
            onSuccess: () => {
                toast.success('Sale invoice deleted and inventory stock restored');
                if (showDetailModal) setShowDetailModal(false);
            },
            onError: () => {
                toast.error('Failed to delete sale invoice');
            }
        });
    };

    return (
        <AuthenticatedLayout header="Sales History">
            <Head title="Sales History" />

            {/* Modal for Invoice Detailed View */}
            <Modal show={showDetailModal} onClose={() => setShowDetailModal(false)} maxWidth="2xl">
                {selectedInvoice && (
                    <div className="p-6 text-gray-900">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                    <FaReceipt className="mr-2 text-indigo-600" /> Invoice Details
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {selectedInvoice.sale_date} • {selectedInvoice.customer ? selectedInvoice.customer.name : 'Walk-in / Cash Customer'}
                                </p>
                            </div>
                            <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">
                                Total: ₹{selectedInvoice.total_amount}
                            </span>
                        </div>

                        {/* Customer Info Card */}
                        <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-200 mb-4 flex justify-between items-center text-xs">
                            <div>
                                <span className="text-gray-500 font-medium block">Customer</span>
                                <span className="font-bold text-gray-900 text-sm">
                                    {selectedInvoice.customer ? selectedInvoice.customer.name : 'Walk-in / Cash Customer'}
                                </span>
                                {selectedInvoice.customer?.phone && (
                                    <span className="text-gray-500 block">{selectedInvoice.customer.phone}</span>
                                )}
                            </div>
                            <div className="text-right">
                                <span className="text-gray-500 font-medium block">Date & Time</span>
                                <span className="font-mono text-gray-800 font-semibold">{selectedInvoice.created_at}</span>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="overflow-x-auto mb-4 border rounded-lg">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-gray-100 uppercase text-gray-600 font-semibold border-b">
                                        <th className="py-2.5 px-3">#</th>
                                        <th className="py-2.5 px-3">Product</th>
                                        <th className="py-2.5 px-3 text-center">Packets</th>
                                        <th className="py-2.5 px-3 text-center">Total Pcs</th>
                                        <th className="py-2.5 px-3 text-right">Rate/Pkt</th>
                                        <th className="py-2.5 px-3 text-right">Disc (₹)</th>
                                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {selectedInvoice.items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="py-2.5 px-3 font-mono text-gray-400">{idx + 1}</td>
                                            <td className="py-2.5 px-3 font-bold text-gray-900">{item.product_name}</td>
                                            <td className="py-2.5 px-3 text-center font-mono font-semibold">{item.qty} pkt</td>
                                            <td className="py-2.5 px-3 text-center font-mono text-gray-600">{item.qty * item.packet_size} pcs</td>
                                            <td className="py-2.5 px-3 text-right font-mono">₹{item.rate}</td>
                                            <td className="py-2.5 px-3 text-right font-mono text-amber-600">₹{item.discount}</td>
                                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">₹{item.total_amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Financial Totals */}
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex justify-between items-center mb-6">
                            <div>
                                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">Grand Total Paid</span>
                                <span className="text-xs text-emerald-700">Includes all item discounts</span>
                            </div>
                            <span className="text-2xl font-extrabold text-emerald-700 font-mono">₹{selectedInvoice.total_amount}</span>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t">
                            <button
                                type="button"
                                onClick={() => handleDeleteInvoice(selectedInvoice)}
                                className="text-red-600 hover:text-red-800 text-xs font-semibold flex items-center px-3 py-2 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                            >
                                <MdDeleteOutline size={16} className="mr-1" /> Delete Entire Invoice
                            </button>
                            <SecondaryButton onClick={() => setShowDetailModal(false)}>
                                Close
                            </SecondaryButton>
                        </div>
                    </div>
                )}
            </Modal>

            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 py-6">
                {/* Stats Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Sales Revenue</p>
                            <h3 className="text-2xl font-bold text-emerald-700 mt-1">₹{summary.totalRevenue.toLocaleString()}</h3>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
                            <FaRupeeSign />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Sales Profit</p>
                            <h3 className="text-2xl font-bold text-indigo-700 mt-1">₹{summary.totalProfit.toLocaleString()}</h3>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl">
                            <FaChartLine />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Invoices</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{summary.totalInvoices}</h3>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                            <FaShoppingCart />
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-sm sm:rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 md:p-6 text-gray-900">
                        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between mb-6 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                    <FaReceipt className="mr-2 text-indigo-600" /> Customer Sales Invoices
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">Showing grouped sales by date and customer</p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <Input
                                    placeholder="Search customer, product, or date..."
                                    value={search}
                                    onChange={handleSearchChange}
                                    addClass="w-full sm:w-64"
                                />
                                <Link
                                    href={route('sales.create')}
                                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                                >
                                    <FaPlus className="mr-1.5" size={12} /> New Invoice
                                </Link>
                            </div>
                        </div>

                        {invoices.data.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <FaBoxOpen className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                <h3 className="text-lg font-medium text-gray-900">No Sales Invoices Found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {search
                                        ? 'No sales match your search query.'
                                        : 'Record your first sale invoice to start tracking revenue.'}
                                </p>
                                {!search && (
                                    <div className="mt-4">
                                        <Link
                                            href={route('sales.create')}
                                            className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md shadow-sm"
                                        >
                                            <FaPlus className="mr-1.5" size={12} /> Record First Invoice
                                        </Link>
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
                                                <th className="py-3 px-4">Date</th>
                                                <th className="py-3 px-4">Customer</th>
                                                <th className="py-3 px-4">Purchased Products</th>
                                                <th className="py-3 px-4 text-center">Packets</th>
                                                <th className="py-3 px-4 text-right">Invoice Total (₹)</th>
                                                <th className="py-3 px-4 text-right">Profit (₹)</th>
                                                <th className="py-3 px-4 text-center w-28">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {invoices.data.map((inv) => {
                                                const isExpanded = expandedInvoiceId === inv.id;

                                                return (
                                                    <React.Fragment key={inv.id}>
                                                        <tr className="hover:bg-gray-50/80 transition-colors">
                                                            <td className="py-3.5 px-4 text-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleExpandInvoice(inv.id)}
                                                                    className="text-gray-400 hover:text-indigo-600 p-1"
                                                                    title={isExpanded ? 'Collapse Items' : 'Expand Items'}
                                                                >
                                                                    {isExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                                                                </button>
                                                            </td>
                                                            <td className="py-3.5 px-4 font-mono text-gray-700 text-xs">
                                                                <div className="flex items-center">
                                                                    <FaCalendarAlt className="mr-1.5 text-gray-400" size={12} />
                                                                    {inv.sale_date}
                                                                </div>
                                                            </td>
                                                            <td className="py-3.5 px-4">
                                                                <div className="flex items-center">
                                                                    <div className="h-7 w-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold mr-2">
                                                                        <FaUser size={10} />
                                                                    </div>
                                                                    <div>
                                                                        <span className="font-bold text-gray-900 block text-xs">
                                                                            {inv.customer ? inv.customer.name : 'Walk-in Customer'}
                                                                        </span>
                                                                        {inv.customer?.phone && (
                                                                            <span className="text-[11px] text-gray-400">{inv.customer.phone}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-3.5 px-4">
                                                                <div className="flex items-center space-x-1.5">
                                                                    <span className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                                                                        {inv.items_count} item{inv.items_count > 1 ? 's' : ''}
                                                                    </span>
                                                                    <span className="text-xs text-gray-600 truncate max-w-xs">
                                                                        {inv.items.map(i => `${i.product_name} (${i.qty} pkt)`).join(', ')}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="py-3.5 px-4 text-center font-mono font-semibold text-gray-800 text-xs">
                                                                {inv.total_packets} pkts
                                                                <span className="block text-[10px] text-gray-400 font-sans font-normal">({inv.total_pieces} pcs)</span>
                                                            </td>
                                                            <td className="py-3.5 px-4 text-right font-mono font-extrabold text-emerald-700">
                                                                ₹{inv.total_amount.toFixed(2)}
                                                            </td>
                                                            <td className="py-3.5 px-4 text-right font-mono font-bold text-indigo-600">
                                                                ₹{inv.total_profit.toFixed(2)}
                                                            </td>
                                                            <td className="py-3.5 px-4 text-center">
                                                                <div className="flex items-center justify-center space-x-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openInvoiceDetails(inv)}
                                                                        className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                                                        title="View Invoice Details"
                                                                    >
                                                                        <FaEye size={13} />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDeleteInvoice(inv)}
                                                                        className="p-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                                                                        title="Delete Invoice"
                                                                    >
                                                                        <MdDeleteOutline size={16} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>

                                                        {/* Expanded Inline Items Table */}
                                                        {isExpanded && (
                                                            <tr className="bg-indigo-50/40">
                                                                <td colSpan="8" className="p-4">
                                                                    <div className="bg-white rounded-lg border border-indigo-100 p-3 shadow-inner">
                                                                        <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">
                                                                            Invoice Product Breakdown
                                                                        </h4>
                                                                        <div className="space-y-1 text-xs">
                                                                            {inv.items.map((item, itemIdx) => (
                                                                                <div key={itemIdx} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                                                                                    <span className="font-semibold text-gray-800">
                                                                                        {item.product_name}
                                                                                    </span>
                                                                                    <div className="flex items-center space-x-4 font-mono">
                                                                                        <span className="text-gray-600">{item.qty} pkt ({item.qty * item.packet_size} pcs)</span>
                                                                                        <span className="text-gray-500">@ ₹{item.rate}/pkt</span>
                                                                                        {item.discount > 0 && (
                                                                                            <span className="text-amber-600">-₹{item.discount} disc</span>
                                                                                        )}
                                                                                        <span className="font-bold text-emerald-700">₹{item.total_amount}</span>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
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
                                    <Pagination links={invoices.links} />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
