import React from 'react';
import { Modal } from '../ui/Modal';
import { Transaction, TransactionType } from '../../constants';
import { formatCurrency, formatDate } from '../../utils';
import { CheckCircle2, Clock, Wrench as ToolIcon, CreditCard, Receipt, FileCheck, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Tool } from '../../api/types';

interface TransactionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction;
    user: { name: string } | undefined;
    tool: Tool | undefined;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
    isOpen,
    onClose,
    transaction,
    user,
    tool
}) => {
    if (!transaction) return null;

    const isPayment = transaction.type === TransactionType.PAYMENT;
    const absAmount = Math.abs(transaction.amount);

    // Simulated workflow steps for the prototype
    const txDate = new Date(transaction.date);
    const steps = [
        { label: 'Créée', time: new Date(transaction.date).toLocaleString(), icon: Clock, completed: true },
        { label: 'Finalisée', time: new Date(transaction.date).toLocaleString(), icon: CheckCircle2, completed: true },
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isPayment ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400'}`}>
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Détails Transaction</h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">ID: {transaction.id}</p>
                    </div>
                </div>
            }
        >
            <div className="p-8 space-y-10">
                {/* Status & Amount Hero */}
                <div className="flex flex-col items-center justify-center py-6 glass-card border-white/5 bg-white/5 rounded-[32px] gap-4">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Montant Total</span>
                        <h3 className={`text-5xl font-black tracking-tighter ${isPayment ? 'text-emerald-400' : 'text-purple-400'}`}>
                            {isPayment ? '+' : '-'}{formatCurrency(absAmount)}
                        </h3>
                    </div>

                    <div className="flex gap-2">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${isPayment ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-purple-400/10 text-purple-300 border-purple-400/20'
                            }`}>
                            {transaction.type === TransactionType.PAYMENT ? 'Encaissement' :
                                transaction.type === TransactionType.RENTAL ? 'Location' :
                                    transaction.type === TransactionType.MEMBERSHIP_FEE ? 'Adhésion' : 'Maintenance'}
                        </span>
                        {isPayment && (
                            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                {transaction.method}
                            </span>
                        )}
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="glass-card p-5 border-white/5 space-y-1">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Payeur</p>
                        <p className="text-sm font-bold text-white">{user?.name || 'Utilisateur inconnu'}</p>
                    </div>
                    <div className="glass-card p-5 border-white/5 space-y-1">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Date Officielle</p>
                        <p className="text-sm font-bold text-white">{formatDate(transaction.date)}</p>
                    </div>
                    {tool && (
                        <div className="col-span-2 glass-card p-5 border-white/5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                                <ToolIcon className="w-6 h-6 text-purple-300" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Outil Associé</p>
                                <p className="text-sm font-bold text-white">{tool.title}</p>
                            </div>
                        </div>
                    )}
                    <div className="col-span-2 glass-card p-5 border-white/5 space-y-1">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Description / Note</p>
                        <p className="text-sm text-gray-400 italic">"{transaction.description || 'Aucune description fournie.'}"</p>
                    </div>
                </div>

                {/* Progress Workflow - 4 Steps */}
                <div className="space-y-6 pt-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        Traitement de la Transaction
                    </h4>

                    <div className="relative">
                        {/* Vertical line connecting steps */}
                        <div className="absolute left-6 top-4 bottom-4 w-px bg-white/5 z-0"></div>

                        <div className="space-y-8 relative z-10">
                            {steps.map((step, idx) => (
                                <div key={idx} className="flex items-start gap-5 group cursor-default">
                                    <div className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 ${step.completed
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)] scale-110'
                                        : 'bg-slate-900 border-white/5 text-gray-600'
                                        }`}>
                                        <step.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 pt-1.5 translate-y-0.5">
                                        <div className="flex items-center justify-between">
                                            <p className={`text-xs font-black uppercase tracking-widest ${step.completed ? 'text-white' : 'text-gray-600'}`}>
                                                {step.label}
                                            </p>
                                            <p className="text-[10px] font-medium text-gray-500 tabular-nums">{step.time}</p>
                                        </div>
                                        <p className="text-[9px] text-gray-600 mt-1 uppercase tracking-tighter">
                                            {idx === 0 ? 'Enregistrement initial' :
                                                idx === 1 ? 'Vérification des fonds' :
                                                    idx === 2 ? 'Approbation administrative' : 'Clôture de l\'opération'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Partial Payment Warning */}
                {!isPayment && transaction.amount > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-center gap-4">
                        <div className="p-2 bg-amber-500/10 rounded-xl">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[11px] font-bold text-amber-100 italic">"Cette créance est en attente de régularisation totale."</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-8 border-t border-white/5 bg-white/2">
                <Button onClick={onClose} variant="secondary" className="w-full py-4 border-white/10 glass-card">
                    Fermer les détails
                </Button>
            </div>
        </Modal>
    );
};

const DollarSign = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
);
