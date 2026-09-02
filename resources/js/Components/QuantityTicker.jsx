import { useState, useCallback, useEffect } from 'react';
import { router } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import toast from 'react-hot-toast';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

const QuantityTicker = ({ product }) => {
    const [localPackets, setLocalPackets] = useState(product.purchased_packets);
    const [showModal, setShowModal] = useState(false);
    const [addAmount, setAddAmount] = useState(1);

    useEffect(() => {
        setLocalPackets(product.purchased_packets);
    }, [product.purchased_packets]);

    const debouncedSync = useCallback(
        debounce((newPackets) => {
            router.patch(route('products.syncQuantity'), {
                id: product.id,
                purchased_packets: newPackets
            }, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => toast.success('Packets updated successfully'),
                onError: () => toast.error('Failed to update packets')
            });
        }, 500),
        [product.id]
    );

    const changePackets = (amount) => {
        const nextValue = parseInt(Math.max(0, localPackets + parseInt(amount)));
        setLocalPackets(nextValue);
        debouncedSync(nextValue);
    };

    const handleAddStock = (e) => {
        e.preventDefault();
        const qtyToAdd = parseInt(addAmount) || 0;
        if (qtyToAdd <= 0) {
            toast.error('Please enter a valid packet amount to add');
            return;
        }
        const nextValue = parseInt(localPackets) + qtyToAdd;
        setLocalPackets(nextValue);
        setShowModal(false);
        setAddAmount(1);

        router.patch(route('products.syncQuantity'), {
            id: product.id,
            purchased_packets: nextValue
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => toast.success(`Added ${qtyToAdd} packet(s) to ${product.name}`),
            onError: () => toast.error('Failed to update packets')
        });
    };

    return (
        <>
            <div className="flex items-center space-x-3">
                {localPackets > 0 && (
                    <button
                        type="button"
                        onClick={() => changePackets(-1)}
                        className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded shadow-sm font-bold w-8 text-gray-700"
                        title="Reduce 1 packet"
                    >
                        -
                    </button>
                )}

                <span className="font-mono font-bold text-lg min-w-[20px] text-center text-gray-900">
                    {parseInt(localPackets) || 0}
                </span>

                <button
                    type="button"
                    onClick={() => {
                        setAddAmount(1);
                        setShowModal(true);
                    }}
                    className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded shadow-sm font-bold w-8 text-gray-700"
                    title="Add stock packets"
                >
                    +
                </button>
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="sm">
                <form onSubmit={handleAddStock} className="p-6 text-gray-900">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                        Add Stock Packets
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                        Product: <strong className="text-gray-900">{product.name}</strong>
                    </p>

                    <div className="space-y-4 mb-6">
                        <div>
                            <label htmlFor={`add_packets_${product.id}`} className="block text-xs font-bold uppercase text-gray-700 mb-1">
                                Packets to Add
                            </label>
                            <input
                                id={`add_packets_${product.id}`}
                                type="number"
                                min="1"
                                value={addAmount}
                                onChange={(e) => setAddAmount(e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs flex justify-between items-center">
                            <span className="text-gray-600">Current Stock: <strong>{localPackets} pkts</strong></span>
                            <span className="text-emerald-700 font-bold">New Total: {parseInt(localPackets || 0) + (parseInt(addAmount) || 0)} pkts</span>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <SecondaryButton type="button" onClick={() => setShowModal(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit">
                            Add Packets
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default QuantityTicker;