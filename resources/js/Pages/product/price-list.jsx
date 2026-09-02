import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link, usePage } from '@inertiajs/react';
import { FaPrint, FaBoxes, FaStore, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaUser, FaSignInAlt, FaCheckCircle, FaFilePdf, FaCalendarAlt } from 'react-icons/fa';

export default function PriceList({ products, dokan: pageDokan }) {
    const { user, current_dokan } = usePage().props.auth || {};
    const activeDokan = pageDokan || current_dokan;

    const handlePrint = () => {
        window.print();
    };

    const storeName = activeDokan?.name || 'Store Selling Rates';
    const ownerName = activeDokan?.owner?.name || user?.name || '';
    const storePhone = activeDokan?.phone || activeDokan?.owner?.phone || user?.phone || '';
    const storeEmail = activeDokan?.email || activeDokan?.owner?.email || user?.email || '';
    const storeAddress = activeDokan?.location || '';
    const storeLogo = activeDokan?.logo_url || null;

    const priceListBody = (
        <div className="mx-auto w-full sm:px-6 lg:px-8 py-6">
            {/* Store Information Banner */}
            <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-2xl p-6 md:p-8 shadow-lg mb-8 relative overflow-hidden print:bg-none print:text-black print:p-4 print:shadow-none print:border-b-2 print:border-gray-800 print:mb-4">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-start md:items-center gap-5">
                        {storeLogo && (
                            <img
                                src={storeLogo}
                                alt={storeName}
                                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-white/30 shadow-md bg-white shrink-0 print:w-14 print:h-14 print:border-gray-300"
                            />
                        )}
                        <div>
                            <div className="inline-flex items-center space-x-2 bg-emerald-900/50 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-2 print:hidden">
                                <FaCheckCircle className="text-emerald-400" /> Official Store Price List
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight uppercase print:text-2xl print:text-black">
                                {storeName}
                            </h1>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-emerald-100 mt-3 font-medium print:text-black print:mt-1">
                                {ownerName && (
                                    <div className="flex items-center">
                                        <FaUser className="mr-2 text-emerald-300 print:text-gray-700" />
                                        <span>Owner: <strong className="text-white print:text-black">{ownerName}</strong></span>
                                    </div>
                                )}

                                {storeAddress && (
                                    <div className="flex items-center">
                                        <FaMapMarkerAlt className="mr-2 text-emerald-300 print:text-gray-700" />
                                        <span>{storeAddress}</span>
                                    </div>
                                )}

                                {storePhone && (
                                    <div className="flex items-center">
                                        <FaPhoneAlt className="mr-2 text-emerald-300 print:text-gray-700" />
                                        <span>Contact: <strong className="font-mono text-white print:text-black">{storePhone}</strong></span>
                                    </div>
                                )}

                                {storeEmail && (
                                    <div className="flex items-center">
                                        <FaEnvelope className="mr-2 text-emerald-300 print:text-gray-700" />
                                        <span>Email: <strong className="text-white print:text-black">{storeEmail}</strong></span>
                                    </div>
                                )}

                                <div className="flex items-center">
                                    <FaCalendarAlt className="mr-2 text-emerald-300 print:text-gray-700" />
                                    <span>Date: <strong className="font-mono text-white print:text-black">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Print & PDF Buttons (Hidden on Print) */}
                    <div className="flex items-center gap-3 print:hidden">
                        {activeDokan?.slug && (
                            <a
                                href={route('dokans.price-list.pdf', { dokan: activeDokan.slug })}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-emerald-950/60 hover:bg-emerald-950/80 text-white text-sm font-bold px-4 py-2.5 rounded-xl flex items-center shadow-md hover:shadow-lg transition-all active:scale-95 whitespace-nowrap border border-emerald-500/30"
                            >
                                <FaFilePdf className="mr-2 text-rose-400 text-base" /> View PDF
                            </a>
                        )}

                        <button
                            type="button"
                            onClick={handlePrint}
                            className="bg-white text-emerald-900 hover:bg-emerald-50 text-sm font-bold px-4 py-2.5 rounded-xl flex items-center shadow-md hover:shadow-lg transition-all active:scale-95 whitespace-nowrap cursor-pointer"
                        >
                            <FaPrint className="mr-2 text-emerald-700 text-base" /> Print
                        </button>
                    </div>
                </div>

                {/* Subtle Decorative Pattern */}
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none print:hidden"></div>
            </div>

            {/* Product Price List Table */}
            <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden print:shadow-none print:border-none">
                <div className="p-4 md:p-6 print:p-0">
                    {products.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <FaBoxes className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                            <h3 className="text-lg font-medium text-gray-900">No Products Available</h3>
                            <p className="mt-1 text-sm text-gray-500">The price list is currently empty.</p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile Grid Cards (Screen only) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden print:hidden">
                                {products.map((p) => (
                                    <div key={p.id} className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-base mb-1">{p.name}</h3>
                                            {p.description && (
                                                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{p.description}</p>
                                            )}
                                        </div>

                                        <div className="pt-3 border-t border-gray-200 bg-white p-3 rounded-lg flex justify-between items-center shadow-2xs">
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-gray-400 block">Packet Size</span>
                                                <span className="text-xs font-semibold text-gray-800 font-mono">{p.packet_size} pcs / pkt</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Selling Rate</span>
                                                <span className="text-xl font-extrabold text-emerald-700 font-mono">₹{p.selling_rate}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop & Print Table */}
                            <div className="hidden md:block overflow-x-auto print:block">
                                <table className="w-full text-left whitespace-nowrap min-w-max border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-gray-100 text-xs font-extrabold uppercase text-gray-700 border-b border-gray-300">
                                            <th className="py-4 px-5 w-14">#</th>
                                            <th className="py-4 px-5">Product Description</th>
                                            <th className="py-4 px-5 text-center">Packet Size</th>
                                            <th className="py-4 px-5 text-right">Selling Rate / Packet</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {products.map((p, idx) => (
                                            <tr key={p.id} className="hover:bg-emerald-50/40 transition-colors">
                                                <td className="py-4 px-5 font-mono text-xs text-gray-400 font-semibold">{idx + 1}</td>
                                                <td className="py-4 px-5">
                                                    <span className="font-bold text-gray-900 text-base block">{p.name}</span>
                                                    {p.description && (
                                                        <span className="text-xs text-gray-500 block truncate max-w-md">{p.description}</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-5 text-center font-mono font-semibold text-gray-700">
                                                    <span className="inline-block bg-gray-100 print:bg-none px-3 py-1 rounded-md text-xs border border-gray-200 print:border-none">
                                                        {p.packet_size} pcs / packet
                                                    </span>
                                                </td>
                                                <td className="py-4 px-5 text-right font-mono font-extrabold text-emerald-700 text-xl print:text-black">
                                                    ₹{p.selling_rate}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    // If logged in, wrap inside AuthenticatedLayout
    if (user) {
        return (
            <AuthenticatedLayout header="Selling Price List">
                <Head title={`Price List - ${storeName}`} />
                {priceListBody}
            </AuthenticatedLayout>
        );
    }

    // Public Guest Page View (Without Topbar)
    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-900 flex flex-col justify-between">
            <Head title={`Price List - ${storeName}`} />

            <main className="flex-1">{priceListBody}</main>

            <footer className="text-center py-6 text-xs text-gray-400 font-mono print:hidden">
                Powered by <strong>Dokan Sathi</strong> — Store Catalog Management
            </footer>
        </div>
    );
}
