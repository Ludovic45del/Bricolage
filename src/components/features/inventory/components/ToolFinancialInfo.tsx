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
        <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-white/5 border border-white/10 rounded-3xl shadow-lg space-y-1 group hover:bg-white/10 transition-all">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Tarif Locatif</span>
                <div className="text-2xl font-black text-white group-hover:text-purple-400 transition-colors">
                    {formatCurrency(weeklyPrice)}
                </div>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-3xl shadow-lg space-y-1 group hover:bg-white/10 transition-all">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Valeur d'Acquisition</span>
                <div className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">
                    {purchasePrice ? formatCurrency(purchasePrice) : '--'}
                </div>

                {invoiceDoc && (
                    <button
                        onClick={() => openDocument(invoiceDoc.filePath, invoiceDoc.name)}
                        className="text-[8px] font-bold text-purple-400 hover:text-white flex items-center gap-1 uppercase tracking-wider mt-1"
                    >
                        <FileText className="w-2.5 h-2.5" /> Voir Facture
                    </button>
                )}
            </div>
        </div>
    );
};
