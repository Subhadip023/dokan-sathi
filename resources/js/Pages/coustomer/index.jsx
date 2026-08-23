import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import Input from '@/Components/Input';
import Pagination from '@/Components/Pagination';
import { FaRegEdit, FaUserPlus, FaPhoneAlt, FaUser } from 'react-icons/fa';
import { MdDeleteOutline } from 'react-icons/md';
import debounce from 'lodash/debounce';

export default function CustomerIndex({ coustomers, filters }) {
    const current_dokan = usePage().props.auth.current_dokan;

    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [isEdit, setIsEdit] = useState(false);

    const { data, setData, post, errors, put, delete: deleteCustomer, reset } = useForm({
        id: null,
        dokan_id: current_dokan?.id,
        name: '',
        phone: '',
    });

    const performSearch = useCallback(
        debounce((query) => {
            router.get(
                route('coustomers.index'),
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
            phone: '',
        });
    };

    const openAddModal = () => {
        resetForm();
        setIsEdit(false);
        setShowModal(true);
    };

    const openEditModal = (customer) => {
        setIsEdit(true);
        setData({
            id: customer.id,
            dokan_id: current_dokan?.id,
            name: customer.name || '',
            phone: customer.phone || '',
        });
        setShowModal(true);
    };

    const saveForm = (e) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                toast.success(isEdit ? 'Customer updated successfully' : 'Customer added successfully');
                setShowModal(false);
                resetForm();
            },
            onError: (error) => {
                console.log(error);
                toast.error(isEdit ? 'Failed to update customer' : 'Failed to add customer');
            }
        };

        if (isEdit) {
            put(route('coustomers.update', data.id), options);
        } else {
            post(route('coustomers.store'), options);
        }
    };

    const handleDeleteCustomer = (id, name) => {
        if (!confirm(`Are you sure you want to delete customer "${name}"?`)) {
            return;
        }

        deleteCustomer(route('coustomers.destroy', id), {
            onSuccess: () => {
                toast.success('Customer deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete customer');
            }
        });
    };

    return (
        <AuthenticatedLayout header="Customers">
            <Head title="Customers" />

            {/* Modal for Add / Edit Customer */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <div className="p-6 text-gray-900">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                        {isEdit ? 'Edit Customer' : 'Add New Customer'}
                    </h2>
                    <form className="flex flex-col gap-y-4" onSubmit={saveForm}>
                        <Input
                            label="Customer Name"
                            name="name"
                            id="name"
                            type="text"
                            placeholder="Enter customer name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                            addClass="w-full"
                            required
                        />

                        <Input
                            label="Phone Number"
                            name="phone"
                            id="phone"
                            type="text"
                            placeholder="Enter phone number (optional)"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            error={errors.phone}
                            addClass="w-full"
                        />

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
                                {isEdit ? 'Update Customer' : 'Save Customer'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                    <div className="p-4 md:p-6 text-gray-900">
                        <div className="mx-auto max-w-7xl">
                            <div className="mt-2">
                                <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-4 md:m-5 font-bold">
                                    Customer Directory
                                </h2>

                                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between mb-6 mx-0 md:mx-5 gap-4">
                                    <Input
                                        placeholder="Search by name or phone..."
                                        value={search}
                                        onChange={handleSearchChange}
                                        addClass="w-full md:w-1/2"
                                    />
                                    <PrimaryButton
                                        onClick={openAddModal}
                                        className="w-full md:w-auto flex items-center justify-center py-2.5"
                                    >
                                        <FaUserPlus className="mr-2 h-4 w-4" />
                                        Add Customer
                                    </PrimaryButton>
                                </div>
                            </div>

                            <section className="text-gray-600 body-font">
                                <div className="container py-2 mx-auto">
                                    {coustomers.data.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300 mx-0 md:mx-5">
                                            <FaUser className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                            <h3 className="text-lg font-medium text-gray-900">No Customers Found</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {search
                                                    ? 'No customers match your search criteria.'
                                                    : 'Start adding customers to manage your store relationships.'}
                                            </p>
                                            {!search && (
                                                <div className="mt-4">
                                                    <PrimaryButton onClick={openAddModal}>
                                                        <FaUserPlus className="mr-2 h-4 w-4" />
                                                        Add First Customer
                                                    </PrimaryButton>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            {/* Mobile View (Cards) */}
                                            <div className="block md:hidden space-y-4">
                                                {coustomers.data.map((customer, index) => (
                                                    <div
                                                        key={customer.id}
                                                        className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                                                    >
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base">
                                                                    {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
                                                                </div>
                                                                <div>
                                                                    <span className="font-bold text-gray-900 text-lg block">
                                                                        {customer.name}
                                                                    </span>
                                                                    <span className="text-xs text-gray-400">
                                                                        Added: {new Date(customer.created_at).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center text-sm text-gray-600 mb-3">
                                                            <FaPhoneAlt className="mr-2 text-gray-400" size={14} />
                                                            {customer.phone ? (
                                                                <span className="font-medium text-gray-800">{customer.phone}</span>
                                                            ) : (
                                                                <span className="italic text-gray-400">No phone provided</span>
                                                            )}
                                                        </div>

                                                        <div className="flex justify-end gap-x-4 pt-3 border-t border-gray-100">
                                                            <button
                                                                onClick={() => openEditModal(customer)}
                                                                className="text-blue-600 hover:text-blue-800 transition-colors flex items-center text-sm font-medium"
                                                            >
                                                                <FaRegEdit size={18} className="mr-1" /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                                                                className="text-red-600 hover:text-red-800 transition-colors flex items-center text-sm font-medium"
                                                            >
                                                                <MdDeleteOutline size={20} className="mr-1" /> Delete
                                                            </button>
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
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Name</th>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Phone</th>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Date Added</th>
                                                            <th className="px-4 py-3 title-font text-center font-medium text-gray-900 text-sm bg-gray-100 w-28">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {coustomers.data.map((customer, index) => (
                                                            <tr key={customer.id} className="border-b bg-white hover:bg-gray-50 transition-colors">
                                                                <td className="px-4 py-3 text-gray-500 font-mono text-sm">{index + 1}</td>
                                                                <td className="px-4 py-3 font-semibold text-gray-900 flex items-center">
                                                                    <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm mr-3 border border-indigo-100">
                                                                        {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
                                                                    </div>
                                                                    {customer.name}
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-700">
                                                                    {customer.phone ? (
                                                                        <span className="inline-flex items-center font-mono">
                                                                            <FaPhoneAlt className="mr-1.5 text-gray-400" size={12} />
                                                                            {customer.phone}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-gray-400 italic text-sm">N/A</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-500 text-sm">
                                                                    {new Date(customer.created_at).toLocaleDateString()}
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <div className="flex items-center justify-center space-x-3">
                                                                        <button
                                                                            onClick={() => openEditModal(customer)}
                                                                            className="text-blue-600 hover:text-blue-800 hover:scale-110 transition-all duration-200"
                                                                            title="Edit Customer"
                                                                        >
                                                                            <FaRegEdit size={18} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                                                                            className="text-red-600 hover:text-red-800 hover:scale-110 transition-all duration-200"
                                                                            title="Delete Customer"
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
                                        <Pagination links={coustomers.links} />
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
