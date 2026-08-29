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
export default function Dashboard({ products, packetSizes = [], summary, filters }) {
    const current_dokan = usePage().props.auth.current_dokan;
    const user = usePage().props.auth.user;
    const isOwner = (user?.role ?? 1) === 1;

    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [packetSizeFilter, setPacketSizeFilter] = useState(filters.packet_size || '');
    const [isEdit, setIdEdit] = useState(false);
    const { data, setData, post, errors, put, delete: deleteProduct } = useForm({
        dokan_id: current_dokan?.id,
        name: '',
        description: '',
        purchased_packets: '',
        packet_size: 1,
        cost_rate: '',
        selling_rate: '',
        reorder_level: 5,
    });

    const performSearch = useCallback(
        debounce((query, pSize) => {
            router.get(
                route('products.index'),
                { search: query, packet_size: pSize },
                { preserveState: true, replace: true }
            );
        }, 500),
        []
    );

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        performSearch(value, packetSizeFilter);
    };

    const handlePacketSizeChange = (e) => {
        const pSize = e.target.value;
        setPacketSizeFilter(pSize);
        router.get(
            route('products.index'),
            { search: search, packet_size: pSize },
            { preserveState: true, replace: true }
        );
    };

    const resetForm = () => {
        setData({
            dokan_id: current_dokan?.id,
            name: '',
            description: '',
            purchased_packets: '',
            packet_size: 1,
            cost_rate: '',
            selling_rate: '',
            reorder_level: 5,
        });
    };

    const saveForm = (e) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                toast.success(isEdit ? 'Product updated successfully' : 'Product added successfully');
                setShowModal(false);
                resetForm();
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
        setIdEdit(true);

        setData({
            dokan_id: current_dokan?.id,
            id: product.id,
            name: product.name,
            description: product.description || '',
            purchased_packets: product.purchased_packets ?? '',
            packet_size: product.packet_size ?? 1,
            cost_rate: product.cost_rate ?? '',
            selling_rate: product.selling_rate ?? '',
            reorder_level: product.reorder_level ?? 5,
        });
        setShowModal(true);
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
            <Head title="Products" />
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
                            label="Purchased Packets"
                            name="purchased_packets"
                            id="purchased_packets"
                            type="number"
                            value={data.purchased_packets}
                            onChange={(e) => setData('purchased_packets', e.target.value)}
                            error={errors.purchased_packets}
                            addClass={'w-full md:w-1/2 md:pr-2'}
                        />

                        <Input
                            label="Packet Size"
                            name="packet_size"
                            id="packet_size"
                            type="number"
                            value={data.packet_size}
                            onChange={(e) => setData('packet_size', e.target.value)}
                            error={errors.packet_size}
                            addClass={'w-full md:w-1/2 md:pl-2'}
                        />

                        {isOwner && (
                            <Input
                                label="Cost Rate (₹)"
                                name="cost_rate"
                                id="cost_rate"
                                type="number"
                                step="0.01"
                                value={data.cost_rate}
                                onChange={(e) => setData('cost_rate', e.target.value)}
                                error={errors.cost_rate}
                                addClass={'w-full md:w-1/3 md:pr-2'}
                            />
                        )}

                        <Input
                            label="Selling Rate (₹)"
                            name="selling_rate"
                            id="selling_rate"
                            type="number"
                            step="0.01"
                            value={data.selling_rate}
                            onChange={(e) => setData('selling_rate', e.target.value)}
                            error={errors.selling_rate}
                            addClass={`w-full ${isOwner ? 'md:w-1/3 md:px-2' : 'md:w-1/2 md:pr-2'}`}
                        />

                        <Input
                            label="Reorder Level"
                            name="reorder_level"
                            id="reorder_level"
                            type="number"
                            value={data.reorder_level}
                            onChange={(e) => setData('reorder_level', e.target.value)}
                            error={errors.reorder_level}
                            addClass={`w-full ${isOwner ? 'md:w-1/3 md:pl-2' : 'md:w-1/2 md:pl-2'}`}
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
                                resetForm();
                            }}>
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton type="submit">Save</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                    <div className="p-4 md:p-6 text-gray-900">
                        <div className="mx-auto max-w-7xl">
                            <div>
                                <div className="p-0 md:p-6 text-gray-900">

                                    <div className="mt-4">
                                        <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-4 md:m-5 font-bold">
                                            Product List
                                        </h2>
                                        <div className='flex flex-col md:flex-row items-center justify-between mb-4 md:mb-2 mx-0 md:mx-5 gap-4'>
                                            <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-2/3">
                                                <Input
                                                    placeholder='Search product name or description...'
                                                    value={search}
                                                    onChange={handleSearchChange}
                                                    addClass={'w-full md:w-1/2'}
                                                />
                                                <select
                                                    value={packetSizeFilter}
                                                    onChange={handlePacketSizeChange}
                                                    className="w-full md:w-auto border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-xs text-sm py-2 px-3 bg-white text-gray-700 font-medium"
                                                >
                                                    <option value="">All Packet Sizes</option>
                                                    {packetSizes.map((size) => (
                                                        <option key={size} value={size}>
                                                            Packet Size: {size} pcs
                                                        </option>
                                                    ))}
                                                </select>
                                                {packetSizeFilter && (
                                                    <button
                                                        onClick={() => handlePacketSizeChange({ target: { value: '' } })}
                                                        className="text-xs text-red-600 hover:text-red-800 font-medium underline"
                                                    >
                                                        Clear Filter
                                                    </button>
                                                )}
                                            </div>
                                            <PrimaryButton onClick={() => { resetForm(); setShowModal(true); setIdEdit(false); }} className='w-full md:w-auto flex items-center justify-center shrink-0'>
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
                                                    <div key={product.id} className={`p-4 rounded-lg border shadow-sm ${product.purchased_packets <= product.reorder_level ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200'}`}>
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div>
                                                                <span className="text-xs font-semibold text-gray-500 block mb-1">#{index + 1}</span>
                                                                <span className="font-bold text-gray-900 text-lg block">{product.name}</span>
                                                                {product.description && (
                                                                    <span className="text-xs text-gray-500 italic block mt-0.5">{product.description}</span>
                                                                )}
                                                            </div>
                                                            <div className="text-right text-sm shrink-0 pl-2">
                                                                <span className="text-emerald-700 font-bold block text-xs">Selling: ₹{product.selling_rate}</span>
                                                                {isOwner && product.cost_rate !== undefined && product.cost_rate !== null && (
                                                                    <span className="text-gray-500 block text-xs">Cost: ₹{product.cost_rate}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex justify-between items-center mb-3">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs text-gray-500">Packets</span>
                                                                <QuantityTicker product={product} />
                                                            </div>
                                                            <div className="flex flex-col items-end text-xs">
                                                                <span className="text-gray-500">Packet Size: <strong>{product.packet_size}</strong></span>
                                                                <span className="text-gray-500">Reorder: <strong>{product.reorder_level}</strong></span>
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
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Name & Description</th>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Purchased Packets</th>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Packet Size</th>
                                                            {isOwner && <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Cost Rate</th>}
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Selling Rate</th>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Reorder Level</th>
                                                            <th className="px-4 py-3 title-font text-center font-medium text-gray-900 text-sm bg-gray-100">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {products.data.map((product, index) => (
                                                            <tr key={product.id} className={`border-b bg-white hover:bg-gray-50 ${product.purchased_packets <= product.reorder_level ? 'bg-red-50 text-red-600' : ''}`}>
                                                                <td className="px-4 py-3">{index + 1}</td>
                                                                <td className="px-4 py-3">
                                                                    <span className="font-semibold text-gray-900 block">{product.name}</span>
                                                                    {product.description && (
                                                                        <span className="text-xs text-gray-500 italic block mt-0.5 max-w-xs truncate" title={product.description}>
                                                                            {product.description}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <QuantityTicker product={product} />
                                                                </td>
                                                                <td className="px-4 py-3">{product.packet_size}</td>
                                                                {isOwner && <td className="px-4 py-3">₹{product.cost_rate}</td>}
                                                                <td className="px-4 py-3 font-bold text-emerald-700">₹{product.selling_rate}</td>
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
                                                    {summary && (
                                                        <tfoot className="bg-gray-100 font-bold border-t-2 border-gray-300 text-sm">
                                                            <tr>
                                                                <td colSpan="2" className="px-4 py-3.5 text-right uppercase text-xs tracking-wider text-gray-700">Total Stock & Valuation:</td>
                                                                <td className="px-4 py-3.5 text-indigo-700 font-mono">
                                                                    {summary.totalPackets} pkts <span className="text-xs text-gray-500 font-normal">({summary.totalPieces} pcs)</span>
                                                                </td>
                                                                <td className="px-4 py-3.5 text-gray-400 font-mono text-xs">-</td>
                                                                {isOwner && summary.totalCostValuation !== null && summary.totalCostValuation !== undefined ? (
                                                                    <td className="px-4 py-3.5 text-amber-700 font-mono">₹{summary.totalCostValuation.toLocaleString()}</td>
                                                                ) : isOwner ? (
                                                                    <td className="px-4 py-3.5 text-gray-400 font-mono text-xs">-</td>
                                                                ) : null}
                                                                <td className="px-4 py-3.5 text-emerald-700 font-mono">₹{summary.totalSellingValuation.toLocaleString()}</td>
                                                                <td colSpan="2" className="px-4 py-3.5"></td>
                                                            </tr>
                                                        </tfoot>
                                                    )}
                                                </table>
                                            </div>
                                        </div>

                                        <div className="flex justify-center mt-4">
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
