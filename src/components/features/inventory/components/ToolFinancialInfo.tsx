import React from 'react';
import { FileText } from 'lucide-react';
import { formatCurrency, openDocument } from '@/utils';
import { ToolDocument } from '@/types';

interface ToolFinancialInfoProps {
    weeklyPrice: number;
    purchasePrice?: number;
    invoiceDoc?: ToolDocument;
}

export const ToolFinancialInfo: React.FC<ToolFinancialInfoProps> = ({
    weeklyPrice,
    purchasePrice,
    invoiceDoc
}) => {
    return (
        <div className="grid grid-cols-2 gap-6">
            <div className="p-8 bg-white/5 border border-white/10 rounded-[32px] shadow-xl space-y-1 group hover:bg-white/10 transition-all">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tarif Locatif</span>
                <div className="text-4xl font-black text-white group-hover:text-purple-400 transition-colors">
                    {formatCurrency(weeklyPrice)}
                </div>
            </div>
            <div className="p-8 bg-white/5 border border-white/10 rounded-[32px] shadow-xl space-y-1 group hover:bg-white/10 transition-all">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Valeur d'Acquisition</span>
                <div className="text-4xl font-black text-white group-hover:text-emerald-400 transition-colors">
                    {purchasePrice ? formatCurrency(purchasePrice) : '--'}
                </div>

                {invoiceDoc && (
                    <button
                        onClick={() => openDocument(invoiceDoc.filePath, invoiceDoc.name)}
                        className="text-[9px] font-bold text-purple-400 hover:text-white flex items-center gap-1 uppercase tracking-widest mt-2"
                    >
                        <FileText className="w-3 h-3" /> Voir Facture
                    </button>
                )}
            </div>
        </div>
    );
};
