import { useState, useCallback } from 'react';
import { router } from '@inertiajs/react'; // Use the direct router
import debounce from 'lodash/debounce';
import toast from 'react-hot-toast';
const QuantityTicker = ({ product }) => {
    const [localQty, setLocalQty] = useState(product.quantity);

    const debouncedSync = useCallback(
        debounce((newQty) => {
            router.patch(route('products.syncQuantity'), {
                id: product.id,
                quantity: newQty
            }, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => toast.success('Quantity updated successfully'),
                onError: () => toast.error('Failed to update quantity')
            });

        }, 500), 
        [product.id] 
    );

    const changeQty = (amount) => {
        const nextValue = parseInt( Math.max(0, localQty + parseInt(amount)));
        setLocalQty(nextValue); 
        debouncedSync(nextValue);
    };
    return (
        <div className="flex items-center space-x-3">
            {localQty > 0 && (
                <button 
                    onClick={() => changeQty(-1)}
                    className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded shadow-sm font-bold w-8"
                >-</button>
            )}
            
            <span className="font-mono font-bold text-lg min-w-[20px] text-center">
                {parseInt(localQty) || ''}
            </span>
            
            <button 
                onClick={() => changeQty(1)}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded shadow-sm font-bold w-8"
            >+</button>
        </div>
    );
};

export default QuantityTicker;