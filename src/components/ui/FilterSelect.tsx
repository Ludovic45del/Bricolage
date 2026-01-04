import React, { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface FilterOption {
    value: string;
    label: string;
}

interface FilterSelectProps {
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = "Sélectionner...",
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optValue: string) => {
        onChange(optValue);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center justify-between gap-3 px-4 py-2.5 min-w-[140px]
                    bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 
                    rounded-xl text-sm text-white
                    hover:border-gray-600 hover:bg-gray-800/80
                    focus:outline-none focus:border-purple-500/50
                    transition-all duration-200
                    ${isOpen ? 'border-purple-500/50 bg-gray-800/80' : ''}
                `}
            >
                <span className="truncate">{selectedOption?.label || placeholder}</span>
                {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-full min-w-[180px] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
                        <div className="py-2">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    className={`
                                        w-full px-4 py-2.5 text-left text-sm transition-all duration-150
                                        flex items-center justify-between group
                                        ${value === option.value
                                            ? 'text-white bg-white/5'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'}
                                    `}
                                >
                                    <span>{option.label}</span>
                                    {value === option.value && (
                                        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
