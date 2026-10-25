import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FaSearch, FaChevronDown, FaTimes, FaCheck, FaUser, FaStore, FaPhoneAlt } from 'react-icons/fa';

export default function SearchableSelect({
    options = [],
    value = '',
    onChange,
    placeholder = 'Search & select...',
    searchPlaceholder = 'Type to search...',
    className = '',
    emptyOption = null,
    filterOption = null,
    renderOption = null,
    renderSelected = null,
    icon: Icon = FaSearch,
    error = false,
    id,
    disabled = false,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    // Combine emptyOption if provided and not already in options
    const allOptions = useMemo(() => {
        if (!emptyOption) return options;
        const hasEmpty = options.some(opt => String(opt.id) === String(emptyOption.id));
        return hasEmpty ? options : [emptyOption, ...options];
    }, [options, emptyOption]);

    // Selected option object
    const selectedOption = useMemo(() => {
        if (value === '' || value === null || value === undefined) {
            return emptyOption || null;
        }
        return allOptions.find(opt => String(opt.id) === String(value)) || null;
    }, [allOptions, value, emptyOption]);

    // Filter options based on search term
    const filteredOptions = useMemo(() => {
        if (!searchTerm.trim()) return allOptions;
        const term = searchTerm.toLowerCase().trim();

        if (filterOption) {
            return allOptions.filter(opt => filterOption(opt, term));
        }

        return allOptions.filter(opt => {
            // Check emptyOption special match
            if (emptyOption && String(opt.id) === String(emptyOption.id)) {
                const emptyName = (opt.name || opt.label || '').toLowerCase();
                const emptySubtitle = (opt.subtitle || '').toLowerCase();
                return emptyName.includes(term) || emptySubtitle.includes(term) || 'walk-in cash default'.includes(term);
            }

            const nameMatch = opt.name?.toLowerCase().includes(term);
            const descMatch = opt.description?.toLowerCase().includes(term);
            const phoneMatch = opt.phone?.toLowerCase().includes(term);
            const shopMatch = opt.shop_name?.toLowerCase().includes(term);
            const emailMatch = opt.email?.toLowerCase().includes(term);
            const priceMatch = opt.selling_rate?.toString().includes(term);
            const labelMatch = opt.label?.toLowerCase().includes(term);

            return Boolean(nameMatch || descMatch || phoneMatch || shopMatch || emailMatch || priceMatch || labelMatch);
        });
    }, [allOptions, searchTerm, filterOption, emptyOption]);

    // Reset highlighted index when filtered options change
    useEffect(() => {
        setHighlightedIndex(0);
    }, [filteredOptions]);

    // Auto-scroll highlighted item into view
    useEffect(() => {
        if (isOpen && listRef.current && filteredOptions.length > 0) {
            const itemEl = listRef.current.children[highlightedIndex];
            if (itemEl) {
                itemEl.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightedIndex, isOpen, filteredOptions]);

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
        const val = option ? (option.id !== undefined ? option.id : '') : '';
        onChange(val);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsOpen(true);
                setTimeout(() => inputRef.current?.focus(), 50);
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev => (prev + 1 < filteredOptions.length ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev => (prev - 1 >= 0 ? prev - 1 : filteredOptions.length - 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredOptions[highlightedIndex]) {
                handleSelect(filteredOptions[highlightedIndex]);
            }
        } else if (e.key === 'Escape' || e.key === 'Tab') {
            setIsOpen(false);
        }
    };

    const isOptionSelected = (opt) => {
        return String(opt.id) === String(value || '');
    };

    const defaultRenderOption = (opt, isSelected) => {
        // 1. Empty / Default option
        if (emptyOption && String(opt.id) === String(emptyOption.id)) {
            return (
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2">
                        <span className="p-1.5 bg-gray-100 text-gray-500 rounded-md">
                            <FaUser size={11} />
                        </span>
                        <div>
                            <span className="font-semibold text-gray-800 text-xs block">{opt.name || opt.label}</span>
                            <span className="text-[10px] text-gray-400 block">{opt.subtitle || 'Counter sale (no customer account)'}</span>
                        </div>
                    </div>
                    {isSelected && <FaCheck size={11} className="text-indigo-600 shrink-0" />}
                </div>
            );
        }

        // 2. Customer Option
        if (opt.phone !== undefined || opt.shop_name !== undefined) {
            return (
                <div className="flex items-center justify-between w-full">
                    <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center space-x-1.5">
                            <span className="font-semibold text-gray-900 text-xs">{opt.name}</span>
                            {isSelected && <FaCheck size={10} className="text-indigo-600 shrink-0" />}
                        </div>
                        <div className="flex items-center flex-wrap gap-1.5 mt-0.5">
                            {opt.shop_name && (
                                <span className="inline-flex items-center text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-medium">
                                    <FaStore className="mr-1 text-indigo-500" size={9} />
                                    {opt.shop_name}
                                </span>
                            )}
                            {opt.email && (
                                <span className="text-[10px] text-gray-400 truncate max-w-[150px]">
                                    {opt.email}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        {opt.phone ? (
                            <span className="inline-flex items-center font-mono text-[11px] text-gray-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                <FaPhoneAlt className="mr-1 text-gray-400" size={9} />
                                {opt.phone}
                            </span>
                        ) : (
                            <span className="text-[10px] text-gray-400 italic">No phone</span>
                        )}
                    </div>
                </div>
            );
        }

        // 3. Product Option
        if (opt.selling_rate !== undefined) {
            return (
                <div className="flex items-center justify-between w-full">
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
        }

        // 4. Generic Option
        return (
            <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-gray-900 text-xs">{opt.name || opt.label}</span>
                {isSelected && <FaCheck size={10} className="text-indigo-600 shrink-0" />}
            </div>
        );
    };

    const defaultRenderSelected = (opt) => {
        if (!opt) {
            return <span className="text-gray-400 truncate">{placeholder}</span>;
        }

        // Empty option selected
        if (emptyOption && String(opt.id) === String(emptyOption.id)) {
            return (
                <div className="flex items-center space-x-2 truncate">
                    <span className="font-semibold text-gray-800 text-xs">{opt.name || opt.label}</span>
                    <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded font-medium">Default</span>
                </div>
            );
        }

        // Customer selected
        if (opt.phone !== undefined || opt.shop_name !== undefined) {
            return (
                <div className="truncate flex items-center space-x-2 text-xs">
                    <span className="font-bold text-gray-900">{opt.name}</span>
                    {opt.phone && (
                        <span className="text-gray-500 font-normal font-mono text-[11px]">
                            ({opt.phone})
                        </span>
                    )}
                    {opt.shop_name && (
                        <span className="text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px] font-medium hidden sm:inline">
                            {opt.shop_name}
                        </span>
                    )}
                </div>
            );
        }

        // Product selected
        if (opt.selling_rate !== undefined) {
            return (
                <div className="truncate text-xs">
                    <span className="font-bold text-gray-900">{opt.name}</span>
                    {opt.description && (
                        <span className="text-gray-500 text-[11px] ml-1.5 font-normal italic">
                            - {opt.description}
                        </span>
                    )}
                </div>
            );
        }

        return <span className="font-bold text-gray-900 text-xs">{opt.name || opt.label}</span>;
    };

    const hasClearableValue = emptyOption
        ? value && String(value) !== String(emptyOption.id)
        : Boolean(selectedOption && value);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {/* Input / Display Trigger Bar */}
            <div
                id={id}
                tabIndex={disabled ? -1 : 0}
                onKeyDown={handleKeyDown}
                onClick={() => {
                    if (disabled) return;
                    const nextState = !isOpen;
                    setIsOpen(nextState);
                    if (nextState) {
                        setTimeout(() => inputRef.current?.focus(), 50);
                    }
                }}
                className={`w-full flex items-center justify-between border rounded-lg px-3 py-2 text-xs cursor-pointer bg-white transition-all shadow-2xs ${
                    error
                        ? 'border-red-400 ring-2 ring-red-100 hover:border-red-500'
                        : isOpen
                        ? 'border-indigo-500 ring-2 ring-indigo-100'
                        : 'border-gray-300 hover:border-gray-400'
                } ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}`}
            >
                <div className="flex items-center flex-1 min-w-0 mr-2">
                    <Icon className="text-gray-400 mr-2 shrink-0" size={12} />
                    {renderSelected ? renderSelected(selectedOption) : defaultRenderSelected(selectedOption)}
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                    {hasClearableValue && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(emptyOption || null);
                            }}
                            className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                            title="Clear selection"
                        >
                            <FaTimes size={10} />
                        </button>
                    )}
                    <FaChevronDown
                        size={10}
                        className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`}
                    />
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && !disabled && (
                <div className="absolute z-50 mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden text-xs animate-in fade-in zoom-in-95 duration-100">
                    {/* Search Field */}
                    <div className="p-2 border-b border-gray-100 bg-gray-50 flex items-center">
                        <FaSearch className="text-gray-400 mr-2 shrink-0" size={11} />
                        <input
                            ref={inputRef}
                            type="text"
                            className="w-full bg-transparent border-0 p-0 text-xs text-gray-900 focus:ring-0 placeholder-gray-400 font-medium"
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onClick={(e) => e.stopPropagation()}
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="text-gray-400 hover:text-gray-600 p-1"
                                title="Clear search"
                            >
                                <FaTimes size={10} />
                            </button>
                        )}
                    </div>

                    {/* Options List */}
                    <div ref={listRef} className="max-h-60 overflow-y-auto divide-y divide-gray-50">
                        {filteredOptions.length === 0 ? (
                            <div className="p-4 text-center text-gray-400 font-medium text-xs">
                                No matching results for "{searchTerm}"
                            </div>
                        ) : (
                            filteredOptions.map((opt, idx) => {
                                const isSelected = isOptionSelected(opt);
                                const isHighlighted = idx === highlightedIndex;
                                return (
                                    <div
                                        key={opt.id ?? idx}
                                        onClick={() => handleSelect(opt)}
                                        onMouseEnter={() => setHighlightedIndex(idx)}
                                        className={`p-2.5 cursor-pointer flex items-center justify-between transition-colors ${
                                            isSelected
                                                ? 'bg-indigo-50/80 text-indigo-900 font-bold border-l-2 border-indigo-600 pl-2'
                                                : isHighlighted
                                                ? 'bg-gray-100/80 text-gray-900'
                                                : 'hover:bg-gray-50 text-gray-800'
                                        }`}
                                    >
                                        {renderOption ? renderOption(opt, isSelected) : defaultRenderOption(opt, isSelected)}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="px-2.5 py-1.5 bg-gray-50/90 border-t border-gray-100 text-[10px] text-gray-400 flex items-center justify-between">
                        <span>{filteredOptions.length} option{filteredOptions.length === 1 ? '' : 's'}</span>
                        <span className="hidden sm:inline">Use ↑ ↓ to navigate, Enter to select</span>
                    </div>
                </div>
            )}
        </div>
    );
}
