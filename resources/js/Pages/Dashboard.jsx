import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import SalesGraph from '@/Components/SalesGraph';

export default function Dashboard({ totalProducts, lowStock, totalValue, lowStockProducts = [], salesChartData = {} }) {
    const user = usePage().props.auth.user;
    const isOwner = (user?.role ?? 1) === 1;

    return (
        <AuthenticatedLayout header={'Dashboard'} >
            <Head title="Dashboard" />
            <div className="mx-auto w-full sm:px-6 lg:px-8">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">

                    <div className=" p-4 md:p-6 text-gray-900 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className={`bg-gray-100 shadow-sm w-full md:w-1/3 p-4 h-auto md:h-32 rounded-lg text-center flex flex-col justify-center ${lowStock > 0 ? 'bg-red-50 border border-red-200 hover:shadow-lg hover:shadow-red-300 transition duration-300' : ''} hover:shadow-lg hover:shadow-gray-300 transition duration-300`} >
                            <h2 className={`text-2xl md:text-4xl font-serif font-bold`}>Low Stock</h2>
                            <p className='mt-2 md:mt-5 font-serif text-xl md:text-2xl'>{lowStock}</p>
                        </div>
                        <Link href={route('products.index')} className='hover:shadow-lg hover:shadow-gray-300 transition duration-300 bg-gray-100 shadow-sm w-full md:w-1/3 p-4 h-auto md:h-32 rounded-lg text-center flex flex-col justify-center'>
                            <h2 className='text-2xl md:text-4xl font-serif font-bold '>Product</h2>
                            <p className='mt-2 md:mt-5 font-serif text-xl md:text-2xl'>{totalProducts}</p>
                        </Link>
                        <div className='bg-gray-100 shadow-sm w-full md:w-1/3 p-4 h-auto md:h-32 rounded-lg text-center flex flex-col justify-center '>
                            <h2 className='text-2xl md:text-4xl font-serif font-bold'>Total Value</h2>
                            <p className='mt-2 md:mt-5 font-serif text-xl md:text-2xl'>
                                ₹{Number(totalValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    {/* Sales Performance Graph */}
                    <div className="px-4 md:px-6 pt-2">
                        <SalesGraph salesChartData={salesChartData} isOwner={isOwner} />
                    </div>

                    <div className="mt-8 px-4 md:px-6">
                        <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-4 font-bold">
                            Low Stock Products
                        </h2>
                    </div>
                    <section className="text-gray-600 body-font px-4 md:px-6">
                        <div className="container py-2 pb-5 mx-auto">
                            {/* Mobile View (Cards) */}
                            <div className="block md:hidden space-y-3">
                                {lowStockProducts && lowStockProducts.length > 0 ? (
                                    lowStockProducts.map((product, index) => (
                                        <div
                                            key={product.id}
                                            className={`p-4 rounded-lg border shadow-xs ${
                                                product.purchased_packets <= product.reorder_level
                                                    ? 'bg-red-50/70 border-red-200'
                                                    : 'bg-white border-gray-200'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="min-w-0 pr-2">
                                                    <span className="text-[11px] font-semibold text-gray-400 block">#{index + 1}</span>
                                                    <span className="font-bold text-gray-900 text-base block">{product.name}</span>
                                                    {product.description && (
                                                        <span className="text-xs text-gray-500 italic block mt-0.5">{product.description}</span>
                                                    )}
                                                </div>
                                                <div className="text-right text-xs shrink-0 pl-2">
                                                    <span className="text-emerald-700 font-bold block">Selling: ₹{product.selling_rate}</span>
                                                    {isOwner && product.cost_rate !== undefined && product.cost_rate !== null && (
                                                        <span className="text-gray-500 block text-[11px] mt-0.5">Cost: ₹{product.cost_rate}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-xs">
                                                <div className="flex items-center space-x-1.5">
                                                    <span className="text-gray-500">Stock:</span>
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                                                        {product.purchased_packets} pkts
                                                    </span>
                                                </div>
                                                {product.reorder_level !== undefined && (
                                                    <span className="text-gray-500 text-[11px]">
                                                        Reorder: <strong>{product.reorder_level}</strong>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-6 text-center text-gray-500 bg-white rounded-lg border border-gray-200">
                                        No low stock products found.
                                    </div>
                                )}
                            </div>

                            {/* Desktop View (Table) */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="table-auto w-full text-left whitespace-nowrap min-w-max border border-gray-200 rounded-lg">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100 rounded-tl rounded-bl">#</th>
                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Name & Description</th>
                                            {isOwner && <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Cost Rate</th>}
                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Selling Rate</th>
                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100 rounded-tr rounded-br">Packets</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lowStockProducts && lowStockProducts.length > 0 ? (
                                            lowStockProducts.map((product, index) => (
                                                <tr key={product.id} className={`border-b bg-white hover:bg-gray-100 ${product.purchased_packets <= product.reorder_level ? 'bg-red-50 text-red-600' : ''}`}>
                                                    <td className="px-4 py-3">{index + 1}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="font-semibold text-gray-900 block">{product.name}</span>
                                                        {product.description && (
                                                            <span className="text-xs text-gray-500 italic block mt-0.5 max-w-xs truncate" title={product.description}>
                                                                {product.description}
                                                            </span>
                                                        )}
                                                    </td>
                                                    {isOwner && <td className="px-4 py-3">₹{product.cost_rate}</td>}
                                                    <td className="px-4 py-3">₹{product.selling_rate}</td>
                                                    <td className="px-4 py-3">{product.purchased_packets}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={isOwner ? 5 : 4} className="px-4 py-6 text-center text-gray-500">
                                                    No low stock products found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
