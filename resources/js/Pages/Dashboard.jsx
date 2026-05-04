import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
export default function Dashboard({ totalProducts, lowStock, totalValue, lowStockProducts }) {
    const { auth } = usePage().props;

    const user = auth.user;
    const current_dokan = auth.current_dokan;

    console.log(lowStockProducts);
    return (
        <AuthenticatedLayout header={'Dashboard'} >
            <Head title="Dashboard" />
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">

                    <div className="p-6 text-gray-900 flex items-center justify-end ">
                        <div className=' bg-gray-100 shadow-sm w-1/3 px-2 mx-5 h-32 rounded-lg text-center py-5'>
                            <h2 className='text-4xl font-serif font-bold'>Product</h2>
                            <p className='mt-5 font-serif text-2xl'>{totalProducts} units</p>
                        </div>
                        <div className={` bg-gray-100 shadow-sm w-1/3 px-2 mx-5 h-32 rounded-lg text-center py-5 ${lowStock > 0 ? 'bg-red-50 border border-red-200' : ''}`} >
                            <h2 className={`text-4xl font-serif font-bold`}>Low Stock</h2>
                            <p className='mt-5 font-serif text-2xl'>{lowStock} units</p>
                        </div>
                        <div className=' bg-gray-100 shadow-sm w-1/3 px-2 mx-5 h-32 rounded-lg text-center py-5'>
                            <h2 className='text-4xl font-serif font-bold'>Total Value</h2>
                            <p className='mt-5 font-serif text-2xl'>₹{totalValue}</p>
                        </div>
                    </div>


                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900">
                                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                                    <div className="">
                                        <div className="p-6 text-gray-900">

                                            <div className="mt-4">
                                                <h2 className={`text-3xl font-serif text-gray-900 m-5 font-bold `}>
                                                    Low Stock Products
                                                </h2>
                                                
                                            </div>
                                            <section class="text-gray-600 body-font">

                                                <div class="container px-5 py-5 mx-auto">
                                                    <table class="table-auto w-full text-left whitespace-no-wrap">
                                                        <thead>
                                                            <tr>
                                                                <th class="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100 rounded-tl rounded-bl">#</th>
                                                                <th class="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Name</th>
                                                                <th class="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Price</th>
                                                                <th class="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Quantity</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {lowStockProducts.map((product, index) => (
                                                                <tr key={product.id} className={`border-b  bg-white hover:bg-gray-100 ${product.quantity <= product.reorder_level ? 'bg-red-100 text-red-500' : ''}`}>
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
