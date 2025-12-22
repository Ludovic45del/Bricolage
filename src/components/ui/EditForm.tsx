import React, { useState, useEffect, useRef } from 'react';
import { Tool, ToolImage, ToolDocument } from '../../api/types';
import { Button } from './Button';
import { DatePicker } from './DatePicker';
import { X, Image as ImageIcon, Upload, FileText, Paperclip, Plus, CheckCircle, ChevronDown, FolderPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Custom Category Dropdown Component
interface CategoryDropdownProps {
    value: string;
    categories: string[];
    onChange: (value: string) => void;
    onAddCategory?: (name: string) => void;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({ value, categories, onChange, onAddCategory }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [newCategoryInput, setNewCategoryInput] = useState('');
    const [isAddingNew, setIsAddingNew] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
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
            onChange(newCategoryInput.trim());
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
                    {value || '-- Sélectionner --'}
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
                            {categories.map((cat, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => {
                                        onChange(cat);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-4 py-2.5 text-left text-sm transition-all ${value === cat
                                            ? 'bg-purple-500/20 text-purple-300 font-bold'
                                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    {cat}
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

interface EditFormProps {
    tool?: Tool; // Optional tool, if not provided it's an "Add" form
    onSave: (tool: Partial<Tool>) => void;
    onCancel: () => void;
    categories: string[];
    onAddCategory?: (categoryName: string) => void;
    openDocument: (url: string, name: string) => void;
}

export const EditForm: React.FC<EditFormProps> = ({ tool, onSave, onCancel, categories, onAddCategory, openDocument }) => {
    const [formData, setFormData] = useState<Partial<Tool>>(tool || {});

    useEffect(() => {
        if (tool) {
            setFormData(tool);
        }
    }, [tool]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach((file: File) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const newImage: ToolImage = {
                        id: Date.now().toString() + Math.random(),
                        toolId: formData.id || '',
                        filePath: reader.result as string,
                        displayOrder: (formData.images?.length || 0) + 1,
                        isPrimary: false,
                        createdAt: new Date().toISOString()
                    };
                    setFormData(prev => ({
                        ...prev,
                        images: [...(prev.images || []), newImage]
                    }));
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: (prev.images || []).filter((_, i) => i !== index)
        }));
    };

    // Helper to handle documents of specific types
    const handleSpecialDocUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'invoice' | 'manual' | 'ce_cert') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newDoc: ToolDocument = {
                    id: Date.now().toString() + Math.random(),
                    toolId: formData.id || '',
                    name: file.name,
                    type: type,
                    filePath: reader.result as string,
                    uploadedAt: new Date().toISOString()
                };

                // Remove existing doc of same type if any (enforce 1 invoice/manual/cert)
                const otherDocs = (formData.documents || []).filter(d => d.type !== type);
                setFormData(prev => ({
                    ...prev,
                    documents: [...otherDocs, newDoc]
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeSpecialDoc = (type: 'invoice' | 'manual' | 'ce_cert') => {
        setFormData(prev => ({
            ...prev,
            documents: (prev.documents || []).filter(d => d.type !== type)
        }));
    };

    // Generic documents
    const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach((file: File) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const newDoc: ToolDocument = {
                        id: Date.now().toString() + Math.random(),
                        toolId: formData.id || '',
                        name: file.name,
                        type: 'other',
                        filePath: reader.result as string,
                        uploadedAt: new Date().toISOString()
                    };
                    setFormData(prev => ({
                        ...prev,
                        documents: [...(prev.documents || []), newDoc]
                    }));
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeDoc = (index: number) => {
        // Filter only 'other' docs to match index relative to list? 
        // Strategy: use ID if possible, but index is tricky if mixed.
        // We filter 'other' docs for display loop, so index corresponds to that filtered list.
        // Effectively we need to find the doc at that index among 'other' docs and remove it.

        const otherDocs = (formData.documents || []).filter(d => d.type === 'other' || d.type === undefined); // undefined fallback
        const docToRemove = otherDocs[index];
        if (docToRemove) {
            setFormData(prev => ({
                ...prev,
                documents: (prev.documents || []).filter(d => d !== docToRemove)
            }));
        }
    };

    const manualDoc = formData.documents?.find(d => d.type === 'manual');
    const ceCertDoc = formData.documents?.find(d => d.type === 'ce_cert');
    const invoiceDoc = formData.documents?.find(d => d.type === 'invoice');

    return (
        <form id="edit-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-[1400px] mx-auto">
            {/* LEFT COLUMN: Main Info */}
            <div className="space-y-8">
                <div className="glass-card p-8 bg-white/5 border border-white/10 rounded-[32px] space-y-6">
                    <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-2">
                        <FileText className="w-3.5 h-3.5" /> Informations Générales
                    </h4>

                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nom de l'Outil</label>
                        <input
                            required
                            type="text"
                            className="block w-full rounded-2xl glass-input p-4 text-base font-bold text-white transition-all focus:ring-0 placeholder:text-gray-600 shadow-inner"
                            placeholder="Ex: Perceuse sans fil Makita"
                            value={formData.title || ''}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    {/* Cat + Price Row */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Catégorie</label>
                            <CategoryDropdown
                                value={formData.categoryId || ''}
                                categories={categories}
                                onChange={(val) => setFormData({ ...formData, categoryId: val })}
                                onAddCategory={onAddCategory}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Tarif Locatif/Sem (€)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 font-bold text-sm">€</span>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    step="0.50"
                                    className="block w-full rounded-2xl glass-input p-3.5 pl-10 text-sm transition-all focus:ring-0 font-bold"
                                    value={formData.weeklyPrice || 0}
                                    onChange={e => setFormData({ ...formData, weeklyPrice: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Description</label>
                        <textarea
                            required
                            rows={4}
                            className="block w-full rounded-2xl glass-input p-4 text-sm transition-all focus:ring-0 resize-none leading-relaxed placeholder:text-gray-600"
                            placeholder="Description détaillée de l'outil et de ses accessoires..."
                            value={formData.description || ''}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>

                {/* Images Section */}
                <div className="glass-card p-8 bg-white/5 border border-white/10 rounded-[32px] space-y-6">
                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-2">
                        <ImageIcon className="w-3.5 h-3.5" /> Galerie Photos
                    </h4>
                    <div className="grid grid-cols-4 md:grid-cols-5 gap-4">
                        {(formData.images || []).map((img, index) => (
                            <div key={index} className="relative group/img aspect-square rounded-[20px] overflow-hidden shadow-xl border border-white/10 bg-slate-900/50">
                                <img src={img.filePath} alt={`Preview ${index}`} className="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-110" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="p-2 bg-rose-500 rounded-full text-white shadow-lg hover:scale-110 transition-transform"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <label className="cursor-pointer aspect-square flex flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-white/10 bg-white/5 text-gray-500 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-center group">
                            <Plus className="w-6 h-6 mb-1 text-purple-400 group-hover:scale-110 transition-transform" />
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] leading-tight text-gray-400 group-hover:text-purple-300">Ajouter</span>
                            <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                        </label>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Finances & Docs */}
            <div className="space-y-8">
                {/* Acquisition & Valuation */}
                <div className="glass-card p-8 bg-white/5 border border-white/10 rounded-[32px] space-y-6">
                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-2">
                        <Upload className="w-3.5 h-3.5" /> Acquisition & Valeur
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Prix d'Achat (€)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="block w-full rounded-2xl glass-input p-3.5 text-sm transition-all focus:ring-0 font-bold"
                                placeholder="0.00"
                                value={formData.purchasePrice || ''}
                                onChange={e => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Date d'Acquisition</label>
                            <DatePicker
                                date={formData.purchaseDate || ''}
                                onChange={d => setFormData({ ...formData, purchaseDate: d })}
                                placeholder="JJ/MM/AAAA"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        {invoiceDoc ? (
                            <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl group transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-300/80 uppercase tracking-widest">Facture d'achat jointe</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => openDocument(invoiceDoc.filePath, invoiceDoc.name)} className="p-2 text-gray-500 hover:text-white transition-colors">
                                        <Upload className="w-4 h-4" />
                                    </button>
                                    <button type="button" onClick={() => removeSpecialDoc('invoice')} className="p-2 text-rose-400/50 hover:text-rose-400 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label className="cursor-pointer flex items-center justify-center gap-3 p-5 bg-white/5 border border-dashed border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 rounded-2xl transition-all group">
                                <Upload className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black text-gray-400 group-hover:text-emerald-300 uppercase tracking-widest">Joindre une facture</span>
                                <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleSpecialDocUpload(e, 'invoice')} />
                            </label>
                        )}
                    </div>
                </div>

                {/* Technical Documentation */}
                <div className="glass-card p-8 bg-white/5 border border-white/10 rounded-[32px] space-y-6">
                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-2">
                        <Paperclip className="w-3.5 h-3.5" /> Documentation Technique
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Notice */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Notice d'utilisation</label>
                            <div className="relative group/doc">
                                <input
                                    type="text"
                                    className="block w-full rounded-2xl glass-input p-3 pl-4 pr-12 text-[11px] transition-all focus:ring-0 truncate font-medium text-white/70"
                                    placeholder="Fichier joint..."
                                    readOnly
                                    value={manualDoc ? manualDoc.name : ''}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    {manualDoc ? (
                                        <button type="button" onClick={() => removeSpecialDoc('manual')} className="p-1.5 text-rose-400/50 hover:text-rose-400 transition-colors"><X className="w-3.5 h-3.5" /></button>
                                    ) : (
                                        <label className="cursor-pointer p-1.5 text-gray-500 hover:text-blue-400 transition-colors">
                                            <Upload className="w-3.5 h-3.5" />
                                            <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => handleSpecialDocUpload(e, 'manual')} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* CE Cert */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Certificat CE</label>
                            <div className="relative group/doc">
                                <input
                                    type="text"
                                    className="block w-full rounded-2xl glass-input p-3 pl-4 pr-12 text-[11px] transition-all focus:ring-0 truncate font-medium text-white/70"
                                    placeholder="Fichier joint..."
                                    readOnly
                                    value={ceCertDoc ? ceCertDoc.name : ''}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    {ceCertDoc ? (
                                        <button type="button" onClick={() => removeSpecialDoc('ce_cert')} className="p-1.5 text-rose-400/50 hover:text-rose-400 transition-colors"><X className="w-3.5 h-3.5" /></button>
                                    ) : (
                                        <label className="cursor-pointer p-1.5 text-gray-500 hover:text-blue-400 transition-colors">
                                            <Upload className="w-3.5 h-3.5" />
                                            <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => handleSpecialDocUpload(e, 'ce_cert')} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Other Documents Tags */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Fichiers Complémentaires</label>
                        <div className="flex flex-wrap gap-2">
                            {(formData.documents || []).filter(d => d.type === 'other').map((doc, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-2 pl-3 pr-2 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all group/tag"
                                >
                                    <span
                                        onClick={() => openDocument(doc.filePath, doc.name)}
                                        className="text-[10px] font-bold text-gray-400 group-hover/tag:text-purple-400 cursor-pointer truncate max-w-[150px]"
                                    >
                                        {doc.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); removeDoc(idx); }}
                                        className="p-1 text-gray-600 hover:text-rose-400 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            <label className="cursor-pointer px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
                                <Plus className="w-3.5 h-3.5" /> <span className="text-[9px] font-black uppercase tracking-widest">Nouveau</span>
                                <input type="file" className="hidden" multiple onChange={handleDocUpload} />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-6 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-[0.3em] transition-colors"
                    >
                        Annuler les modifications
                    </button>
                    <Button
                        type="submit"
                        className="px-10 py-4 rounded-[20px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_15px_30px_-10px_rgba(16,185,129,0.5)] transition-all hover:scale-[1.01] active:scale-95 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2"
                    >
                        <CheckCircle className="w-4 h-4" /> Enregistrer l'Outil
                    </Button>
                </div>
            </div>
        </form>
    );
};
