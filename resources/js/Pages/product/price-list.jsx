import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import Input from '@/Components/Input';
import { FaTag, FaPrint, FaSearch, FaBoxes, FaStore, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import debounce from 'lodash/debounce';

export default function PriceList({ products, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    const performSearch = useCallback(
        debounce((query) => {
            router.get(
                route('products.price-list'),
                { search: query },
                { preserveState: true, replace: true }
            );
        }, 300),
        []
    );

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        performSearch(value);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout header="Selling Price List">
            <Head title="Product Selling Price List" />

            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 py-6">
                {/* Header & Print Control Bar */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6 print:hidden">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <FaTag className="mr-2.5 text-emerald-600" /> Store Price List (Selling Rates)
                            </h1>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Official selling rate catalog for all store products
                            </p>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Input
                                placeholder="Search product name..."
                                value={search}
                                onChange={handleSearchChange}
                                addClass="w-full md:w-64 text-sm"
                            />

                            <button
                                type="button"
                                onClick={handlePrint}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center shadow-sm transition-colors whitespace-nowrap"
                            >
                                <FaPrint className="mr-2" /> Print Price Catalog
                            </button>
                        </div>
                    </div>
                </div>

                {/* Printable Store Banner Header (Only visible on Print) */}
                <div className="hidden print:block text-center border-b-2 border-gray-900 pb-4 mb-6">
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center justify-center uppercase tracking-wider">
                        <FaStore className="mr-2 text-emerald-700" /> Dokan Selling Rate Catalog
                    </h1>
                    <p className="text-sm text-gray-600 mt-1 font-mono">Date: {new Date().toLocaleDateString('en-IN')}</p>
                </div>

                {/* Product Price Cards & Table */}
                <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 md:p-6">
                        {products.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <FaBoxes className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                <h3 className="text-lg font-medium text-gray-900">No Products Found</h3>
                                <p className="mt-1 text-sm text-gray-500">No products match your search query.</p>
                            </div>
                        ) : (
                            <>
                                {/* Mobile Grid Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden print:hidden">
                                    {products.map((p) => {
                                        const perPieceRate = p.packet_size > 0 ? (p.selling_rate / p.packet_size).toFixed(2) : 0;
                                        const inStock = p.purchased_packets > 0;

                                        return (
                                            <div key={p.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-bold text-gray-900 text-base">{p.name}</h3>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                                            {inStock ? `${p.purchased_packets} pkts in stock` : 'Out of Stock'}
                                                        </span>
                                                    </div>
                                                    {p.description && (
                                                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{p.description}</p>
                                                    )}
                                                </div>

                                                <div className="pt-3 border-t border-gray-100 bg-emerald-50/50 p-3 rounded-lg flex justify-between items-center">
                                                    <div>
                                                        <span className="text-[10px] uppercase font-bold text-gray-500 block">Packet Size</span>
                                                        <span className="text-xs font-semibold text-gray-800 font-mono">{p.packet_size} pcs / pkt</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] uppercase font-bold text-emerald-800 block">Selling Price</span>
                                                        <span className="text-xl font-extrabold text-emerald-700 font-mono">₹{p.selling_rate}</span>
                                                        <span className="text-[10px] text-gray-500 block font-mono">
                                                            (₹{perPieceRate} / pc)
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Desktop Table */}
                                <div className="hidden md:block overflow-x-auto print:block">
                                    <table className="w-full text-left whitespace-nowrap min-w-max border rounded-xl overflow-hidden text-sm">
                                        <thead>
                                            <tr className="bg-gray-100 text-xs font-bold uppercase text-gray-700 border-b">
                                                <th className="py-3.5 px-4 w-12">#</th>
                                                <th className="py-3.5 px-4">Product Name</th>
                                                <th className="py-3.5 px-4">Packet Size</th>
                                                <th className="py-3.5 px-4 text-right">Selling Rate / Packet</th>
                                                <th className="py-3.5 px-4 text-right">Unit Rate / Piece</th>
                                                <th className="py-3.5 px-4 text-center print:hidden">Availability</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {products.map((p, idx) => {
                                                const perPieceRate = p.packet_size > 0 ? (p.selling_rate / p.packet_size).toFixed(2) : 0;
                                                const inStock = p.purchased_packets > 0;

                                                return (
                                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="py-3.5 px-4 font-mono text-xs text-gray-400">{idx + 1}</td>
                                                        <td className="py-3.5 px-4">
                                                            <span className="font-bold text-gray-900 text-base block">{p.name}</span>
                                                            {p.description && (
                                                                <span className="text-xs text-gray-400 block truncate max-w-xs">{p.description}</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3.5 px-4 font-mono font-medium text-gray-700">
                                                            {p.packet_size} pcs / packet
                                                        </td>
                                                        <td className="py-3.5 px-4 text-right font-mono font-extrabold text-emerald-700 text-lg">
                                                            ₹{p.selling_rate}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-right font-mono text-gray-600 text-xs">
                                                            ₹{perPieceRate} / pc
                                                        </td>
                                                        <td className="py-3.5 px-4 text-center print:hidden">
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                                                {inStock ? <FaCheckCircle className="mr-1" size={10} /> : <FaExclamationTriangle className="mr-1" size={10} />}
                                                                {inStock ? `${p.purchased_packets} pkts` : 'Out of Stock'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
