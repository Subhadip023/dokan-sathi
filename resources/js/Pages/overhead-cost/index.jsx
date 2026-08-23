import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import Input from '@/Components/Input';
import Pagination from '@/Components/Pagination';
import { FaReceipt, FaRegEdit, FaCalendarAlt, FaPlus, FaRupeeSign, FaBoxes, FaCoins } from 'react-icons/fa';
import { MdDeleteOutline } from 'react-icons/md';
import debounce from 'lodash/debounce';

export default function OverheadCostIndex({ overheadCosts, summary, filters }) {
    const current_dokan = usePage().props.auth.current_dokan;

    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [isEdit, setIsEdit] = useState(false);

    const getTodayDate = () => new Date().toISOString().split('T')[0];

    const { data, setData, post, errors, put, delete: deleteCost, reset } = useForm({
        id: null,
        dokan_id: current_dokan?.id,
        cost_date: getTodayDate(),
        description: '',
        amount: '',
    });

    const performSearch = useCallback(
        debounce((query) => {
            router.get(
                route('overhead-costs.index'),
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
            cost_date: getTodayDate(),
            description: '',
            amount: '',
        });
    };

    const openAddModal = () => {
        resetForm();
        setIsEdit(false);
        setShowModal(true);
    };

    const openEditModal = (cost) => {
        setIsEdit(true);
        setData({
            id: cost.id,
            dokan_id: current_dokan?.id,
            cost_date: cost.cost_date || getTodayDate(),
            description: cost.description || '',
            amount: cost.amount || '',
        });
        setShowModal(true);
    };

    const saveForm = (e) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                toast.success(isEdit ? 'Overhead cost updated successfully' : 'Overhead cost recorded successfully');
                setShowModal(false);
                resetForm();
            },
            onError: () => {
                toast.error(isEdit ? 'Failed to update overhead cost' : 'Failed to record overhead cost');
            }
        };

        if (isEdit) {
            put(route('overhead-costs.update', data.id), options);
        } else {
            post(route('overhead-costs.store'), options);
        }
    };

    const handleDeleteCost = (id) => {
        if (!confirm('Are you sure you want to delete this overhead cost record?')) {
            return;
        }

        deleteCost(route('overhead-costs.destroy', id), {
            onSuccess: () => {
                toast.success('Overhead cost record deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete overhead cost record');
            }
        });
    };

    return (
        <AuthenticatedLayout header="Overhead Costs">
            <Head title="Overhead Costs" />

            {/* Modal for Recording / Editing Overhead Cost */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <div className="p-6 text-gray-900">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                        {isEdit ? 'Edit Overhead Cost Entry' : 'Record New Overhead Cost'}
                    </h2>
                    <form className="flex flex-col gap-y-4" onSubmit={saveForm}>
                        <div>
                            <label htmlFor="cost_date" className="block text-sm font-medium text-gray-700 mb-1">
                                Cost Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                id="cost_date"
                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                value={data.cost_date}
                                onChange={(e) => setData('cost_date', e.target.value)}
                                required
                            />
                            {errors.cost_date && (
                                <p className="text-xs text-red-600 mt-1">{errors.cost_date}</p>
                            )}
                        </div>

                        <Input
                            label="Cost Description"
                            name="description"
                            id="description"
                            type="text"
                            placeholder="e.g. Rent, Electricity, Staff Salary, Transport, Maintenance"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            error={errors.description}
                            addClass="w-full"
                            required
                        />

                        <Input
                            label="Amount (₹)"
                            name="amount"
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            error={errors.amount}
                            addClass="w-full"
                            required
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
                                {isEdit ? 'Update Cost' : 'Save Overhead Cost'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                {/* Stats Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Overhead Costs</p>
                            <h3 className="text-2xl font-bold text-red-600 mt-1">₹{summary.totalCost.toLocaleString()}</h3>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl">
                            <FaCoins />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Cost Entries</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{summary.totalCount}</h3>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xl">
                            <FaReceipt />
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                    <div className="p-4 md:p-6 text-gray-900">
                        <div className="mx-auto max-w-7xl">
                            <div className="mt-2">
                                <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-4 md:m-5 font-bold">
                                    Overhead Expense Log
                                </h2>

                                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between mb-6 mx-0 md:mx-5 gap-4">
                                    <Input
                                        placeholder="Search description, date, or amount..."
                                        value={search}
                                        onChange={handleSearchChange}
                                        addClass="w-full md:w-1/2"
                                    />
                                    <PrimaryButton
                                        onClick={openAddModal}
                                        className="w-full md:w-auto flex items-center justify-center py-2.5 bg-red-600 hover:bg-red-700"
                                    >
                                        <FaPlus className="mr-2 h-3.5 w-3.5" />
                                        Record Overhead Cost
                                    </PrimaryButton>
                                </div>
                            </div>

                            <section className="text-gray-600 body-font">
                                <div className="container py-2 mx-auto">
                                    {overheadCosts.data.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300 mx-0 md:mx-5">
                                            <FaBoxes className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                            <h3 className="text-lg font-medium text-gray-900">No Overhead Costs Found</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {search
                                                    ? 'No overhead cost entries match your search criteria.'
                                                    : 'Track store operational expenses like rent, electricity, & salaries.'}
                                            </p>
                                            {!search && (
                                                <div className="mt-4">
                                                    <PrimaryButton onClick={openAddModal} className="bg-red-600 hover:bg-red-700">
                                                        <FaPlus className="mr-2 h-3.5 w-3.5" />
                                                        Record First Cost
                                                    </PrimaryButton>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            {/* Mobile View (Cards) */}
                                            <div className="block md:hidden space-y-4">
                                                {overheadCosts.data.map((cost) => (
                                                    <div
                                                        key={cost.id}
                                                        className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <span className="font-bold text-gray-900 text-base block">
                                                                    {cost.description}
                                                                </span>
                                                                <span className="text-xs text-gray-400 flex items-center mt-0.5">
                                                                    <FaCalendarAlt className="mr-1" size={10} />
                                                                    {cost.cost_date}
                                                                </span>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-lg font-bold text-red-600 block">
                                                                    ₹{cost.amount}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-end gap-x-4 pt-2 border-t border-gray-100 mt-2">
                                                            <button
                                                                onClick={() => openEditModal(cost)}
                                                                className="text-blue-600 hover:text-blue-800 transition-colors flex items-center text-sm font-medium"
                                                            >
                                                                <FaRegEdit size={16} className="mr-1" /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteCost(cost.id)}
                                                                className="text-red-600 hover:text-red-800 transition-colors flex items-center text-sm font-medium"
                                                            >
                                                                <MdDeleteOutline size={18} className="mr-1" /> Delete
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
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Date</th>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Description</th>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Amount (₹)</th>
                                                            <th className="px-4 py-3 title-font text-center font-medium text-gray-900 text-sm bg-gray-100 w-24">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {overheadCosts.data.map((cost, index) => (
                                                            <tr key={cost.id} className="border-b bg-white hover:bg-gray-50 transition-colors">
                                                                <td className="px-4 py-3 text-gray-500 font-mono text-sm">{index + 1}</td>
                                                                <td className="px-4 py-3 text-gray-700 text-sm font-mono">{cost.cost_date}</td>
                                                                <td className="px-4 py-3 font-semibold text-gray-900">
                                                                    {cost.description}
                                                                </td>
                                                                <td className="px-4 py-3 font-mono font-bold text-red-600">
                                                                    ₹{cost.amount}
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <div className="flex items-center justify-center space-x-3">
                                                                        <button
                                                                            onClick={() => openEditModal(cost)}
                                                                            className="text-blue-600 hover:text-blue-800 hover:scale-110 transition-all duration-200"
                                                                            title="Edit Cost"
                                                                        >
                                                                            <FaRegEdit size={18} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteCost(cost.id)}
                                                                            className="text-red-600 hover:text-red-800 hover:scale-110 transition-all duration-200"
                                                                            title="Delete Cost"
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
                                        <Pagination links={overheadCosts.links} />
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
