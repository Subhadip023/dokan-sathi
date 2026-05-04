import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';

export default function Dashboard({ totalProducts, lowStock, totalValue, lowStockProducts }) {
    const { auth } = usePage().props;
    return (
        <AuthenticatedLayout header={'Dashboard'} >
            <Head title="Dashboard" />
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">

                    <div className="p-4 md:p-6 text-gray-900 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className='bg-gray-100 shadow-sm w-full md:w-1/3 p-4 h-auto md:h-32 rounded-lg text-center flex flex-col justify-center'>
                            <h2 className='text-2xl md:text-4xl font-serif font-bold'>Product</h2>
                            <p className='mt-2 md:mt-5 font-serif text-xl md:text-2xl'>{totalProducts} units</p>
                        </div>
                        <div className={`bg-gray-100 shadow-sm w-full md:w-1/3 p-4 h-auto md:h-32 rounded-lg text-center flex flex-col justify-center ${lowStock > 0 ? 'bg-red-50 border border-red-200' : ''}`} >
                            <h2 className={`text-2xl md:text-4xl font-serif font-bold`}>Low Stock</h2>
                            <p className='mt-2 md:mt-5 font-serif text-xl md:text-2xl'>{lowStock} units</p>
                        </div>
                        <div className='bg-gray-100 shadow-sm w-full md:w-1/3 p-4 h-auto md:h-32 rounded-lg text-center flex flex-col justify-center'>
                            <h2 className='text-2xl md:text-4xl font-serif font-bold'>Total Value</h2>
                            <p className='mt-2 md:mt-5 font-serif text-xl md:text-2xl'>₹{totalValue}</p>
                        </div>
                    </div>


                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-4 md:p-6 text-gray-900">
                                <div className="mx-auto max-w-7xl">
                                    <div className="">
                                        <div className="p-0 md:p-6 text-gray-900">

                                            <div className="mt-4">
                                                <h2 className={`text-2xl md:text-3xl font-serif text-gray-900 my-5 font-bold`}>
                                                    Low Stock Products
                                                </h2>

                                            </div>
                                            <section className="text-gray-600 body-font">

                                                <div className="container py-5 mx-auto overflow-x-auto">
                                                    <table className="table-auto w-full text-left whitespace-nowrap min-w-max">
                                                        <thead>
                                                            <tr>
                                                                <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100 rounded-tl rounded-bl">#</th>
                                                                <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Name</th>
                                                                <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Price</th>
                                                                <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Quantity</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {lowStockProducts.map((product, index) => (
                                                                <tr key={product.id} className={`border-b bg-white hover:bg-gray-100 ${product.quantity <= product.reorder_level ? 'bg-red-100 text-red-500' : ''}`}>
                                                                    <td className="px-4 py-3">{index + 1}</td>
                                                                    <td className="px-4 py-3">{product.name}</td>
                                                                    <td className="px-4 py-3">{product.price}</td>
                                                                    <td className="px-4 py-3">{product.quantity}</td>

                                                                </tr>
                                                            ))}


                                                        </tbody>
                                                    </table>
                                                </div>

                                            </section>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
