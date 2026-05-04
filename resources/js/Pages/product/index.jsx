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
                            addClass={'w-1/3 pr-2'}
                        />
                        <Input
                            label="Quantity"
                            name="quantity"
                            id="quantity"
                            type="number"
                            value={parseInt(data.quantity) || ''}
                            onChange={(e) => setData('quantity', parseInt(e.target.value) || '')}
                            error={errors.quantity}
                            addClass={'w-1/3 pl-2'}
                        />
                        <Input
                            label="Reorder Level"
                            name="reorder_level"
                            id="reorder_level"
                            type="number"
                            value={parseInt(data.reorder_level) || ''}
                            onChange={(e) => setData('reorder_level', parseInt(e.target.value) || '')}
                            error={errors.reorder_level}
                            addClass={'w-1/3 pl-5'}
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
                                        <div className='flex items-end justify-between mb-2 mx-5'>
                                            <Input
                                                placeholder='Search...'
                                                value={search}
                                                onChange={handleSearchChange}
                                                addClass={'w-full md:w-1/2 pr-2 '}
                                            />
                                            <PrimaryButton onClick={() => { setShowModal(true); setIdEdit(false); }} className='ml-2 flex items-center'>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                </svg>
                                                Add Product
                                            </PrimaryButton>
                                        </div>
                                    </div>
                                    <section class="text-gray-600 body-font">

                                        <div class="container px-5 py-5 mx-auto">
                                            <table class="table-auto w-full text-left whitespace-no-wrap">
                                                <thead>
                                                    <tr>
                                                        <th class="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100 rounded-tl rounded-bl">#</th>
                                                        <th class="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Name</th>
                                                        <th class="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Description</th>
                                                        <th class="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Price</th>
                                                        <th class="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Quantity</th>
                                                        <th class="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Reorder Level</th>
                                                        <th class="px-4 py-3  title-font text-center font-medium text-gray-900 text-sm bg-gray-100 rounded-tr rounded-br">actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {products.data.map((product, index) => (
                                                        <tr key={product.id} className={`border-b  bg-white hover:bg-gray-100 ${product.quantity <= product.reorder_level ? 'bg-red-100 text-red-500' : ''}`}>
                                                            <td className="px-4 py-3">{index + 1}</td>
                                                            <td className="px-4 py-3">{product.name}</td>
                                                            <td className="px-4 py-3">{product.description}</td>
                                                            <td className="px-4 py-3">{product.price}</td>
                                                            <td className="px-4 py-3">
                                                                <QuantityTicker product={product} />

                                                            </td>
                                                            <td className="px-4 py-3">{product.reorder_level}</td>
                                                            <td className="px-4 py-3 flex items-center justify-center gap-x-2">
                                                                <button onClick={() => editProduct(product)} className='mr-2 text-blue-600 hover:scale-110 transition-all duration-200 ease-in-out'>
                                                                    <FaRegEdit size={18} />
                                                                </button>

                                                                <button onClick={() => deleteProductfunc(product.id)} className='text-red-600 hover:text-red-800 ho
                                                                        scale-105 transition-all duration-200 ease-in-out'>
                                                                    <MdDeleteOutline size={18} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}


                                                </tbody>
                                            </table>
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
