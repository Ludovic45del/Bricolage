import React from 'react';
import { Paperclip, FileText, Trash2, Upload, CheckCircle } from 'lucide-react';
import { formatDate } from '@/utils';
import { Button } from './Button';

interface MaintenanceAttachmentsSectionProps {
    documents: { name: string; url: string; date: string }[];
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeDocument: (index: number) => void;
}

export const MaintenanceAttachmentsSection: React.FC<MaintenanceAttachmentsSectionProps> = ({
    documents,
    handleFileUpload,
    removeDocument
}) => {
    return (
        <div className="glass-card p-5 bg-white/5 border border-white/10 rounded-[32px] flex flex-col h-full">
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                <Paperclip className="w-3.5 h-3.5" /> Pièces Jointes & Rapports
            </h4>

            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                    {documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-2xl group transition-all">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="p-1.5 bg-purple-500/10 rounded-xl text-purple-400 group-hover:scale-110 transition-transform">
                                    <FileText className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] font-bold text-white truncate">{doc.name}</span>
                                    <span className="text-[8px] text-gray-600 font-medium">{formatDate(doc.date)}</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeDocument(idx)}
                                className="p-1.5 text-gray-600 hover:text-rose-400 transition-colors opacity-40 group-hover:opacity-100"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>

                <label className="cursor-pointer flex flex-col items-center justify-center gap-2 p-6 bg-white/5 border-2 border-dashed border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 rounded-3xl transition-all group">
                    <Upload className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                    <div className="text-center">
                        <p className="text-[9px] font-black text-gray-400 group-hover:text-purple-300 uppercase tracking-widest">Ajouter un document</p>
                        <p className="text-[8px] text-gray-600 mt-0.5 uppercase tracking-tighter">PDF, Images</p>
                    </div>
                    <input
                        type="file"
                        multiple
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                </label>
            </div>

            <div className="flex items-center justify-end pt-6 mt-auto">
                <Button
                    type="submit"
                    className="w-full py-4 rounded-[20px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_15px_30px_-10px_rgba(16,185,129,0.5)] transition-all hover:scale-[1.01] active:scale-95 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                    <CheckCircle className="w-4 h-4" /> Enregistrer les Modifications
                </Button>
            </div>
        </div>
    );
};
