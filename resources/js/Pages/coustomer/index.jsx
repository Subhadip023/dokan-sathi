import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import Input from '@/Components/Input';
import Pagination from '@/Components/Pagination';
import { FaRegEdit, FaUserPlus, FaPhoneAlt, FaUser, FaStore, FaEnvelope, FaUserCheck, FaTags, FaPlus, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import { MdDeleteOutline } from 'react-icons/md';
import debounce from 'lodash/debounce';

export default function CustomerIndex({ coustomers, groups = [], filters }) {
    const current_dokan = usePage().props.auth.current_dokan;
    const user = usePage().props.auth.user;
    const isOwner = (user?.role ?? 1) === 1;

    const [showModal, setShowModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [search, setSearch] = useState(filters.search || '');
    const [isEdit, setIsEdit] = useState(false);

    const { data, setData, post, errors, put, delete: deleteCustomer, reset } = useForm({
        id: null,
        dokan_id: current_dokan?.id,
        coustomer_group_id: '',
        name: '',
        phone: '',
        email: '',
        shop_name: '',
    });

    // Customer Group Form
    const groupForm = useForm({
        name: '',
        discount_type: 1, // 1: Percentage, 2: Fixed, 3: Cost Plus
        discount_value: '',
        is_active: true,
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
            coustomer_group_id: '',
            name: '',
            phone: '',
            email: '',
            shop_name: '',
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
            coustomer_group_id: customer.coustomer_group_id || '',
            name: customer.name || '',
            phone: customer.phone || '',
            email: customer.email || '',
            shop_name: customer.shop_name || '',
        });
        setShowModal(true);
    };

    const resetGroupForm = () => {
        setEditingGroup(null);
        groupForm.reset();
        groupForm.setData({
            name: '',
            discount_type: 1,
            discount_value: '',
            is_active: true,
        });
    };

    const startEditGroup = (group) => {
        setEditingGroup(group);
        groupForm.setData({
            name: group.name,
            discount_type: group.discount_type,
            discount_value: group.discount_value,
            is_active: Boolean(group.is_active),
        });
    };

    const saveGroup = (e) => {
        e.preventDefault();
        if (editingGroup) {
            groupForm.put(route('coustomer-groups.update', editingGroup.id), {
                onSuccess: () => {
                    toast.success('Customer group updated successfully');
                    resetGroupForm();
                },
                onError: () => toast.error('Failed to update group')
            });
        } else {
            groupForm.post(route('coustomer-groups.store'), {
                onSuccess: () => {
                    toast.success('Customer group created successfully');
                    resetGroupForm();
                },
                onError: () => toast.error('Failed to create group')
            });
        }
    };

    const handleDeleteGroup = (groupId, groupName) => {
        if (!confirm(`Are you sure you want to delete group "${groupName}"? Customers in this group will become regular customers.`)) {
            return;
        }

        router.delete(route('coustomer-groups.destroy', groupId), {
            onSuccess: () => toast.success('Customer group deleted successfully'),
            onError: () => toast.error('Failed to delete customer group')
        });
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
                            label="Shop Name (Optional)"
                            name="shop_name"
                            id="shop_name"
                            type="text"
                            placeholder="Enter customer's shop name"
                            value={data.shop_name}
                            onChange={(e) => setData('shop_name', e.target.value)}
                            error={errors.shop_name}
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
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-xs font-semibold text-gray-700">
                                    Customer Group / Pricing Tier
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetGroupForm();
                                        setShowGroupModal(true);
                                    }}
                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                                >
                                    + Manage Groups
                                </button>
                            </div>
                            <select
                                id="coustomer_group_id"
                                name="coustomer_group_id"
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                value={data.coustomer_group_id || ''}
                                onChange={(e) => setData('coustomer_group_id', e.target.value)}
                            >
                                <option value="">Regular / None (Standard Selling Price)</option>
                                {groups.map((g) => (
                                    <option key={g.id} value={g.id}>
                                        {g.name} ({g.discount_type === 1 ? `${g.discount_value}% Discount` : g.discount_type === 2 ? `₹${g.discount_value} Flat Discount` : `Cost + ₹${g.discount_value} Transport`})
                                    </option>
                                ))}
                            </select>
                            <p className="text-[11px] text-gray-500 mt-1">
                                Assigning a group automatically sets special pricing for this customer at POS billing checkout.
                            </p>
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
                                {isEdit ? 'Update Customer' : 'Save Customer'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Modal for Managing Customer Groups */}
            <Modal show={showGroupModal} onClose={() => setShowGroupModal(false)} maxWidth="2xl">
                <div className="p-6 text-gray-900">
                    <div className="flex items-center justify-between border-b pb-3 mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <FaTags size={18} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    Customer Groups & Pricing Tiers
                                </h2>
                                <p className="text-xs text-gray-500">
                                    Create custom pricing rules (Wholesale % discount, Family Cost + Transport fee, etc.)
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowGroupModal(false)}
                            className="p-1 rounded-md text-gray-400 hover:text-gray-600"
                        >
                            <FaTimes size={16} />
                        </button>
                    </div>

                    {/* Group Create/Edit Form */}
                    <form onSubmit={saveGroup} className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                        <h3 className="text-xs uppercase font-bold text-gray-700 tracking-wider mb-3">
                            {editingGroup ? `Edit Group: ${editingGroup.name}` : 'Create New Customer Group'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Group Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Family, Wholesale, VIP"
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                                    value={groupForm.data.name}
                                    onChange={(e) => groupForm.setData('name', e.target.value)}
                                />
                                {groupForm.errors.name && (
                                    <div className="text-red-500 text-[11px] mt-1">{groupForm.errors.name}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Pricing Rule Type *</label>
                                <select
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs font-medium"
                                    value={groupForm.data.discount_type}
                                    onChange={(e) => groupForm.setData('discount_type', parseInt(e.target.value))}
                                >
                                    <option value="1">1. Percentage (% Off Retail)</option>
                                    <option value="2">2. Flat Discount (₹ Off Retail)</option>
                                    <option value="3">3. Cost + Transport Fee (Family)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    {groupForm.data.discount_type === 1 && 'Discount Percentage (%) *'}
                                    {groupForm.data.discount_type === 2 && 'Flat Discount (₹) *'}
                                    {groupForm.data.discount_type === 3 && 'Transportation / Extra Fee (₹) *'}
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    placeholder={groupForm.data.discount_type === 1 ? 'e.g. 10 for 10%' : 'e.g. 5.00 for ₹5'}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs font-mono"
                                    value={groupForm.data.discount_value}
                                    onChange={(e) => groupForm.setData('discount_value', e.target.value)}
                                />
                                {groupForm.errors.discount_value && (
                                    <div className="text-red-500 text-[11px] mt-1">{groupForm.errors.discount_value}</div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200">
                            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={groupForm.data.is_active}
                                    onChange={(e) => groupForm.setData('is_active', e.target.checked)}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="font-medium">Active (Pricing rule enabled)</span>
                            </label>

                            <div className="flex items-center gap-2">
                                {editingGroup && (
                                    <button
                                        type="button"
                                        onClick={resetGroupForm}
                                        className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 font-semibold"
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                                <PrimaryButton disabled={groupForm.processing} className="text-xs py-1.5 px-3">
                                    {editingGroup ? 'Update Group' : 'Save Customer Group'}
                                </PrimaryButton>
                            </div>
                        </div>
                    </form>

                    {/* Existing Groups Table */}
                    <div>
                        <h3 className="text-xs uppercase font-bold text-gray-700 tracking-wider mb-2">
                            Active Customer Groups ({groups.length})
                        </h3>
                        {groups.length === 0 ? (
                            <div className="text-center py-6 bg-gray-50 rounded-lg text-xs text-gray-500">
                                No customer groups created yet. Use the form above to add your first group.
                            </div>
                        ) : (
                            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-gray-100 text-gray-600 font-semibold uppercase">
                                        <tr>
                                            <th className="py-2 px-3">Group Name</th>
                                            <th className="py-2 px-3">Pricing Rule</th>
                                            <th className="py-2 px-3">Value</th>
                                            <th className="py-2 px-3 text-center">Status</th>
                                            <th className="py-2 px-3 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {groups.map((g) => (
                                            <tr key={g.id} className="hover:bg-gray-50/50">
                                                <td className="py-2.5 px-3 font-bold text-gray-900">{g.name}</td>
                                                <td className="py-2.5 px-3">
                                                    {g.discount_type === 1 && (
                                                        <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-semibold">
                                                            Percentage Discount
                                                        </span>
                                                    )}
                                                    {g.discount_type === 2 && (
                                                        <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold">
                                                            Flat Discount off Retail
                                                        </span>
                                                    )}
                                                    {g.discount_type === 3 && (
                                                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                                                            Cost Price + Transport Fee
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3 font-mono font-bold">
                                                    {g.discount_type === 1 ? `${g.discount_value}%` : `₹${g.discount_value}`}
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    {g.is_active ? (
                                                        <span className="inline-flex items-center text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-bold">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => startEditGroup(g)}
                                                            className="text-blue-600 hover:text-blue-800 font-semibold"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteGroup(g.id, g.name)}
                                                            className="text-red-600 hover:text-red-800 font-semibold"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            <div className="mx-auto w-full sm:px-6 lg:px-8">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                    <div className="p-4 md:p-6 text-gray-900">
                        <div className="mx-auto w-full">
                            <div className="mt-2">
                                <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-4 md:m-5 font-bold">
                                    Customer Directory
                                </h2>

                                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between mb-6 mx-0 md:mx-5 gap-4">
                                    <Input
                                        placeholder="Search by name, shop, phone, or email..."
                                        value={search}
                                        onChange={handleSearchChange}
                                        addClass="w-full md:w-1/2"
                                    />
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                resetGroupForm();
                                                setShowGroupModal(true);
                                            }}
                                            className="px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                                        >
                                            <FaTags className="text-indigo-600" />
                                            Customer Groups ({groups.length})
                                        </button>
                                        <PrimaryButton
                                            onClick={openAddModal}
                                            className="w-full sm:w-auto flex items-center justify-center py-2.5"
                                        >
                                            <FaUserPlus className="mr-2 h-4 w-4" />
                                            Add Customer
                                        </PrimaryButton>
                                    </div>
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
                                                                    {customer.shop_name && (
                                                                        <span className="inline-flex items-center text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md mt-0.5">
                                                                            <FaStore className="mr-1 text-indigo-500" size={10} />
                                                                            {customer.shop_name}
                                                                        </span>
                                                                    )}
                                                                    {customer.group && (
                                                                        <div className="mt-1">
                                                                            <span className="inline-flex items-center text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                                                                🏷️ {customer.group.name} ({customer.group.discount_type === 1 ? `${customer.group.discount_value}% off` : customer.group.discount_type === 2 ? `₹${customer.group.discount_value} off` : `Cost + ₹${customer.group.discount_value}`})
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1.5 text-xs text-gray-600 mb-3 border-t border-b border-gray-100 py-2">
                                                            <div className="flex flex-col gap-y-1">
                                                                <div className="flex items-center">
                                                                    <FaPhoneAlt className="mr-2 text-gray-400 shrink-0" size={12} />
                                                                    {customer.phone ? (
                                                                        <span className="font-medium text-gray-800 font-mono">{customer.phone}</span>
                                                                    ) : (
                                                                        <span className="italic text-gray-400">No phone</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <FaEnvelope className="mr-2 text-gray-400 shrink-0" size={12} />
                                                                    {customer.email ? (
                                                                        <span className="font-medium text-gray-800">{customer.email}</span>
                                                                    ) : (
                                                                        <span className="italic text-gray-400">No email</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-between text-xs border-t border-gray-100 pt-2 font-mono flex-wrap gap-2">
                                                                <span className="text-emerald-700 font-bold">
                                                                    Sales: ₹{Number(customer.total_sales_amount || 0).toFixed(2)}
                                                                </span>
                                                                <span className="text-rose-600 font-bold">
                                                                    Due: ₹{Number(customer.total_due_amount || 0).toFixed(2)}
                                                                </span>
                                                                {isOwner && customer.total_profit !== null && customer.total_profit !== undefined && (
                                                                    <span className="text-indigo-600 font-bold">
                                                                        Profit: ₹{Number(customer.total_profit || 0).toFixed(2)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-500 pt-1 gap-1">
                                                                <div className="flex items-center">
                                                                    <FaUserCheck className="mr-1 text-indigo-500" size={11} />
                                                                    Added by: <strong className="ml-1 text-gray-700">{customer.added_by ? customer.added_by.name : 'Store Owner'}</strong>
                                                                </div>
                                                                {customer.edited_by && (
                                                                    <div className="flex items-center">
                                                                        <FaRegEdit className="mr-1 text-amber-600" size={11} />
                                                                        Edited by: <strong className="ml-1 text-gray-700">{customer.edited_by.name}</strong>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-between items-center pt-2">
                                                            <span className="text-[11px] text-gray-400">
                                                                {new Date(customer.created_at).toLocaleDateString()}
                                                            </span>
                                                            <div className="flex items-center gap-x-3">
                                                                <button
                                                                    onClick={() => openEditModal(customer)}
                                                                    className="text-blue-600 hover:text-blue-800 transition-colors flex items-center text-xs font-semibold"
                                                                >
                                                                    <FaRegEdit size={14} className="mr-1" /> Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteCustomer(customer.id, customer.name)}
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
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Customer & Shop Name</th>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Customer Group</th>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Phone & Email</th>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Sales & Due (₹)</th>
                                                            {isOwner && <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Total Profit (₹)</th>}
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Added / Edited By</th>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Date Added</th>
                                                            <th className="px-4 py-3 title-font text-center font-medium text-gray-900 text-sm bg-gray-100 w-28">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {coustomers.data.map((customer, index) => (
                                                            <tr key={customer.id} className="border-b bg-white hover:bg-gray-50 transition-colors">
                                                                <td className="px-4 py-3 text-gray-500 font-mono text-sm">{index + 1}</td>
                                                                <td className="px-4 py-3 font-semibold text-gray-900">
                                                                    <div className="flex items-center">
                                                                        <div className="h-9 w-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm mr-3 border border-indigo-100 shrink-0">
                                                                            {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
                                                                        </div>
                                                                        <div>
                                                                            <span className="block text-sm font-bold text-gray-900">{customer.name}</span>
                                                                            {customer.shop_name ? (
                                                                                <span className="inline-flex items-center text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded mt-0.5">
                                                                                    <FaStore className="mr-1 text-indigo-500" size={10} />
                                                                                    {customer.shop_name}
                                                                                </span>
                                                                            ) : (
                                                                                <span className="text-[11px] text-gray-400 italic">No shop name</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-xs">
                                                                    {customer.group ? (
                                                                        <span className="inline-flex items-center text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                                                                            <span className="mr-1">🏷️</span>
                                                                            {customer.group.name}
                                                                            <span className="ml-1 text-[11px] font-mono text-emerald-600">
                                                                                ({customer.group.discount_type === 1 ? `${customer.group.discount_value}% off` : customer.group.discount_type === 2 ? `₹${customer.group.discount_value} off` : `Cost + ₹${customer.group.discount_value}`})
                                                                            </span>
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                                                                            Regular
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-700 text-xs">
                                                                    <div className="flex flex-col space-y-1">
                                                                        {customer.phone ? (
                                                                            <span className="inline-flex items-center font-mono">
                                                                                <FaPhoneAlt className="mr-1.5 text-gray-400 shrink-0" size={12} />
                                                                                {customer.phone}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="inline-flex items-center text-gray-400 italic">
                                                                                <FaPhoneAlt className="mr-1.5 text-gray-300 shrink-0" size={12} /> N/A
                                                                            </span>
                                                                        )}
                                                                        {customer.email ? (
                                                                            <span className="inline-flex items-center">
                                                                                <FaEnvelope className="mr-1.5 text-gray-400 shrink-0" size={12} />
                                                                                {customer.email}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="inline-flex items-center text-gray-400 italic">
                                                                                <FaEnvelope className="mr-1.5 text-gray-300 shrink-0" size={12} /> N/A
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-xs">
                                                                    <div className="flex flex-col space-y-1 font-mono">
                                                                        <div className="flex items-center space-x-1.5">
                                                                            <span className="text-[10px] uppercase font-semibold text-gray-400">Sales:</span>
                                                                            <span className="font-extrabold text-emerald-700">
                                                                                ₹{Number(customer.total_sales_amount || 0).toFixed(2)}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center space-x-1.5">
                                                                            <span className="text-[10px] uppercase font-semibold text-gray-400">Due:</span>
                                                                            <span className={`font-bold ${Number(customer.total_due_amount || 0) > 0 ? 'text-rose-600' : 'text-gray-400'}`}>
                                                                                ₹{Number(customer.total_due_amount || 0).toFixed(2)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                {isOwner && (
                                                                    <td className="px-4 py-3 font-mono font-bold text-indigo-600 text-xs">
                                                                        ₹{Number(customer.total_profit || 0).toFixed(2)}
                                                                    </td>
                                                                )}
                                                                <td className="px-4 py-3 text-xs">
                                                                    <div className="flex flex-col space-y-1 text-[11px]">
                                                                        <div className="flex items-center text-gray-700">
                                                                            <FaUserCheck className="mr-1.5 text-indigo-500 shrink-0" size={11} />
                                                                            <span className="text-gray-400 mr-1">Added:</span>
                                                                            <strong className="text-gray-800 font-medium">
                                                                                {customer.added_by ? customer.added_by.name : 'Store Owner'}
                                                                            </strong>
                                                                        </div>
                                                                        {customer.edited_by ? (
                                                                            <div className="flex items-center text-amber-900">
                                                                                <FaRegEdit className="mr-1.5 text-amber-600 shrink-0" size={11} />
                                                                                <span className="text-gray-400 mr-1">Edited:</span>
                                                                                <strong className="text-amber-800 font-medium">
                                                                                    {customer.edited_by.name}
                                                                                </strong>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="text-gray-400 text-[10px] pl-4 italic">Not edited</div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-500 text-xs font-mono">
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
