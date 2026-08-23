import { useState, useCallback } from 'react';
import { router } from '@inertiajs/react'; // Use the direct router
import debounce from 'lodash/debounce';
import toast from 'react-hot-toast';
const QuantityTicker = ({ product }) => {
    const [localPackets, setLocalPackets] = useState(product.purchased_packets);

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
    return (
        <div className="flex items-center space-x-3">
            {localPackets > 0 && (
                <button 
                    onClick={() => changePackets(-1)}
                    className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded shadow-sm font-bold w-8 text-gray-700"
                >-</button>
            )}
            
            <span className="font-mono font-bold text-lg min-w-[20px] text-center text-gray-900">
                {parseInt(localPackets) || 0}
            </span>
            
            <button 
                onClick={() => changePackets(1)}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded shadow-sm font-bold w-8 text-gray-700"
            >+</button>
        </div>
    );
};

export default QuantityTicker;