import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import {
    FaUserTie,
    FaPlus,
    FaEdit,
    FaTrash,
    FaShieldAlt,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaKey,
    FaUserPlus,
    FaStore
} from 'react-icons/fa';

export default function StaffIndex({ staff, dokan }) {
    const authUser = usePage().props.auth.user;
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [deletingStaff, setDeletingStaff] = useState(null);

    // Form for Adding Staff
    const addForm = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 2, // Default: Employee
    });

    // Form for Editing Staff
    const editForm = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 2,
    });

    const openEditModal = (member) => {
        setEditingStaff(member);
        editForm.setData({
            name: member.name || '',
            email: member.email || '',
            phone: member.phone || '',
            password: '',
            role: member.role || 2,
        });
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        addForm.post(route('staff.store'), {
            onSuccess: () => {
                addForm.reset();
                setIsAddModalOpen(false);
            },
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        editForm.put(route('staff.update', editingStaff.id), {
            onSuccess: () => {
                setEditingStaff(null);
            },
        });
    };

    const handleDeleteSubmit = (e) => {
        e.preventDefault();
        if (!deletingStaff) return;

        addForm.delete(route('staff.destroy', deletingStaff.id), {
            onSuccess: () => {
                setDeletingStaff(null);
            },
        });
    };

    return (
        <AuthenticatedLayout header="Staff Management">
            <Head title="Staff Management" />

            <div className="py-8 space-y-6 max-w-7xl mx-auto sm:px-6 lg:px-8">
                {/* Header Card */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-indigo-600">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                            <FaUserTie className="mr-3 text-indigo-600 text-2xl" /> Staff & Team Members
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage store employees, staff credentials, and role permissions for <strong className="text-gray-700">{dokan.name}</strong>.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl flex items-center shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer shrink-0"
                    >
                        <FaUserPlus className="mr-2" /> Add New Staff Member
                    </button>
                </div>

                {/* Staff Members List Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-base font-bold text-gray-800 flex items-center">
                            Total Staff ({staff.length})
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-xs uppercase font-extrabold text-gray-500 border-b border-gray-200">
                                    <th className="py-3.5 px-6">Name</th>
                                    <th className="py-3.5 px-6">Contact Email</th>
                                    <th className="py-3.5 px-6">Phone Number</th>
                                    <th className="py-3.5 px-6">Role</th>
                                    <th className="py-3.5 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {staff.map((member) => {
                                    const isOwner = member.id === dokan.owner_id || member.role === 1;
                                    const isSelf = member.id === authUser.id;

                                    return (
                                        <tr key={member.id} className="hover:bg-gray-50/70 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white ${
                                                        isOwner ? 'bg-indigo-600' : 'bg-emerald-600'
                                                    }`}>
                                                        {member.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-gray-900 block flex items-center">
                                                            {member.name}
                                                            {isSelf && (
                                                                <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-bold uppercase">
                                                                    You
                                                                </span>
                                                            )}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            Joined {new Date(member.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 font-mono text-gray-600">
                                                <div className="flex items-center">
                                                    <FaEnvelope className="mr-2 text-gray-400 text-xs" />
                                                    {member.email}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 font-mono text-gray-600">
                                                {member.phone ? (
                                                    <div className="flex items-center">
                                                        <FaPhone className="mr-2 text-gray-400 text-xs" />
                                                        {member.phone}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic text-xs">Not specified</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                {isOwner ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                                                        <FaShieldAlt className="mr-1 text-indigo-600" /> Store Owner / Admin
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                        <FaUserTie className="mr-1 text-emerald-600" /> Store Employee
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(member)}
                                                    className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit Staff Member"
                                                >
                                                    <FaEdit className="text-base" />
                                                </button>

                                                {!isOwner && !isSelf && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeletingStaff(member)}
                                                        className="p-2 text-rose-600 hover:text-rose-900 hover:bg-rose-50 rounded-lg transition-colors"
                                                        title="Remove Staff Member"
                                                    >
                                                        <FaTrash className="text-base" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Staff Modal */}
            <Modal show={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
                <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center">
                        <FaUserPlus className="mr-2 text-indigo-600" /> Add New Staff Member
                    </h2>
                    <p className="text-xs text-gray-500">
                        Create login credentials for a new employee or store manager.
                    </p>

                    <div>
                        <InputLabel htmlFor="add_name" value="Full Name *" />
                        <TextInput
                            id="add_name"
                            type="text"
                            className="mt-1 block w-full text-sm"
                            value={addForm.data.name}
                            onChange={(e) => addForm.setData('name', e.target.value)}
                            required
                            placeholder="e.g. Rahul Sharma"
                        />
                        <InputError message={addForm.errors.name} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="add_email" value="Email Address *" />
                        <TextInput
                            id="add_email"
                            type="email"
                            className="mt-1 block w-full text-sm"
                            value={addForm.data.email}
                            onChange={(e) => addForm.setData('email', e.target.value)}
                            required
                            placeholder="rahul@example.com"
                        />
                        <InputError message={addForm.errors.email} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="add_phone" value="Mobile / Phone Number" />
                        <TextInput
                            id="add_phone"
                            type="text"
                            className="mt-1 block w-full text-sm"
                            value={addForm.data.phone}
                            onChange={(e) => addForm.setData('phone', e.target.value)}
                            placeholder="+91 9876543210"
                        />
                        <InputError message={addForm.errors.phone} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="add_password" value="Password *" />
                        <TextInput
                            id="add_password"
                            type="password"
                            className="mt-1 block w-full text-sm"
                            value={addForm.data.password}
                            onChange={(e) => addForm.setData('password', e.target.value)}
                            required
                            placeholder="Minimum 8 characters"
                        />
                        <InputError message={addForm.errors.password} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="add_role" value="Role Permission *" />
                        <select
                            id="add_role"
                            value={addForm.data.role}
                            onChange={(e) => addForm.setData('role', parseInt(e.target.value))}
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-2xs text-sm"
                        >
                            <option value={2}>Store Employee (POS & Sales Access)</option>
                            <option value={1}>Store Admin / Co-Owner</option>
                        </select>
                        <InputError message={addForm.errors.role} className="mt-1" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <SecondaryButton type="button" onClick={() => setIsAddModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={addForm.processing} className="bg-indigo-600 hover:bg-indigo-700">
                            Create Staff Account
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Edit Staff Modal */}
            <Modal show={!!editingStaff} onClose={() => setEditingStaff(null)}>
                <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center">
                        <FaEdit className="mr-2 text-indigo-600" /> Edit Staff Member
                    </h2>

                    <div>
                        <InputLabel htmlFor="edit_name" value="Full Name *" />
                        <TextInput
                            id="edit_name"
                            type="text"
                            className="mt-1 block w-full text-sm"
                            value={editForm.data.name}
                            onChange={(e) => editForm.setData('name', e.target.value)}
                            required
                        />
                        <InputError message={editForm.errors.name} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="edit_email" value="Email Address *" />
                        <TextInput
                            id="edit_email"
                            type="email"
                            className="mt-1 block w-full text-sm"
                            value={editForm.data.email}
                            onChange={(e) => editForm.setData('email', e.target.value)}
                            required
                        />
                        <InputError message={editForm.errors.email} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="edit_phone" value="Mobile / Phone Number" />
                        <TextInput
                            id="edit_phone"
                            type="text"
                            className="mt-1 block w-full text-sm"
                            value={editForm.data.phone}
                            onChange={(e) => editForm.setData('phone', e.target.value)}
                        />
                        <InputError message={editForm.errors.phone} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="edit_password" value="New Password (Leave blank to keep unchanged)" />
                        <TextInput
                            id="edit_password"
                            type="password"
                            className="mt-1 block w-full text-sm"
                            value={editForm.data.password}
                            onChange={(e) => editForm.setData('password', e.target.value)}
                            placeholder="Enter new password if updating"
                        />
                        <InputError message={editForm.errors.password} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="edit_role" value="Role Permission *" />
                        <select
                            id="edit_role"
                            value={editForm.data.role}
                            onChange={(e) => editForm.setData('role', parseInt(e.target.value))}
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-2xs text-sm"
                        >
                            <option value={2}>Store Employee (POS & Sales Access)</option>
                            <option value={1}>Store Admin / Co-Owner</option>
                        </select>
                        <InputError message={editForm.errors.role} className="mt-1" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <SecondaryButton type="button" onClick={() => setEditingStaff(null)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={editForm.processing} className="bg-indigo-600 hover:bg-indigo-700">
                            Update Staff Details
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={!!deletingStaff} onClose={() => setDeletingStaff(null)}>
                <div className="p-6 space-y-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
                        <FaTrash />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">
                        Remove Staff Member?
                    </h2>
                    <p className="text-sm text-gray-500">
                        Are you sure you want to remove <strong className="text-gray-800">{deletingStaff?.name}</strong>? They will no longer be able to log into this Dokan.
                    </p>

                    <div className="flex justify-center gap-3 pt-4 border-t border-gray-100">
                        <SecondaryButton onClick={() => setDeletingStaff(null)}>
                            Cancel
                        </SecondaryButton>
                        <button
                            type="button"
                            onClick={handleDeleteSubmit}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
                        >
                            Yes, Remove Staff
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
