import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, CheckCircle, FolderPlus } from 'lucide-react';
import { Category } from '@/hooks/data/useCategoriesQuery';

interface CategoryDropdownProps {
    value: string; // This will be the categoryId
    categories: Category[];
    onChange: (id: string) => void;
    onAddCategory?: (name: string) => void;
}

export const CategoryDropdown: React.FC<CategoryDropdownProps> = ({ value, categories, onChange, onAddCategory }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [newCategoryInput, setNewCategoryInput] = useState('');
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, openUpwards: false });
    const containerRef = useRef<HTMLDivElement>(null);

    // Find the current category name for display
    const currentCategory = categories.find(c => c.id === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                const portal = document.getElementById('category-dropdown-portal');
                if (portal && portal.contains(event.target as Node)) return;
                setIsOpen(false);
                setIsAddingNew(false);
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
            const openUpwards = spaceBelow < 300 && rect.top > 300;

            setCoords({
                top: openUpwards ? rect.top - 8 : rect.bottom + 8,
                left: rect.left,
                width: rect.width,
                openUpwards
            });
        }
    };

    const handleAddNew = () => {
        if (newCategoryInput.trim()) {
            if (onAddCategory) {
                onAddCategory(newCategoryInput.trim());
            }
            setNewCategoryInput('');
            setIsAddingNew(false);
            setIsOpen(false);
        }
    };

    return (
        <div className="space-y-2 relative" ref={containerRef}>
            <div
                className={`glass-input h-11 px-6 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-300 ${isOpen ? 'border-purple-500/50 bg-white/10 shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 'hover:bg-white/5'
                    }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`text-sm ${currentCategory ? 'text-white font-medium' : 'text-gray-500'}`}>
                    {currentCategory?.name || '-- Sélectionner --'}
                </span>
                <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform duration-500 ${isOpen ? 'rotate-180 text-purple-400' : ''}`}
                />
            </div>

            {isOpen && createPortal(
                <div
                    id="category-dropdown-portal"
                    style={{
                        position: 'fixed',
                        top: coords.top,
                        left: coords.left,
                        width: coords.width,
                        transform: coords.openUpwards ? 'translateY(-100%)' : 'none'
                    }}
                    className="z-[99999] liquid-glass rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden animate-fade-in py-2 border border-white/10 backdrop-blur-3xl"
                >
                    <div className="max-h-60 overflow-y-auto no-scrollbar">
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                className={`px-6 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between gap-3 ${value === cat.id
                                        ? 'bg-purple-500/10 text-white font-bold border-l-2 border-purple-500'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                                onClick={() => {
                                    onChange(cat.id);
                                    setIsOpen(false);
                                }}
                            >
                                <span className="flex-1">{cat.name}</span>
                                {value === cat.id && <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>}
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-white/10 mt-2 pt-2 px-2">
                        {isAddingNew ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newCategoryInput}
                                    onChange={(e) => setNewCategoryInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddNew()}
                                    placeholder="Nom de la catégorie..."
                                    className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={handleAddNew}
                                    className="px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsAddingNew(true)}
                                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-purple-400 hover:bg-purple-500/10 transition-all"
                            >
                                <FolderPlus className="w-4 h-4" />
                                Nouvelle catégorie...
                            </button>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
