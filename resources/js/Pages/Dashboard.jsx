import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ totalProducts, lowStock, totalValue, lowStockProducts }) {
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


                    <div className="mt-8 px-4 md:px-6">
                        <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-4 font-bold">
                            Low Stock Products
                        </h2>
                    </div>
                    <section className="text-gray-600 body-font px-4 md:px-6">
                        <div className="container py-2 pb-5 mx-auto overflow-x-auto">
                            <table className="table-auto w-full text-left whitespace-nowrap min-w-max border border-gray-200 rounded-lg">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100 rounded-tl rounded-bl">#</th>
                                        <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Name</th>
                                        <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Cost Rate</th>
                                        <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Selling Rate</th>
                                        <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100 rounded-tr rounded-br">Packets</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lowStockProducts.map((product, index) => (
                                        <tr key={product.id} className={`border-b bg-white hover:bg-gray-100 ${product.purchased_packets <= product.reorder_level ? 'bg-red-100 text-red-500' : ''}`}>
                                            <td className="px-4 py-3">{index + 1}</td>
                                            <td className="px-4 py-3">{product.name}</td>
                                            <td className="px-4 py-3">₹{product.cost_rate}</td>
                                            <td className="px-4 py-3">₹{product.selling_rate}</td>
                                            <td className="px-4 py-3">{product.purchased_packets}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
