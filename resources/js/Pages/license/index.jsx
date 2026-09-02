import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { FaIdCard, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaCertificate } from 'react-icons/fa';

export default function LicenseIndex({ licenses }) {
    const [showModal, setShowModal] = useState(false);
    const [editingLicense, setEditingLicense] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        number: '',
        is_active: true,
    });

    const openAddModal = () => {
        setEditingLicense(null);
        reset();
        clearErrors();
        setShowModal(true);
    };

    const openEditModal = (lic) => {
        setEditingLicense(lic);
        setData({
            name: lic.name,
            number: lic.number,
            is_active: Boolean(lic.is_active),
        });
        clearErrors();
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingLicense(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingLicense) {
            put(route('licenses.update', editingLicense.id), {
                onSuccess: () => {
                    toast.success('License updated successfully');
                    closeModal();
                },
                onError: () => {
                    toast.error('Failed to update license');
                },
            });
        } else {
            post(route('licenses.store'), {
                onSuccess: () => {
                    toast.success('License added successfully');
                    closeModal();
                },
                onError: () => {
                    toast.error('Failed to add license');
                },
            });
        }
    };

    const handleDelete = (lic) => {
        if (!confirm(`Are you sure you want to delete license "${lic.name}"?`)) {
            return;
        }

        destroy(route('licenses.destroy', lic.id), {
            onSuccess: () => {
                toast.success('License deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete license');
            },
        });
    };

    const handleToggleStatus = (lic) => {
        put(route('licenses.update', lic.id), {
            data: {
                name: lic.name,
                number: lic.number,
                is_active: !lic.is_active,
            },
            onSuccess: () => {
                toast.success(`License marked as ${!lic.is_active ? 'Active' : 'Inactive'}`);
            },
        });
    };

    const activeCount = licenses.filter(l => l.is_active).length;
    const inactiveCount = licenses.length - activeCount;

    return (
        <AuthenticatedLayout header="Store Licenses & Registrations">
            <Head title="Licenses & Registrations" />

            {/* Modal for Add / Edit License */}
            <Modal show={showModal} onClose={closeModal} maxWidth="md">
                <div className="p-6 text-gray-900">
                    <div className="flex justify-between items-center mb-4 border-b pb-3">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            <FaIdCard className="mr-2 text-indigo-600" />
                            {editingLicense ? 'Edit Store License' : 'Add New Store License'}
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="License Name / Type *" />
                            <TextInput
                                id="name"
                                type="text"
                                className="mt-1 block w-full text-sm"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. FSSAI License, Trade License, DL No. 20B/21B, GSTIN"
                                required
                            />
                            <InputError message={errors.name} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="number" value="License / Registration Number *" />
                            <TextInput
                                id="number"
                                type="text"
                                className="mt-1 block w-full text-sm font-mono"
                                value={data.number}
                                onChange={(e) => setData('number', e.target.value)}
                                placeholder="e.g. 12824001000987 or DL-WB-KOL-2026-10492"
                                required
                            />
                            <InputError message={errors.number} className="mt-1" />
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <input
                                id="is_active"
                                type="checkbox"
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                            />
                            <label htmlFor="is_active" className="text-xs font-semibold text-gray-700 cursor-pointer">
                                Active (Displayed on Invoices & Official Documents)
                            </label>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <SecondaryButton onClick={closeModal} type="button">
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton disabled={processing} className="bg-indigo-600 hover:bg-indigo-700">
                                {editingLicense ? 'Update License' : 'Save License'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            <div className="mx-auto w-full sm:px-6 lg:px-8 py-6">
                {/* Stats Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Registrations</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{licenses.length}</h3>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl">
                            <FaCertificate />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Licenses</p>
                            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</h3>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
                            <FaCheckCircle />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Inactive Licenses</p>
                            <h3 className="text-2xl font-bold text-gray-400 mt-1">{inactiveCount}</h3>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xl">
                            <FaTimesCircle />
                        </div>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white shadow-xs sm:rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 md:p-6 text-gray-900">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                    <FaIdCard className="mr-2 text-indigo-600" /> Store Licenses & Legal Numbers
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Manage your Drug Licenses, FSSAI numbers, GSTIN, and Trade Registrations for official printing.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={openAddModal}
                                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                            >
                                <FaPlus className="mr-1.5" size={12} /> Add New License
                            </button>
                        </div>

                        {licenses.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <FaIdCard className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                <h3 className="text-lg font-medium text-gray-900">No Licenses Added Yet</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Add your store's trade license, FSSAI number, or GSTIN to keep your records organized.
                                </p>
                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={openAddModal}
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-md shadow-xs"
                                    >
                                        <FaPlus className="mr-1.5" size={12} /> Add First License
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left whitespace-nowrap min-w-max border rounded-lg overflow-hidden text-sm">
                                    <thead>
                                        <tr className="bg-gray-100 text-xs font-semibold uppercase text-gray-700 border-b">
                                            <th className="py-3 px-4 w-12 text-center">#</th>
                                            <th className="py-3 px-4">License Name / Type</th>
                                            <th className="py-3 px-4">Registration Number</th>
                                            <th className="py-3 px-4 text-center">Status</th>
                                            <th className="py-3 px-4 text-center w-28">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {licenses.map((lic, idx) => (
                                            <tr key={lic.id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="py-3.5 px-4 text-center font-mono text-gray-400 text-xs">
                                                    {idx + 1}
                                                </td>
                                                <td className="py-3.5 px-4 font-bold text-gray-900 text-sm">
                                                    <div className="flex items-center">
                                                        <FaCertificate className="mr-2 text-indigo-500" size={14} />
                                                        {lic.name}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 font-mono font-bold text-indigo-900 text-sm">
                                                    <span className="bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                                                        {lic.number}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleStatus(lic)}
                                                        title="Click to toggle status"
                                                    >
                                                        {lic.is_active ? (
                                                            <span className="inline-flex items-center text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full cursor-pointer hover:bg-emerald-200 transition-colors">
                                                                <FaCheckCircle className="mr-1" size={11} /> Active
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center text-xs bg-gray-100 text-gray-600 font-semibold px-2.5 py-1 rounded-full cursor-pointer hover:bg-gray-200 transition-colors">
                                                                <FaTimesCircle className="mr-1" size={11} /> Inactive
                                                            </span>
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(lic)}
                                                            className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                                            title="Edit License"
                                                        >
                                                            <FaEdit size={13} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(lic)}
                                                            className="p-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                                                            title="Delete License"
                                                        >
                                                            <FaTrash size={13} />
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
            </div>
        </AuthenticatedLayout>
    );
}
