import React from 'react';
import { FileText, Shield, Paperclip, ChevronRight } from 'lucide-react';
import { openDocument } from '@/utils';
import { ToolDocument } from '@/types';

interface ToolDocumentsSectionProps {
    manualDoc?: ToolDocument;
    ceCertDoc?: ToolDocument;
    otherDocs?: ToolDocument[];
}

export const ToolDocumentsSection: React.FC<ToolDocumentsSectionProps> = ({
    manualDoc,
    ceCertDoc,
    otherDocs
}) => {
    return (
        <div className="space-y-4">
            <h6 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2">Documentation Technique</h6>
            <div className="grid grid-cols-2 gap-3">
                {manualDoc && (
                    <button
                        onClick={() => openDocument(manualDoc.filePath, 'notice')}
                        className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Notice d'utilisation</span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-gray-600" />
                    </button>
                )}

                {ceCertDoc && (
                    <button
                        onClick={() => openDocument(ceCertDoc.filePath, 'certificat_ce')}
                        className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <Shield className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">Certificat CE</span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-gray-600" />
                    </button>
                )}

                {otherDocs && otherDocs.map((doc, idx) => (
                    <button
                        key={idx}
                        onClick={() => openDocument(doc.filePath, doc.name)}
                        className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group col-span-2"
                    >
                        <div className="flex items-center gap-3">
                            <Paperclip className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest truncate max-w-[200px]">{doc.name}</span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-gray-600" />
                    </button>
                ))}
            </div>
        </div>
    );
};
