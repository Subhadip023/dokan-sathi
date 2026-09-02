import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FaSearch, FaChevronDown, FaTimes, FaCheck } from 'react-icons/fa';

export default function SearchableSelect({
    options = [],
    value = '',
    onChange,
    placeholder = 'Search & select product...',
    className = '',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    // Selected option object
    const selectedOption = useMemo(() => {
        return options.find(opt => String(opt.id) === String(value)) || null;
    }, [options, value]);

    // Filter options based on search term (matches name, description, or price)
    const filteredOptions = useMemo(() => {
        if (!searchTerm.trim()) return options;
        const term = searchTerm.toLowerCase();
        return options.filter(opt => {
            const nameMatch = opt.name?.toLowerCase().includes(term);
            const descMatch = opt.description?.toLowerCase().includes(term);
            const priceMatch = opt.selling_rate?.toString().includes(term);
            return nameMatch || descMatch || priceMatch;
        });
    }, [options, searchTerm]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        onChange(option ? option.id : '');
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {/* Input / Display Trigger Bar */}
            <div
                onClick={() => {
                    const nextState = !isOpen;
                    setIsOpen(nextState);
                    if (nextState && inputRef.current) {
                        setTimeout(() => inputRef.current?.focus(), 50);
                    }
                }}
                className={`w-full flex items-center justify-between border rounded-lg px-3 py-2 text-xs cursor-pointer bg-white transition-all shadow-2xs ${
                    isOpen ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-gray-300 hover:border-gray-400'
                }`}
            >
                <div className="flex items-center flex-1 min-w-0 mr-2">
                    <FaSearch className="text-gray-400 mr-2 shrink-0" size={11} />
                    {selectedOption ? (
                        <div className="truncate">
                            <span className="font-bold text-gray-900">{selectedOption.name}</span>
                            {selectedOption.description && (
                                <span className="text-gray-500 text-[11px] ml-1.5 font-normal italic">
                                    - {selectedOption.description}
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-gray-400">{placeholder}</span>
                    )}
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                    {selectedOption && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(null);
                            }}
                            className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
                            title="Clear selection"
                        >
                            <FaTimes size={10} />
                        </button>
                    )}
                    <FaChevronDown size={10} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden text-xs">
                    {/* Search Field */}
                    <div className="p-2 border-b border-gray-100 bg-gray-50 flex items-center">
                        <FaSearch className="text-gray-400 mr-2 shrink-0" size={11} />
                        <input
                            ref={inputRef}
                            type="text"
                            className="w-full bg-transparent border-0 p-0 text-xs text-gray-900 focus:ring-0 placeholder-gray-400 font-medium"
                            placeholder="Type product name, description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <FaTimes size={10} />
                            </button>
                        )}
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
                        {filteredOptions.length === 0 ? (
                            <div className="p-4 text-center text-gray-400 font-medium">
                                No products match "{searchTerm}"
                            </div>
                        ) : (
                            filteredOptions.map((opt) => {
                                const isSelected = String(opt.id) === String(value);
                                return (
                                    <div
                                        key={opt.id}
                                        onClick={() => handleSelect(opt)}
                                        className={`p-2.5 cursor-pointer flex items-center justify-between transition-colors ${
                                            isSelected
                                                ? 'bg-indigo-50/80 text-indigo-900 font-bold'
                                                : 'hover:bg-gray-50 text-gray-800'
                                        }`}
                                    >
                                        <div className="min-w-0 flex-1 pr-2">
                                            <div className="flex items-center space-x-1.5">
                                                <span className="font-semibold text-gray-900 text-xs">{opt.name}</span>
                                                {isSelected && <FaCheck size={10} className="text-indigo-600 shrink-0" />}
                                            </div>
                                            {opt.description && (
                                                <p className="text-[11px] text-gray-500 italic truncate mt-0.5">
                                                    {opt.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="text-right font-mono text-[11px] shrink-0">
                                            <span className="font-bold text-emerald-700 block">₹{opt.selling_rate}</span>
                                            <span className="text-gray-400 block text-[10px]">
                                                Stock: {opt.purchased_packets} pkts ({opt.packet_size} pcs/pkt)
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
