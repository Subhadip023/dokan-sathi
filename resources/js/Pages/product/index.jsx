import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { toast } from 'react-hot-toast';
import PrimaryButton from '@/Components/PrimaryButton';
import Modal from '@/Components/Modal';
import { useState, useCallback } from 'react';
import Input from '@/Components/Input';
import { useForm, usePage } from '@inertiajs/react';
import SecondaryButton from '@/Components/SecondaryButton';
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import QuantityTicker from '@/Components/QuantityTicker';
import Pagination from '@/Components/Pagination';
import debounce from 'lodash/debounce';
export default function Dashboard({ products, filters }) {
    const current_dokan = usePage().props.auth.current_dokan;

    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [isEdit, setIdEdit] = useState(false);
    const { data, setData, post, errors, put, delete: deleteProduct } = useForm({
        dokan_id: current_dokan?.id,
        name: '',
        price: '',
        quantity: 1,
        description: '',
        reorder_level: 5,
    });

    const performSearch = useCallback(
        debounce((query) => {
            router.get(
                route('products.index'),
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

    const saveForm = (e) => {
        e.preventDefault();
        console.log(data)
        const options = {
            onSuccess: () => {
                toast.success(isEdit ? 'Product updated successfully' : 'Product added successfully');
                setShowModal(false);
                setData({
                    name: '',
                    price: '',
                    quantity: ''
                });
            },
            onError: (error) => {
                console.log(error);
                toast.error(isEdit ? 'Failed to update product' : 'Failed to add product');
            }
        };
        if (isEdit) {
            put(route('products.update', data.id), options);
            return;
        }
        post(route('products.store'), options);
    };

    const editProduct = (product) => {
        setIdEdit(true)

        setData({
            dokan_id: current_dokan?.id,
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: parseInt(product.quantity) || 1,
            description: product.description,
            reorder_level: parseInt(product.reorder_level) || 5,
        });
        setShowModal(true)
    };

    const deleteProductfunc = (id) => {
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }
        deleteProduct(route('products.destroy', id), {
            onSuccess: () => {
                toast.success('Product deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete product');
            }
        })

    };
    return (
        <AuthenticatedLayout
            header={`Products`}
        >
            <Head title="Dashboard" />
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <div className="p-6 text-gray-900">
                    <h2 className="text-lg font-medium text-gray-900">
                        {isEdit ? `Edit Product` : `Add Product`}
                    </h2>
                    <form className="mt-4 flex flex-wrap justify-between items-center gap-y-4" onSubmit={saveForm}>
                        <Input
                            label="Name"
                            name="name"
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                            addClass={'w-full'}
                        />

                        <Input
                            label="Price"
                            name="price"
                            id="price"
                            type="number"
                            value={data.price}
                            onChange={(e) => setData('price', e.target.value)}
                            error={errors.price}
                            addClass={'w-full md:w-1/3 md:pr-2'}
                        />
                        <Input
                            label="Quantity"
                            name="quantity"
                            id="quantity"
                            type="number"
                            value={parseInt(data.quantity) || ''}
                            onChange={(e) => setData('quantity', parseInt(e.target.value) || '')}
                            error={errors.quantity}
                            addClass={'w-full md:w-1/3 md:px-2 mt-4 md:mt-0'}
                        />
                        <Input
                            label="Reorder Level"
                            name="reorder_level"
                            id="reorder_level"
                            type="number"
                            value={parseInt(data.reorder_level) || ''}
                            onChange={(e) => setData('reorder_level', parseInt(e.target.value) || '')}
                            error={errors.reorder_level}
                            addClass={'w-full md:w-1/3 md:pl-2 mt-4 md:mt-0'}
                        />

                        <div className="w-full">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={3}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                        </div>

                        <div className="w-full mb-4 items-end flex justify-end">

                            <SecondaryButton className='mr-3' onClick={() => {
                                setShowModal(false);
                                setData({
                                    dokan_id: current_dokan?.id,
                                    name: "",
                                    price: "",
                                    quantity: 1,
                                    description: "",
                                    reorder_level: 5,
                                })
                            }} >
                                cancel
                            </SecondaryButton>
                            <PrimaryButton className='' type="submit">Save</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900">
                        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                            <div className="">
                                <div className="p-6 text-gray-900">

                                    <div className="mt-4">
                                        <h2 className="text-3xl font-serif text-gray-900 m-5">
                                            Product List
                                        </h2>
                                        <div className='flex flex-col md:flex-row items-end justify-between mb-4 md:mb-2 mx-0 md:mx-5 gap-4'>
                                            <Input
                                                placeholder='Search...'
                                                value={search}
                                                onChange={handleSearchChange}
                                                addClass={'w-full md:w-1/2'}
                                            />
                                            <PrimaryButton onClick={() => { setShowModal(true); setIdEdit(false); }} className='w-full md:w-auto flex items-center justify-center'>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-1">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                </svg>
                                                Add Product
                                            </PrimaryButton>
                                        </div>
                                    </div>
                                    <section className="text-gray-600 body-font">
                                        <div className="container py-5 mx-auto">
                                            
                                            {/* Mobile View (Cards) */}
                                            <div className="block md:hidden space-y-4">
                                                {products.data.map((product, index) => (
                                                    <div key={product.id} className={`p-4 rounded-lg border shadow-sm ${product.quantity <= product.reorder_level ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200'}`}>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <span className="text-xs font-semibold text-gray-500 block mb-1">#{index + 1}</span>
                                                                <span className="font-bold text-gray-900 text-lg">{product.name}</span>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="font-bold text-gray-900 block">{product.price}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</div>
                                                        
                                                        <div className="flex justify-between items-center mb-3">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs text-gray-500">Quantity</span>
                                                                <QuantityTicker product={product} />
                                                            </div>
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-xs text-gray-500">Reorder</span>
                                                                <span className="font-semibold">{product.reorder_level}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-end gap-x-4 pt-3 border-t border-gray-100">
                                                            <button onClick={() => editProduct(product)} className='text-blue-600 hover:text-blue-800 transition-colors'>
                                                                <FaRegEdit size={20} />
                                                            </button>
                                                            <button onClick={() => deleteProductfunc(product.id)} className='text-red-600 hover:text-red-800 transition-colors'>
                                                                <MdDeleteOutline size={20} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Desktop View (Table) */}
                                            <div className="hidden md:block overflow-x-auto">
                                                <table className="table-auto w-full text-left whitespace-nowrap min-w-max border rounded-lg overflow-hidden">
                                                    <thead>
                                                        <tr>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">#</th>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Name</th>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Description</th>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Price</th>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Quantity</th>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Reorder Level</th>
                                                            <th className="px-4 py-3 title-font text-center font-medium text-gray-900 text-sm bg-gray-100">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {products.data.map((product, index) => (
                                                            <tr key={product.id} className={`border-b bg-white hover:bg-gray-50 ${product.quantity <= product.reorder_level ? 'bg-red-50 text-red-600' : ''}`}>
                                                                <td className="px-4 py-3">{index + 1}</td>
                                                                <td className="px-4 py-3">{product.name}</td>
                                                                <td className="px-4 py-3 max-w-xs truncate" title={product.description}>{product.description}</td>
                                                                <td className="px-4 py-3">{product.price}</td>
                                                                <td className="px-4 py-3">
                                                                    <QuantityTicker product={product} />
                                                                </td>
                                                                <td className="px-4 py-3">{product.reorder_level}</td>
                                                                <td className="px-4 py-3 flex items-center justify-center gap-x-2">
                                                                    <button onClick={() => editProduct(product)} className='mr-2 text-blue-600 hover:scale-110 transition-all duration-200 ease-in-out'>
                                                                        <FaRegEdit size={18} />
                                                                    </button>

                                                                    <button onClick={() => deleteProductfunc(product.id)} className='text-red-600 hover:text-red-800 hover:scale-105 transition-all duration-200 ease-in-out'>
                                                                        <MdDeleteOutline size={18} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div className="flex justify-center">
                                            <Pagination links={products.links} />
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>);
}
