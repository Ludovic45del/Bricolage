import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

interface Option {
    id: string;
    name: string;
    [key: string]: any;
}

interface SelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    className?: string;
    required?: boolean;
}

export const Select: React.FC<SelectProps> = ({
    options,
    value,
    onChange,
    placeholder = "Sélectionner...",
    label,
    className = "",
    required = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, openUpwards: false });
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options?.find(opt => opt.id === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                const portal = document.getElementById('select-portal');
                if (portal && portal.contains(event.target as Node)) return;
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen]);

    const updatePosition = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const openUpwards = spaceBelow < 250 && rect.top > 250; // Dropdown is ~250px max

            setCoords({
                top: openUpwards ? rect.top - 8 : rect.bottom + 8,
                left: rect.left,
                width: rect.width,
                openUpwards
            });
        }
    };

    return (
        <div className={`space-y-2 relative ${className}`} ref={containerRef}>
            {label && (
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 block">
                    {label}
                </label>
            )}

            <div
                className={`glass-input h-11 px-6 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-300 ${isOpen ? 'border-purple-500/50 bg-white/10 shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 'hover:bg-white/5'
                    }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`text-sm ${selectedOption ? 'text-white font-medium' : 'text-gray-500'}`}>
                    {selectedOption ? selectedOption.name : placeholder}
                </span>
                <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform duration-500 ${isOpen ? 'rotate-180 text-purple-400' : ''}`}
                />
            </div>

            {isOpen && createPortal(
                <div
                    id="select-portal"
                    style={{
                        position: 'fixed',
                        top: coords.top,
                        left: coords.left,
                        width: coords.width,
                        transform: coords.openUpwards ? 'translateY(-100%)' : 'none'
                    }}
                    className="z-[99999] liquid-glass rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden animate-fade-in py-2 border border-white/10 backdrop-blur-3xl"
                >
                    {options.length === 0 ? (
                        <div className="px-6 py-3 text-xs text-gray-500 italic">Aucune option</div>
                    ) : (
                        <div className="max-h-60 overflow-y-auto no-scrollbar">
                            {options.map((option) => (
                                <div
                                    key={option.id}
                                    className={`px-6 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${value === option.id
                                        ? 'bg-purple-500/10 text-white font-bold border-l-2 border-purple-500'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                    onClick={() => {
                                        onChange(option.id);
                                        setIsOpen(false);
                                    }}
                                >
                                    <span>{option.name}</span>
                                    {value === option.id && <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>,
                document.body
            )}

            {required && (
                <input
                    type="hidden"
                    value={value}
                    required
                />
            )}
        </div>
    );
};
