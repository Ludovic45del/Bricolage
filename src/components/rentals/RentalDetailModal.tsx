import React from 'react';
import { Modal } from '../ui/Modal';
import { Rental } from '../../api/rentalTypes';
import { Tool } from '../../api/types';
import { Member } from '../../api/memberTypes';
import { Transaction, TransactionType } from '../../constants';
import { formatDate, formatCurrency } from '../../utils';
import { Calendar, CheckCircle, Clock, AlertTriangle, User, DollarSign, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';

interface RentalDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    rental: Rental;
    tool?: Tool;
    user?: Member;
    transaction?: Transaction;
}

export const RentalDetailModal: React.FC<RentalDetailModalProps> = ({
    isOpen,
    onClose,
    rental,
    tool,
    user,
    transaction
}) => {
    if (!rental) return null;

    // Simulate approval date (usually shortly after creation)
    const requestDate = new Date(rental.createdAt);
    const approvalDate = new Date(requestDate.getTime() + 1000 * 60 * 60 * 2); // +2 hours

    // Workflow Steps
    const steps = [
        {
            label: 'Demande',
            date: rental.createdAt,
            icon: Calendar,
            completed: true,
            detail: `Initiée par ${user?.name || 'Membre'}`
        },
        {
            label: 'Acceptation',
            date: approvalDate.toISOString(),
            icon: CheckCircle,
            completed: rental.status !== 'pending' && rental.status !== 'rejected',
            detail: rental.status === 'rejected' ? 'Refusée' : 'Validée par Admin'
        },
        {
            label: 'Paiement',
            date: transaction?.date,
            icon: DollarSign,
            completed: !!transaction,
            detail: transaction ? formatCurrency(Math.abs(transaction.amount)) : 'En attente'
        },
        {
            label: 'Retour',
            date: rental.status === 'completed' ? rental.endDate : undefined,
            icon: Clock,
            completed: rental.status === 'completed',
            detail: rental.returnComment ? 'Retourné avec commentaire' : (rental.status === 'completed' ? 'Retourné' : 'Non retourné')
        }
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg border border-white/10 shadow-inner">
                        <Clock className="w-5 h-5 text-purple-300" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                            Détails de la Location
                        </span>
                        <span className="text-xs text-purple-300 font-mono tracking-widest uppercase font-medium">#{rental.id}</span>
                    </div>
                </div>
            }
        >
            <div className="space-y-8 max-w-4xl mx-auto">
                {/* Header Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group relative p-6 rounded-[24px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-purple-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] -mr-16 -mt-16 transition-opacity group-hover:opacity-100"></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform duration-500">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Membre</div>
                                <div className="font-bold text-white text-lg tracking-tight group-hover:text-purple-200 transition-colors">
                                    {user?.name || 'Inconnu'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="group relative p-6 rounded-[24px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-amber-500/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[50px] -mr-16 -mt-16 transition-opacity group-hover:opacity-100"></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform duration-500">
                                <WrenchIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Outil</div>
                                <div className="font-bold text-white text-lg tracking-tight group-hover:text-amber-200 transition-colors">
                                    {tool?.title || 'Inconnu'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Workflow Timeline */}
                <div className="relative pl-4 md:pl-0">
                    <div className="space-y-0">
                        {steps.map((step, idx) => (
                            <div key={idx} className={`relative flex flex-col md:flex-row gap-6 md:gap-10 group ${step.completed ? 'opacity-100' : 'opacity-40 grayscale'} pb-8 last:pb-0`}>
                                {/* Timeline Connecting Line (Between steps) */}
                                {idx !== steps.length - 1 && (
                                    <div className="absolute left-[30px] top-4 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/50 to-purple-500/10 hidden md:block"></div>
                                )}

                                {/* Timeline Node (Desktop) */}
                                <div className={`absolute left-[23px] top-0 w-4 h-4 rounded-full border-[3px] z-10 hidden md:block transition-all duration-500 ${step.completed
                                    ? 'bg-gray-900 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-110 group-hover:scale-125'
                                    : 'bg-gray-900 border-gray-700'
                                    }`}></div>

                                {/* Date Column */}
                                <div className="md:w-32 md:text-right pt-0.5">
                                    {step.date ? (
                                        <>
                                            <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                                                {new Date(step.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                            </div>
                                            <div className="text-[10px] font-mono text-gray-500">
                                                {new Date(step.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-xs text-gray-600 font-medium italic">--</span>
                                    )}
                                </div>

                                {/* Content Card */}
                                <div className="flex-1 -mt-2">
                                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 group-hover:translate-x-1">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-2.5 rounded-xl ${step.completed ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-800/50 text-gray-500'}`}>
                                                <step.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-base font-bold text-white mb-1">{step.label}</h4>
                                                <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
                                                    {step.detail}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Return Comment Section - Champagne Accent */}
                {rental.returnComment && (
                    <div className="p-6 rounded-[24px] bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/10 rounded-full blur-[60px]"></div>
                        <div className="flex items-start gap-4 relative z-10">
                            <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 mb-2">Commentaire de retour</h4>
                                <p className="text-amber-100/90 italic font-medium leading-relaxed">
                                    "{rental.returnComment}"
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="pt-6 mt-8 border-t border-white/5 flex justify-end">
                    <Button
                        onClick={onClose}
                        variant="secondary"
                        className="px-8 py-3 rounded-full border-white/10 hover:bg-white/10 hover:text-white transition-all hover:scale-105"
                    >
                        Fermer
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

const WrenchIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
);
