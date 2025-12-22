import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, CheckCircle, FolderPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Find the current category name for display
    const currentCategory = categories.find(c => c.id === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setIsAddingNew(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddNew = () => {
        if (newCategoryInput.trim()) {
            if (onAddCategory) {
                onAddCategory(newCategoryInput.trim());
            }
            // For new categories, we might not have the ID yet if it's async.
            // But usually the parent handler will call onChange once it's created.
            setNewCategoryInput('');
            setIsAddingNew(false);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between rounded-2xl glass-input p-3.5 text-sm transition-all hover:border-purple-500/30 cursor-pointer"
            >
                <span className={value ? 'text-white font-medium' : 'text-gray-500'}>
                    {currentCategory?.name || value || '-- Sélectionner --'}
                </span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 w-full mt-2 py-2 rounded-2xl glass-card border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden"
                    >
                        <div className="max-h-[200px] overflow-y-auto no-scrollbar">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => {
                                        onChange(cat.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-4 py-2.5 text-left text-sm transition-all ${value === cat.id
                                        ? 'bg-purple-500/20 text-purple-300 font-bold'
                                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    {cat.name}
                                </button>
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
                                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-purple-400 hover:bg-purple-500/10 transition-all"
                                >
                                    <FolderPlus className="w-4 h-4" />
                                    Nouvelle catégorie...
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
