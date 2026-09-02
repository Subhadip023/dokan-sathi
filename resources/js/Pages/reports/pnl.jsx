import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { FaChartLine, FaRupeeSign, FaCalendarAlt, FaPrint, FaArrowUp, FaArrowDown, FaReceipt, FaBoxes, FaTags, FaCalculator } from 'react-icons/fa';

export default function PnLReport({ filters, summary, productPerformance, overheadCosts }) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get(
            route('reports.pnl'),
            { start_date: startDate, end_date: endDate },
            { preserveState: true }
        );
    };

    const handlePresetChange = (preset) => {
        const today = new Date();
        let start = new Date();
        let end = new Date();

        if (preset === 'today') {
            // today
        } else if (preset === 'this_month') {
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        } else if (preset === 'last_30') {
            start.setDate(today.getDate() - 30);
        } else if (preset === 'this_year') {
            start = new Date(today.getFullYear(), 0, 1);
            end = new Date(today.getFullYear(), 11, 31);
        }

        const formattedStart = start.toISOString().split('T')[0];
        const formattedEnd = end.toISOString().split('T')[0];

        setStartDate(formattedStart);
        setEndDate(formattedEnd);

        router.get(
            route('reports.pnl'),
            { start_date: formattedStart, end_date: formattedEnd },
            { preserveState: true }
        );
    };

    const handlePrint = () => {
        window.print();
    };

    const isProfit = summary.netProfit >= 0;

    return (
        <AuthenticatedLayout header="Profit & Loss Statement">
            <Head title="Profit & Loss Report" />

            <div className="mx-auto w-full sm:px-6 lg:px-8 py-6">
                {/* Header & Date Filter Bar */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6 print:hidden">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <FaChartLine className="mr-2 text-indigo-600" /> Profit & Loss Statement
                            </h1>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Financial performance report from {startDate} to {endDate}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                            {/* Preset Buttons */}
                            <div className="inline-flex rounded-md shadow-sm border border-gray-200 bg-gray-50 p-1">
                                <button
                                    type="button"
                                    onClick={() => handlePresetChange('this_month')}
                                    className="px-3 py-1 text-xs font-semibold rounded text-gray-700 hover:bg-white hover:shadow-xs transition-all"
                                >
                                    This Month
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handlePresetChange('last_30')}
                                    className="px-3 py-1 text-xs font-semibold rounded text-gray-700 hover:bg-white hover:shadow-xs transition-all"
                                >
                                    Last 30 Days
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handlePresetChange('this_year')}
                                    className="px-3 py-1 text-xs font-semibold rounded text-gray-700 hover:bg-white hover:shadow-xs transition-all"
                                >
                                    This Year
                                </button>
                            </div>

                            {/* Custom Date Form */}
                            <form onSubmit={handleFilterSubmit} className="flex items-center space-x-2">
                                <input
                                    type="date"
                                    className="border-gray-300 rounded-md text-xs py-1.5 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                                <span className="text-xs text-gray-400">to</span>
                                <input
                                    type="date"
                                    className="border-gray-300 rounded-md text-xs py-1.5 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-md transition-colors shadow-sm"
                                >
                                    Apply
                                </button>
                            </form>

                            <button
                                type="button"
                                onClick={handlePrint}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded-md flex items-center transition-colors border border-gray-200"
                                title="Print / Export Report"
                            >
                                <FaPrint className="mr-1.5" /> Print
                            </button>
                        </div>
                    </div>
                </div>

                {/* Print Title Header (only visible on print) */}
                <div className="hidden print:block mb-6 text-center border-b pb-4">
                    <h1 className="text-3xl font-bold text-gray-900">Profit & Loss Statement</h1>
                    <p className="text-sm text-gray-600 mt-1">Period: {startDate} to {endDate}</p>
                </div>

                {/* 5 Executive Financial Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    {/* Revenue Card */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Total Revenue</span>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{summary.totalRevenue.toLocaleString()}</h3>
                        <span className="text-[11px] text-gray-400 mt-1 block">Gross Sales Inflow</span>
                    </div>

                    {/* COGS Card */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">COGS (Stock Cost)</span>
                        <h3 className="text-2xl font-bold text-amber-700 mt-1">₹{summary.totalCogs.toLocaleString()}</h3>
                        <span className="text-[11px] text-gray-400 mt-1 block">Cost of Goods Sold</span>
                    </div>

                    {/* Gross Profit Card */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Gross Profit</span>
                        <h3 className="text-2xl font-bold text-indigo-700 mt-1">₹{summary.grossProfit.toLocaleString()}</h3>
                        <span className="text-[11px] text-indigo-600 font-medium mt-1 block">Gross Margin: {summary.grossMargin}%</span>
                    </div>

                    {/* Overhead Costs Card */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Overhead Costs</span>
                        <h3 className="text-2xl font-bold text-red-600 mt-1">₹{summary.totalOverhead.toLocaleString()}</h3>
                        <span className="text-[11px] text-gray-400 mt-1 block">Operating Expenses</span>
                    </div>

                    {/* Net Profit / Loss Card */}
                    <div className={`p-5 rounded-xl border shadow-sm text-white ${isProfit ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 border-emerald-500' : 'bg-gradient-to-br from-red-600 to-red-800 border-red-500'}`}>
                        <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wider block">Net Profit / Loss</span>
                        <h3 className="text-2xl font-extrabold mt-1 flex items-center">
                            {isProfit ? <FaArrowUp className="mr-1 text-emerald-200" size={18} /> : <FaArrowDown className="mr-1 text-red-200" size={18} />}
                            ₹{Math.abs(summary.netProfit).toLocaleString()}
                        </h3>
                        <span className="text-[11px] text-emerald-100 font-medium mt-1 block">Net Margin: {summary.netMargin}%</span>
                    </div>
                </div>

                {/* Structured Financial Statement */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
                    <div className="p-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                        <h2 className="text-base font-bold text-gray-900 flex items-center uppercase tracking-wider">
                            <FaCalculator className="mr-2 text-indigo-600" /> Income Statement Summary
                        </h2>
                        <span className="text-xs font-mono text-gray-500">{startDate} ~ {endDate}</span>
                    </div>

                    <div className="p-5">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
                                    <th className="py-3 px-4">Line Item</th>
                                    <th className="py-3 px-4 text-right">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                <tr className="hover:bg-gray-50">
                                    <td className="py-3 px-4 font-semibold text-gray-900">Total Sales Revenue (Inflow)</td>
                                    <td className="py-3 px-4 font-mono font-bold text-emerald-700 text-right">₹{summary.totalRevenue.toLocaleString()}</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="py-3 px-4 text-gray-700 pl-8">Less: Cost of Goods Sold (COGS)</td>
                                    <td className="py-3 px-4 font-mono text-red-600 text-right">- ₹{summary.totalCogs.toLocaleString()}</td>
                                </tr>
                                <tr className="bg-indigo-50/50 font-bold border-t border-b border-indigo-100">
                                    <td className="py-3 px-4 text-indigo-950">Gross Operating Profit</td>
                                    <td className="py-3 px-4 font-mono text-indigo-700 text-right">₹{summary.grossProfit.toLocaleString()}</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="py-3 px-4 text-gray-700 pl-8">Less: Dokan Overhead & Operational Costs</td>
                                    <td className="py-3 px-4 font-mono text-red-600 text-right">- ₹{summary.totalOverhead.toLocaleString()}</td>
                                </tr>
                                <tr className={`font-extrabold text-base border-t-2 border-b-2 ${isProfit ? 'bg-emerald-50 text-emerald-950 border-emerald-300' : 'bg-red-50 text-red-950 border-red-300'}`}>
                                    <td className="py-4 px-4 uppercase tracking-wider">Net Profit / (Loss)</td>
                                    <td className={`py-4 px-4 font-mono text-right ${isProfit ? 'text-emerald-700' : 'text-red-700'}`}>
                                        ₹{summary.netProfit.toLocaleString()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Product Profitability Breakdown */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
                    <div className="p-5 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-base font-bold text-gray-900 flex items-center uppercase tracking-wider">
                            <FaBoxes className="mr-2 text-indigo-600" /> Product Performance & Profitability
                        </h2>
                    </div>

                    <div className="p-5 overflow-x-auto">
                        {productPerformance.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-6">No sales recorded for the selected period.</p>
                        ) : (
                            <table className="w-full text-left text-sm min-w-max border rounded-lg overflow-hidden">
                                <thead>
                                    <tr className="bg-gray-100 text-xs font-medium text-gray-900 uppercase">
                                        <th className="py-3 px-4">#</th>
                                        <th className="py-3 px-4">Product Name</th>
                                        <th className="py-3 px-4 text-right">Packets Sold</th>
                                        <th className="py-3 px-4 text-right">Revenue (₹)</th>
                                        <th className="py-3 px-4 text-right">Cost (₹)</th>
                                        <th className="py-3 px-4 text-right">Gross Profit (₹)</th>
                                        <th className="py-3 px-4 text-right">Profit Margin</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {productPerformance.map((p, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 text-xs font-mono text-gray-400">{idx + 1}</td>
                                            <td className="py-3 px-4 font-semibold text-gray-900">{p.product_name}</td>
                                            <td className="py-3 px-4 text-right font-mono text-gray-800">{p.packets_sold} pkts</td>
                                            <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700">₹{p.revenue.toLocaleString()}</td>
                                            <td className="py-3 px-4 text-right font-mono text-gray-600">₹{p.cost.toLocaleString()}</td>
                                            <td className="py-3 px-4 text-right font-mono font-bold text-indigo-600">₹{p.profit.toLocaleString()}</td>
                                            <td className="py-3 px-4 text-right font-mono">
                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${p.margin >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                                    {p.margin}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Overhead Costs Log */}
                {overheadCosts.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h2 className="text-base font-bold text-gray-900 flex items-center uppercase tracking-wider">
                                <FaReceipt className="mr-2 text-red-500" /> Overhead Costs Breakdown
                            </h2>
                            <span className="text-xs font-mono text-red-600 font-bold">Total: ₹{summary.totalOverhead.toLocaleString()}</span>
                        </div>

                        <div className="p-5 overflow-x-auto">
                            <table className="w-full text-left text-sm min-w-max border rounded-lg overflow-hidden">
                                <thead>
                                    <tr className="bg-gray-100 text-xs font-medium text-gray-900 uppercase">
                                        <th className="py-3 px-4">Date</th>
                                        <th className="py-3 px-4">Description</th>
                                        <th className="py-3 px-4 text-right">Amount (₹)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {overheadCosts.map((cost) => (
                                        <tr key={cost.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 font-mono text-xs text-gray-600">{cost.cost_date}</td>
                                            <td className="py-3 px-4 font-medium text-gray-900">{cost.description}</td>
                                            <td className="py-3 px-4 text-right font-mono font-bold text-red-600">₹{cost.amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
