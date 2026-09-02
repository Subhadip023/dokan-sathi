import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import Input from '@/Components/Input';
import Pagination from '@/Components/Pagination';
import { FaRegEdit, FaPhoneAlt, FaBuilding, FaEnvelope, FaUserCheck, FaTruck, FaMapMarkerAlt, FaUserPlus } from 'react-icons/fa';
import { MdDeleteOutline } from 'react-icons/md';
import debounce from 'lodash/debounce';

export default function SupplierIndex({ suppliers, filters }) {
    const current_dokan = usePage().props.auth.current_dokan;
    const user = usePage().props.auth.user;
    const isOwner = (user?.role ?? 1) === 1;

    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [isEdit, setIsEdit] = useState(false);

    const { data, setData, post, errors, put, delete: deleteSupplier, reset } = useForm({
        id: null,
        dokan_id: current_dokan?.id,
        name: '',
        company_name: '',
        phone: '',
        email: '',
        address: '',
    });

    const performSearch = useCallback(
        debounce((query) => {
            router.get(
                route('suppliers.index'),
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

    const resetForm = () => {
        reset();
        setData({
            id: null,
            dokan_id: current_dokan?.id,
            name: '',
            company_name: '',
            phone: '',
            email: '',
            address: '',
        });
    };

    const openAddModal = () => {
        resetForm();
        setIsEdit(false);
        setShowModal(true);
    };

    const openEditModal = (supplier) => {
        setIsEdit(true);
        setData({
            id: supplier.id,
            dokan_id: current_dokan?.id,
            name: supplier.name || '',
            company_name: supplier.company_name || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
            address: supplier.address || '',
        });
        setShowModal(true);
    };

    const saveForm = (e) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                toast.success(isEdit ? 'Supplier updated successfully' : 'Supplier added successfully');
                setShowModal(false);
                resetForm();
            },
            onError: () => {
                toast.error(isEdit ? 'Failed to update supplier' : 'Failed to add supplier');
            }
        };

        if (isEdit) {
            put(route('suppliers.update', data.id), options);
        } else {
            post(route('suppliers.store'), options);
        }
    };

    const handleDeleteSupplier = (id, name) => {
        if (!confirm(`Are you sure you want to delete supplier "${name}"?`)) {
            return;
        }

        deleteSupplier(route('suppliers.destroy', id), {
            onSuccess: () => {
                toast.success('Supplier deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete supplier');
            }
        });
    };

    return (
        <AuthenticatedLayout header="Suppliers">
            <Head title="Suppliers" />

            {/* Modal for Add / Edit Supplier */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <div className="p-6 text-gray-900">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2 flex items-center">
                        <FaTruck className="mr-2 text-indigo-600" />
                        {isEdit ? 'Edit Supplier' : 'Add New Supplier'}
                    </h2>
                    <form className="flex flex-col gap-y-4" onSubmit={saveForm}>
                        <Input
                            label="Supplier Contact Person Name"
                            name="name"
                            id="name"
                            type="text"
                            placeholder="Enter supplier / contact name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                            addClass="w-full"
                            required
                        />

                        <Input
                            label="Company / Vendor Name (Optional)"
                            name="company_name"
                            id="company_name"
                            type="text"
                            placeholder="Enter company or agency name"
                            value={data.company_name}
                            onChange={(e) => setData('company_name', e.target.value)}
                            error={errors.company_name}
                            addClass="w-full"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Phone Number (Optional)"
                                name="phone"
                                id="phone"
                                type="text"
                                placeholder="Enter phone number"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                error={errors.phone}
                                addClass="w-full"
                            />

                            <Input
                                label="Email Address (Optional)"
                                name="email"
                                id="email"
                                type="email"
                                placeholder="Enter email address"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                error={errors.email}
                                addClass="w-full"
                            />
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                Office / Warehouse Address (Optional)
                            </label>
                            <textarea
                                id="address"
                                name="address"
                                rows={3}
                                className="w-full rounded-md border-gray-300 text-sm shadow-xs focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Enter supplier address..."
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                            />
                            {errors.address && (
                                <p className="text-xs text-red-600 mt-1">{errors.address}</p>
                            )}
                        </div>

                        <div className="w-full mt-4 flex items-center justify-end gap-x-3">
                            <SecondaryButton
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                            >
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton type="submit">
                                {isEdit ? 'Update Supplier' : 'Save Supplier'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            <div className="mx-auto w-full sm:px-6 lg:px-8">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                    <div className="p-4 md:p-6 text-gray-900">
                        <div className="mx-auto w-full">
                            <div className="mt-2">
                                <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-4 md:m-5 font-bold flex items-center">
                                    <FaTruck className="mr-3 text-indigo-600" /> Supplier Management
                                </h2>

                                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between mb-6 mx-0 md:mx-5 gap-4">
                                    <Input
                                        placeholder="Search by supplier, company, phone, email, or address..."
                                        value={search}
                                        onChange={handleSearchChange}
                                        addClass="w-full md:w-1/2"
                                    />
                                    <PrimaryButton
                                        onClick={openAddModal}
                                        className="w-full md:w-auto flex items-center justify-center py-2.5"
                                    >
                                        <FaUserPlus className="mr-2 h-4 w-4" />
                                        Add Supplier
                                    </PrimaryButton>
                                </div>
                            </div>

                            <section className="text-gray-600 body-font">
                                <div className="container py-2 mx-auto">
                                    {suppliers.data.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300 mx-0 md:mx-5">
                                            <FaTruck className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                            <h3 className="text-lg font-medium text-gray-900">No Suppliers Found</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {search
                                                    ? 'No suppliers match your search criteria.'
                                                    : 'Add vendor & supplier details to manage product inventory sources.'}
                                            </p>
                                            {!search && (
                                                <div className="mt-4">
                                                    <PrimaryButton onClick={openAddModal}>
                                                        <FaUserPlus className="mr-2 h-4 w-4" />
                                                        Add First Supplier
                                                    </PrimaryButton>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            {/* Mobile View (Cards) */}
                                            <div className="block md:hidden space-y-4">
                                                {suppliers.data.map((supplier) => (
                                                    <div
                                                        key={supplier.id}
                                                        className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                                                    >
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base">
                                                                    {supplier.name ? supplier.name.charAt(0).toUpperCase() : 'S'}
                                                                </div>
                                                                <div>
                                                                    <span className="font-bold text-gray-900 text-lg block">
                                                                        {supplier.name}
                                                                    </span>
                                                                    {supplier.company_name && (
                                                                        <span className="inline-flex items-center text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md mt-0.5">
                                                                            <FaBuilding className="mr-1 text-indigo-500" size={10} />
                                                                            {supplier.company_name}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1.5 text-xs text-gray-600 mb-3 border-t border-b border-gray-100 py-2">
                                                            <div className="flex flex-col gap-y-1">
                                                                <div className="flex items-center">
                                                                    <FaPhoneAlt className="mr-2 text-gray-400 shrink-0" size={12} />
                                                                    {supplier.phone ? (
                                                                        <span className="font-medium text-gray-800 font-mono">{supplier.phone}</span>
                                                                    ) : (
                                                                        <span className="italic text-gray-400">No phone</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <FaEnvelope className="mr-2 text-gray-400 shrink-0" size={12} />
                                                                    {supplier.email ? (
                                                                        <span className="font-medium text-gray-800">{supplier.email}</span>
                                                                    ) : (
                                                                        <span className="italic text-gray-400">No email</span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {supplier.address && (
                                                                <div className="flex items-start text-xs border-t border-gray-100 pt-2 text-gray-600">
                                                                    <FaMapMarkerAlt className="mr-1.5 text-gray-400 mt-0.5 shrink-0" size={11} />
                                                                    <span>{supplier.address}</span>
                                                                </div>
                                                            )}

                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-500 pt-1 gap-1 border-t border-gray-100">
                                                                <div className="flex items-center">
                                                                    <FaUserCheck className="mr-1 text-indigo-500" size={11} />
                                                                    Added by: <strong className="ml-1 text-gray-700">{supplier.added_by ? supplier.added_by.name : 'Store Owner'}</strong>
                                                                </div>
                                                                {supplier.edited_by && (
                                                                    <div className="flex items-center">
                                                                        <FaRegEdit className="mr-1 text-amber-600" size={11} />
                                                                        Edited by: <strong className="ml-1 text-gray-700">{supplier.edited_by.name}</strong>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-between items-center pt-2">
                                                            <span className="text-[11px] text-gray-400">
                                                                {new Date(supplier.created_at).toLocaleDateString()}
                                                            </span>
                                                            <div className="flex items-center gap-x-3">
                                                                <button
                                                                    onClick={() => openEditModal(supplier)}
                                                                    className="text-blue-600 hover:text-blue-800 transition-colors flex items-center text-xs font-semibold"
                                                                >
                                                                    <FaRegEdit size={14} className="mr-1" /> Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteSupplier(supplier.id, supplier.name)}
                                                                    className="text-red-600 hover:text-red-800 transition-colors flex items-center text-xs font-semibold"
                                                                >
                                                                    <MdDeleteOutline size={16} className="mr-1" /> Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Desktop View (Table) */}
                                            <div className="hidden md:block overflow-x-auto mx-5">
                                                <table className="table-auto w-full text-left whitespace-nowrap min-w-max border rounded-lg overflow-hidden">
                                                    <thead>
                                                        <tr>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100 w-12">#</th>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Supplier & Company</th>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Phone & Email</th>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Address</th>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Added By</th>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Last Edited By</th>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Date Added</th>
                                                            <th className="px-4 py-3 title-font text-center font-medium text-gray-900 text-sm bg-gray-100 w-28">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {suppliers.data.map((supplier, index) => (
                                                            <tr key={supplier.id} className="border-b bg-white hover:bg-gray-50 transition-colors">
                                                                <td className="px-4 py-3 text-gray-500 font-mono text-sm">{index + 1}</td>
                                                                <td className="px-4 py-3 font-semibold text-gray-900">
                                                                    <div className="flex items-center">
                                                                        <div className="h-9 w-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm mr-3 border border-indigo-100 shrink-0">
                                                                            {supplier.name ? supplier.name.charAt(0).toUpperCase() : 'S'}
                                                                        </div>
                                                                        <div>
                                                                            <span className="block text-sm font-bold text-gray-900">{supplier.name}</span>
                                                                            {supplier.company_name ? (
                                                                                <span className="inline-flex items-center text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded mt-0.5">
                                                                                    <FaBuilding className="mr-1 text-indigo-500" size={10} />
                                                                                    {supplier.company_name}
                                                                                </span>
                                                                            ) : (
                                                                                <span className="text-[11px] text-gray-400 italic">No company name</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-700 text-xs">
                                                                    <div className="flex flex-col space-y-1">
                                                                        {supplier.phone ? (
                                                                            <span className="inline-flex items-center font-mono">
                                                                                <FaPhoneAlt className="mr-1.5 text-gray-400 shrink-0" size={12} />
                                                                                {supplier.phone}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="inline-flex items-center text-gray-400 italic">
                                                                                <FaPhoneAlt className="mr-1.5 text-gray-300 shrink-0" size={12} /> N/A
                                                                            </span>
                                                                        )}
                                                                        {supplier.email ? (
                                                                            <span className="inline-flex items-center">
                                                                                <FaEnvelope className="mr-1.5 text-gray-400 shrink-0" size={12} />
                                                                                {supplier.email}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="inline-flex items-center text-gray-400 italic">
                                                                                <FaEnvelope className="mr-1.5 text-gray-300 shrink-0" size={12} /> N/A
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-700 text-xs max-w-xs truncate">
                                                                    {supplier.address ? (
                                                                        <span className="inline-flex items-center" title={supplier.address}>
                                                                            <FaMapMarkerAlt className="mr-1 text-gray-400 shrink-0" size={11} />
                                                                            <span className="truncate">{supplier.address}</span>
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-gray-400 italic">N/A</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-700 text-xs">
                                                                    <span className="inline-flex items-center font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs">
                                                                        <FaUserCheck className="mr-1.5 text-indigo-500" size={11} />
                                                                        {supplier.added_by ? supplier.added_by.name : 'Store Owner'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-700 text-xs">
                                                                    {supplier.edited_by ? (
                                                                        <span className="inline-flex items-center font-medium bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full text-xs border border-amber-200">
                                                                            <FaRegEdit className="mr-1.5 text-amber-600" size={11} />
                                                                            {supplier.edited_by.name}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-gray-400 italic text-xs">N/A</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-500 text-xs font-mono">
                                                                    {new Date(supplier.created_at).toLocaleDateString()}
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <div className="flex items-center justify-center space-x-3">
                                                                        <button
                                                                            onClick={() => openEditModal(supplier)}
                                                                            className="text-blue-600 hover:text-blue-800 hover:scale-110 transition-all duration-200"
                                                                            title="Edit Supplier"
                                                                        >
                                                                            <FaRegEdit size={18} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteSupplier(supplier.id, supplier.name)}
                                                                            className="text-red-600 hover:text-red-800 hover:scale-110 transition-all duration-200"
                                                                            title="Delete Supplier"
                                                                        >
                                                                            <MdDeleteOutline size={20} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </>
                                    )}

                                    <div className="flex justify-center mt-6">
                                        <Pagination links={suppliers.links} />
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
