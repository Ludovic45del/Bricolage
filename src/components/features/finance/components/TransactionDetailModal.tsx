import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Transaction, TransactionType, PaymentMethod } from '@/types';
import { formatCurrency, formatDate } from '@/utils';
import { CheckCircle2, Clock, CreditCard, ShieldCheck, AlertCircle, Circle, Banknote, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

interface TransactionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
    rentals?: Array<{ id: string; toolId: string; startDate: string; endDate: string; tool?: { title: string } }>;
    onWorkflowChange?: (transactionId: string, newStep: 'requested' | 'in_progress' | 'tool_returned' | 'completed') => void;
    onMarkAsPaid?: (transactionId: string, paymentMethod: string) => void;
}

// Workflow steps for rentals (3 steps)
const RENTAL_WORKFLOW_STEPS = [
    { key: 'requested', label: 'Demande effectuée', description: 'Réservation créée', icon: Clock },
    { key: 'in_progress', label: 'En cours', description: 'Outil en location', icon: Receipt },
    { key: 'tool_returned', label: 'Outil Retourné', description: 'Location terminée', icon: ShieldCheck },
] as const;

// Workflow steps for membership renewals (2 steps - even simpler)
const MEMBERSHIP_WORKFLOW_STEPS = [
    { key: 'requested', label: 'Demande effectuée', description: 'Renouvellement demandé', icon: Clock },
    { key: 'completed', label: 'Validé', description: 'Adhésion validée', icon: ShieldCheck },
] as const;

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Espèces', icon: Banknote },
    { value: 'card', label: 'Carte', icon: CreditCard },
    { value: 'check', label: 'Chèque', icon: Receipt },
];

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
    isOpen,
    onClose,
    transaction,
    rentals = [],
    onWorkflowChange,
    onMarkAsPaid,
}) => {

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cash');

    // Update selected payment method when transaction changes
    useEffect(() => {
        if (transaction?.method) {
            setSelectedPaymentMethod(transaction.method);
        } else {
            setSelectedPaymentMethod('cash');
        }
    }, [transaction?.method, transaction?.id]);

    if (!transaction) return null;

    const isPayment = transaction.type === TransactionType.PAYMENT;
    const isMembership = transaction.type === TransactionType.MEMBERSHIP_FEE;
    const absAmount = Math.abs(transaction.amount);
    const currentStep = transaction.workflowStep || 'requested';

    // Use appropriate workflow based on transaction type
    const WORKFLOW_STEPS = isMembership ? MEMBERSHIP_WORKFLOW_STEPS : RENTAL_WORKFLOW_STEPS;
    const currentStepIndex = WORKFLOW_STEPS.findIndex(step => step.key === currentStep);

    // Extract tool name from description (format: "Location: Nom de l'outil")
    const getToolName = () => {
        if (transaction?.description) {
            const match = transaction.description.match(/Location:\s*(.+)/);
            if (match) return match[1];
        }
        return null;
    };
    const toolName = getToolName();

    // Find related rental for period
    const relatedRental = rentals.find(r =>
        r.tool?.title && transaction?.description?.includes(r.tool.title)
    );


    const handleStepClick = (stepKey: string) => {
        if (onWorkflowChange && stepKey !== currentStep) {
            onWorkflowChange(transaction.id, stepKey as 'requested' | 'in_progress' | 'tool_returned' | 'completed');
        }
    };

    const handleMarkAsPaid = () => {
        if (onMarkAsPaid) {
            onMarkAsPaid(transaction.id, selectedPaymentMethod);
        }
    };

    const getStepStatus = (index: number) => {
        if (index < currentStepIndex) return 'completed';
        if (index === currentStepIndex) return 'current';
        return 'upcoming';
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="lg"
            title={
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isPayment ? 'bg-emerald-500/20 text-emerald-400' : isMembership ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Détails Transaction</h2>
                </div>
            }

        >
            <div className="p-6 space-y-4">
                {/* Status & Amount Hero */}
                <div className="flex flex-col items-center justify-center py-6 glass-card border-white/5 bg-white/5 rounded-[24px] gap-3">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Montant Total</span>
                        <h3 className={`text-5xl font-black tracking-tighter ${isPayment ? 'text-emerald-400' : isMembership ? 'text-blue-400' : 'text-purple-400'}`}>
                            {isPayment ? '+' : ''}{formatCurrency(absAmount)}
                        </h3>
                    </div>

                    <div className="flex gap-2 flex-wrap justify-center">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-md ${isPayment ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' :
                            isMembership ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' :
                                'bg-purple-400/10 text-purple-300 border-purple-400/20'
                            }`}>
                            {transaction.type === TransactionType.PAYMENT ? 'Encaissement' :
                                transaction.type === TransactionType.RENTAL ? 'Location' :
                                    transaction.type === TransactionType.MEMBERSHIP_FEE ? 'Adhésion' : 'Maintenance'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${transaction.status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                            }`}>
                            {transaction.status === 'paid' ? 'Payé' : 'En attente'}
                        </span>
                    </div>
                </div>

                {/* Info Grid - 2x2 */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="glass-card p-4 rounded-xl border border-white/10 space-y-1">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Utilisateur</p>
                        <p className="text-sm font-bold text-white">{transaction.user?.name || 'Utilisateur inconnu'}</p>
                    </div>
                    <div className="glass-card p-4 rounded-xl border border-white/10 space-y-1">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Date</p>
                        <p className="text-sm font-bold text-white">{formatDate(transaction.date)}</p>
                    </div>

                    {/* Tool Name - for rentals */}
                    {toolName && (
                        <div className="glass-card p-4 rounded-xl border border-white/10 space-y-1 col-span-2">
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Outil</p>
                            <p className="text-sm font-bold text-white">{toolName}</p>
                        </div>
                    )}

                    {/* Rental Period */}
                    {toolName && rentals.length > 0 && (() => {
                        const matchedRental = rentals.find(r => {
                            const toolMatches = r.tool?.title && (
                                toolName.toLowerCase().includes(r.tool.title.toLowerCase()) ||
                                r.tool.title.toLowerCase().includes(toolName.toLowerCase())
                            );
                            return toolMatches;
                        });

                        if (matchedRental) {
                            return (
                                <div className="glass-card p-4 rounded-xl border border-white/10 space-y-1 col-span-2">
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Période de Location</p>
                                    <p className="text-sm font-bold text-white">
                                        {formatDate(matchedRental.startDate)} → {formatDate(matchedRental.endDate)}
                                    </p>
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>

                {/* Payment Section - Only show if not paid */}
                {transaction.status !== 'paid' && (
                    <div className="space-y-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Paiement
                        </h4>

                        {/* Payment Method Selector */}
                        <div className="grid grid-cols-3 gap-2">
                            {PAYMENT_METHODS.map((method) => {
                                const MethodIcon = method.icon;
                                const isSelected = selectedPaymentMethod === method.value;
                                return (
                                    <button
                                        key={method.value}
                                        onClick={() => setSelectedPaymentMethod(method.value)}
                                        className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${isSelected
                                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <MethodIcon className="w-5 h-5" />
                                        <span className="text-[10px] font-bold">{method.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Pay Button */}
                        <Button
                            onClick={handleMarkAsPaid}
                            variant="primary"
                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600"
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Confirmer le Paiement
                        </Button>
                    </div>
                )}

                {/* Paid confirmation */}
                {transaction.status === 'paid' && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-xl">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-emerald-300">Transaction payée</p>
                            {transaction.method && (
                                <p className="text-xs text-emerald-400/70">Mode: {PAYMENT_METHODS.find(m => m.value === transaction.method)?.label || transaction.method}</p>
                            )}
                        </div>
                    </div>
                )}
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
