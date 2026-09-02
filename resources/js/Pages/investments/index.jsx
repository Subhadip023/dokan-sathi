import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import Input from '@/Components/Input';
import Pagination from '@/Components/Pagination';
import {
    FaHandHoldingUsd,
    FaPlus,
    FaRegEdit,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaUserCheck,
    FaWallet,
    FaUsers,
    FaPiggyBank
} from 'react-icons/fa';
import { MdDeleteOutline } from 'react-icons/md';
import debounce from 'lodash/debounce';

export default function InvestmentIndex({ investments, summary, filters }) {
    const current_dokan = usePage().props.auth.current_dokan;

    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [isEdit, setIsEdit] = useState(false);

    const todayDate = new Date().toISOString().split('T')[0];

    const { data, setData, post, errors, put, delete: deleteInvestment, reset } = useForm({
        id: null,
        dokan_id: current_dokan?.id,
        investor_name: '',
        amount: '',
        investment_date: todayDate,
        payment_method: 'Cash',
        note: '',
    });

    const performSearch = useCallback(
        debounce((query) => {
            router.get(
                route('investments.index'),
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
            investor_name: '',
            amount: '',
            investment_date: todayDate,
            payment_method: 'Cash',
            note: '',
        });
    };

    const openAddModal = () => {
        resetForm();
        setIsEdit(false);
        setShowModal(true);
    };

    const openEditModal = (inv) => {
        setIsEdit(true);
        setData({
            id: inv.id,
            dokan_id: current_dokan?.id,
            investor_name: inv.investor_name || '',
            amount: inv.amount || '',
            investment_date: inv.investment_date ? inv.investment_date.substring(0, 10) : todayDate,
            payment_method: inv.payment_method || 'Cash',
            note: inv.note || '',
        });
        setShowModal(true);
    };

    const saveForm = (e) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                toast.success(isEdit ? 'Investment updated successfully' : 'Investment recorded successfully');
                setShowModal(false);
                resetForm();
            },
            onError: (error) => {
                console.log(error);
                toast.error(isEdit ? 'Failed to update investment' : 'Failed to record investment');
            }
        };

        if (isEdit) {
            put(route('investments.update', data.id), options);
        } else {
            post(route('investments.store'), options);
        }
    };

    const handleDeleteInvestment = (id, investorName, amount) => {
        if (!confirm(`Are you sure you want to delete investment record of ₹${amount} from "${investorName}"?`)) {
            return;
        }

        deleteInvestment(route('investments.destroy', id), {
            onSuccess: () => {
                toast.success('Investment record deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete investment record');
            }
        });
    };

    return (
        <AuthenticatedLayout header="Capital & Investments">
            <Head title="Capital Investments" />

            {/* Modal for Add / Edit Investment */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <div className="p-6 text-gray-900">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2 flex items-center">
                        <FaHandHoldingUsd className="mr-2 text-indigo-600" />
                        {isEdit ? 'Edit Capital Investment' : 'Record New Capital Investment'}
                    </h2>
                    <form className="flex flex-col gap-y-4" onSubmit={saveForm}>
                        <Input
                            label="Investor / Source Name"
                            name="investor_name"
                            id="investor_name"
                            type="text"
                            placeholder="e.g. Subhadip, Partner, Bank Loan"
                            value={data.investor_name}
                            onChange={(e) => setData('investor_name', e.target.value)}
                            error={errors.investor_name}
                            addClass="w-full"
                            required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Investment Amount (₹)"
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

                            <Input
                                label="Investment Date"
                                name="investment_date"
                                id="investment_date"
                                type="date"
                                value={data.investment_date}
                                onChange={(e) => setData('investment_date', e.target.value)}
                                error={errors.investment_date}
                                addClass="w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Payment Method
                            </label>
                            <select
                                name="payment_method"
                                id="payment_method"
                                value={data.payment_method}
                                onChange={(e) => setData('payment_method', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            >
                                <option value="Cash">Cash</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="UPI">UPI / GPay / PhonePe</option>
                                <option value="Cheque">Cheque</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors.payment_method && (
                                <p className="mt-1 text-xs text-red-600">{errors.payment_method}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Note / Description (Optional)
                            </label>
                            <textarea
                                name="note"
                                id="note"
                                rows="3"
                                placeholder="Enter details about this investment capital..."
                                value={data.note}
                                onChange={(e) => setData('note', e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            ></textarea>
                            {errors.note && (
                                <p className="mt-1 text-xs text-red-600">{errors.note}</p>
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
                                {isEdit ? 'Update Investment' : 'Save Investment'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            <div className="mx-auto w-full sm:px-6 lg:px-8">
                {/* Summary Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs uppercase font-bold tracking-wider text-indigo-200">Total Capital Invested</span>
                            <div className="p-2 bg-white/10 rounded-lg">
                                <FaWallet className="h-5 w-5 text-indigo-100" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold font-mono">
                            ₹{Number(summary.totalCapital || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-[11px] text-indigo-200 mt-1">Total business capital injected</p>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs uppercase font-bold tracking-wider text-gray-500">Unique Investors</span>
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                <FaUsers className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-mono">
                            {summary.investorsCount || 0}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">Distinct capital contributors</p>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs uppercase font-bold tracking-wider text-gray-500">Average Investment</span>
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <FaPiggyBank className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-mono">
                            ₹{Number(summary.averageInvestment || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">Average per investor source</p>
                    </div>
                </div>

                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                    <div className="p-4 md:p-6 text-gray-900">
                        <div className="mx-auto w-full">
                            <div className="mt-2">
                                <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-4 md:m-5 font-bold">
                                    Capital Investments Directory
                                </h2>

                                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between mb-6 mx-0 md:mx-5 gap-4">
                                    <Input
                                        placeholder="Search by investor name, payment method, or note..."
                                        value={search}
                                        onChange={handleSearchChange}
                                        addClass="w-full md:w-1/2"
                                    />
                                    <PrimaryButton
                                        onClick={openAddModal}
                                        className="w-full md:w-auto flex items-center justify-center py-2.5"
                                    >
                                        <FaPlus className="mr-2 h-4 w-4" />
                                        Record Investment
                                    </PrimaryButton>
                                </div>
                            </div>

                            <section className="text-gray-600 body-font">
                                <div className="container py-2 mx-auto">
                                    {investments.data.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300 mx-0 md:mx-5">
                                            <FaHandHoldingUsd className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                            <h3 className="text-lg font-medium text-gray-900">No Investments Recorded</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                {search
                                                    ? 'No capital investment records match your search criteria.'
                                                    : 'Record capital investments put into your store to track your business financing.'}
                                            </p>
                                            {!search && (
                                                <div className="mt-4">
                                                    <PrimaryButton onClick={openAddModal}>
                                                        <FaPlus className="mr-2 h-4 w-4" />
                                                        Record First Investment
                                                    </PrimaryButton>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            {/* Mobile View (Cards) */}
                                            <div className="block md:hidden space-y-4">
                                                {investments.data.map((inv) => (
                                                    <div
                                                        key={inv.id}
                                                        className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <span className="font-bold text-gray-900 text-lg block">
                                                                    {inv.investor_name}
                                                                </span>
                                                                <span className="inline-flex items-center text-xs text-gray-500">
                                                                    <FaCalendarAlt className="mr-1 text-gray-400" size={11} />
                                                                    {new Date(inv.investment_date).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <span className="text-lg font-extrabold font-mono text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                                                                ₹{Number(inv.amount || 0).toFixed(2)}
                                                            </span>
                                                        </div>

                                                        {inv.payment_method && (
                                                            <div className="mb-2">
                                                                <span className="inline-flex items-center text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                                                    <FaMoneyBillWave className="mr-1 text-emerald-600" size={11} />
                                                                    {inv.payment_method}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {inv.note && (
                                                            <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-3 italic border border-gray-100">
                                                                "{inv.note}"
                                                            </p>
                                                        )}

                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-100 gap-1">
                                                            <div className="flex items-center">
                                                                <FaUserCheck className="mr-1 text-indigo-500" size={11} />
                                                                Added by: <strong className="ml-1 text-gray-700">{inv.added_by ? inv.added_by.name : 'Store Owner'}</strong>
                                                            </div>
                                                            {inv.edited_by && (
                                                                <div className="flex items-center">
                                                                    <FaRegEdit className="mr-1 text-amber-600" size={11} />
                                                                    Edited by: <strong className="ml-1 text-gray-700">{inv.edited_by.name}</strong>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex justify-end gap-x-3 pt-3 mt-2 border-t border-gray-100">
                                                            <button
                                                                onClick={() => openEditModal(inv)}
                                                                className="text-blue-600 hover:text-blue-800 transition-colors flex items-center text-xs font-semibold"
                                                            >
                                                                <FaRegEdit size={14} className="mr-1" /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteInvestment(inv.id, inv.investor_name, inv.amount)}
                                                                className="text-red-600 hover:text-red-800 transition-colors flex items-center text-xs font-semibold"
                                                            >
                                                                <MdDeleteOutline size={16} className="mr-1" /> Delete
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
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Investor / Source</th>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Amount (₹)</th>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Date</th>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Payment Method</th>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Note / Details</th>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Added By</th>
                                                            <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">Last Edited By</th>
                                                            <th className="px-4 py-3 title-font text-center font-medium text-gray-900 text-sm bg-gray-100 w-28">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {investments.data.map((inv, index) => (
                                                            <tr key={inv.id} className="border-b bg-white hover:bg-gray-50 transition-colors">
                                                                <td className="px-4 py-3 text-gray-500 font-mono text-sm">{index + 1}</td>
                                                                <td className="px-4 py-3 font-bold text-gray-900 text-sm">
                                                                    {inv.investor_name}
                                                                </td>
                                                                <td className="px-4 py-3 font-mono font-extrabold text-indigo-700 text-sm">
                                                                    ₹{Number(inv.amount || 0).toFixed(2)}
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-700 text-xs font-mono">
                                                                    {new Date(inv.investment_date).toLocaleDateString()}
                                                                </td>
                                                                <td className="px-4 py-3 text-xs">
                                                                    {inv.payment_method ? (
                                                                        <span className="inline-flex items-center font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                                                            <FaMoneyBillWave className="mr-1 text-emerald-600" size={11} />
                                                                            {inv.payment_method}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-gray-400 italic">N/A</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-600 text-xs max-w-xs truncate">
                                                                    {inv.note ? (
                                                                        <span title={inv.note}>{inv.note}</span>
                                                                    ) : (
                                                                        <span className="text-gray-400 italic">No notes</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-700 text-xs">
                                                                    <span className="inline-flex items-center font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs">
                                                                        <FaUserCheck className="mr-1.5 text-indigo-500" size={11} />
                                                                        {inv.added_by ? inv.added_by.name : 'Store Owner'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-700 text-xs">
                                                                    {inv.edited_by ? (
                                                                        <span className="inline-flex items-center font-medium bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full text-xs border border-amber-200">
                                                                            <FaRegEdit className="mr-1.5 text-amber-600" size={11} />
                                                                            {inv.edited_by.name}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-gray-400 italic text-xs">N/A</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <div className="flex items-center justify-center space-x-3">
                                                                        <button
                                                                            onClick={() => openEditModal(inv)}
                                                                            className="text-blue-600 hover:text-blue-800 hover:scale-110 transition-all duration-200"
                                                                            title="Edit Investment"
                                                                        >
                                                                            <FaRegEdit size={18} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteInvestment(inv.id, inv.investor_name, inv.amount)}
                                                                            className="text-red-600 hover:text-red-800 hover:scale-110 transition-all duration-200"
                                                                            title="Delete Investment"
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
                                        <Pagination links={investments.links} />
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
