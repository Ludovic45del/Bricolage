import React from 'react';
import { FileText, ImageIcon, Plus, X } from 'lucide-react';
import { Tool, ToolImage } from '@/types';
import { CategoryDropdown } from './CategoryDropdown';
import { Category } from '@/hooks/data/useCategoriesQuery';

interface GeneralInfoSectionProps {
    formData: Partial<Tool>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<Tool>>>;
    categories: Category[];
    onAddCategory?: (name: string) => void;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeImage: (index: number) => void;
}

export const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({
    formData,
    setFormData,
    categories,
    onAddCategory,
    handleImageUpload,
    removeImage
}) => {
    return (
        <div className="space-y-8">
            <div className="glass-card p-8 bg-white/5 border border-white/10 rounded-[32px] space-y-6">
                <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-2">
                    <FileText className="w-3.5 h-3.5" /> Informations Générales
                </h4>

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

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Description</label>
                    <textarea
                        required
                        rows={4}
                        style={{ color: '#ffffff' }}
                        className="block w-full rounded-2xl glass-input p-4 text-sm transition-all focus:ring-0 resize-none leading-relaxed"
                        placeholder="Description détaillée de l'outil et de ses accessoires..."
                        value={formData.description || ''}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>
            </div>

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
    );
};
