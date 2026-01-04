import React from 'react';
import { Upload, FileText, Paperclip, X, Plus } from 'lucide-react';
import { Tool, ToolDocument } from '@/types';
import { DatePicker } from './DatePicker';

interface DocumentationSectionProps {
    formData: Partial<Tool>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<Tool>>>;
    handleSpecialDocUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'invoice' | 'manual' | 'ce_cert') => void;
    removeSpecialDoc: (type: 'invoice' | 'manual' | 'ce_cert') => void;
    handleDocUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeDoc: (index: number) => void;
    openDocument: (url: string, name: string) => void;
}

export const DocumentationSection: React.FC<DocumentationSectionProps> = ({
    formData,
    setFormData,
    handleSpecialDocUpload,
    removeSpecialDoc,
    handleDocUpload,
    removeDoc,
    openDocument
}) => {
    const manualDoc = formData.documents?.find(d => d.type === 'manual');
    const ceCertDoc = formData.documents?.find(d => d.type === 'ce_cert');
    const invoiceDoc = formData.documents?.find(d => d.type === 'invoice');

    return (
        <div className="space-y-8">
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
                            style={{ color: '#ffffff' }}
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

            <div className="glass-card p-8 bg-white/5 border border-white/10 rounded-[32px] space-y-6">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-2">
                    <Paperclip className="w-3.5 h-3.5" /> Documentation Technique
                </h4>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Notice d'utilisation</label>
                        <div className="relative group/doc">
                            <input
                                type="text"
                                className="block w-full rounded-2xl glass-input p-3 pl-4 pr-12 text-[11px] transition-all focus:ring-0 truncate font-medium text-white"
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

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Certificat CE</label>
                        <div className="relative group/doc">
                            <input
                                type="text"
                                className="block w-full rounded-2xl glass-input p-3 pl-4 pr-12 text-[11px] transition-all focus:ring-0 truncate font-medium text-white"
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

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Fichiers Complémentaires</label>
                    <div className="flex flex-wrap gap-2">
                        {(formData.documents || []).filter(d => d.type === 'other' || d.type === undefined).map((doc, idx) => (
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
        </div>
    );
};
