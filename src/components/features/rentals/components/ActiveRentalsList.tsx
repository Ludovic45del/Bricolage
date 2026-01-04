import React from 'react';
import { Member, Tool, Rental } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/utils';
import { AlertTriangle, CheckCircle, Clock, Mail, CalendarClock, XCircle, Check, X, ClipboardList } from 'lucide-react';
import { parseISO, isAfter, isBefore, startOfDay } from 'date-fns';

interface ActiveRentalsListProps {
    rentals: Rental[];
    users: Member[];
    tools: Tool[];
    onReturn: (rental: Rental) => void;
    onCancel: (rental: Rental) => void;
    onApprove?: (rental: Rental) => void;
    onReject?: (rental: Rental) => void;
    onSendOverdueEmail: (rental: Rental) => void;
}

export const ActiveRentalsList: React.FC<ActiveRentalsListProps> = ({
    rentals,
    users,
    tools,
    onReturn,
    onCancel,
    onApprove,
    onReject,
    onSendOverdueEmail
}) => {
    const today = startOfDay(new Date());

    // Séparer les demandes en attente
    const pendingRentals = rentals.filter(r => r.status === 'pending');

    // Locations en cours (actives, sans pending)
    const currentRentals = rentals.filter(r => {
        if (r.status === 'pending') return false;
        const startDate = parseISO(r.startDate);
        return (r.status === 'active' || r.status === 'late') && (isBefore(startDate, today) || startDate.getTime() === today.getTime());
    });

    // Locations à venir (actives, sans pending)
    const upcomingRentals = rentals.filter(r => {
        if (r.status === 'pending') return false;
        const startDate = parseISO(r.startDate);
        return (r.status === 'active') && isAfter(startDate, today);
    });

    const renderPendingCard = (rental: Rental) => {
        const tool = tools.find(t => t.id === rental.toolId);
        const user = users.find(u => u.id === rental.userId);
        if (!tool || !user) return null;

        return (
            <div
                key={rental.id}
                className="rental-card glass-card p-6 border border-amber-500/30 bg-amber-500/5 shadow-[0_15px_40px_-10px_rgba(245,158,11,0.15)] transition-all duration-500 hover:scale-[1.01]"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 bg-amber-500/20 px-3 py-1.5 rounded-full border border-amber-500/30">
                                <ClipboardList className="w-3.5 h-3.5 mr-2" /> Demande
                            </span>
                        </div>
                        <h4 className="font-black text-white text-xl tracking-tight mb-3 hover:text-purple-400 transition-colors">
                            {tool.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center bg-white/5 px-3 py-1.5 rounded-2xl border border-white/5">
                                <div className="h-6 w-6 rounded-lg glass-card flex items-center justify-center text-[10px] font-black text-purple-300 mr-2 shadow-inner">
                                    {user.name.charAt(0)}
                                </div>
                                <span className="text-xs font-bold text-gray-300">{user.name}</span>
                            </div>

                            <div className="text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase flex items-center bg-white/5 px-3 py-1.5 rounded-2xl border border-white/5">
                                <Clock className="w-3.5 h-3.5 mr-2 text-gray-600" />
                                {formatDate(rental.startDate)} <span className="mx-2 text-gray-700">➔</span> {formatDate(rental.endDate)}
                            </div>

                            <div className="text-xs font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] bg-emerald-500/5 px-3 py-1.5 rounded-2xl border border-emerald-500/10">
                                {rental.totalPrice ? formatCurrency(rental.totalPrice) : 'N/A'}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 border-white/5">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1 md:flex-none shadow-xl hover:scale-105 transition-transform bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30"
                            onClick={() => onApprove?.(rental)}
                        >
                            <Check className="w-4 h-4 mr-2" /> Approuver
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            className="flex-1 md:flex-none shadow-xl hover:scale-105 transition-transform"
                            onClick={() => onReject?.(rental)}
                        >
                            <X className="w-4 h-4 mr-2" /> Refuser
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    const renderRentalCard = (rental: Rental, isUpcoming: boolean = false) => {
        const tool = tools.find(t => t.id === rental.toolId);
        const user = users.find(u => u.id === rental.userId);
        if (!tool || !user) return null;

        const isLate = !isUpcoming && parseISO(rental.endDate) < new Date();

        return (
            <div
                key={rental.id}
                className={`rental-card glass-card p-6 border transition-all duration-500 hover:scale-[1.01] ${isLate
                    ? 'border-rose-500/30 bg-rose-500/5 shadow-[0_15px_40px_-10px_rgba(244,63,94,0.15)]'
                    : isUpcoming
                        ? 'border-purple-500/20 bg-purple-500/5'
                        : 'border-white/5 hover:border-white/20'
                    }`}
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1">
                        <h4 className="font-black text-white text-xl tracking-tight mb-3 hover:text-purple-400 transition-colors">
                            {tool.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center bg-white/5 px-3 py-1.5 rounded-2xl border border-white/5">
                                <div className="h-6 w-6 rounded-lg glass-card flex items-center justify-center text-[10px] font-black text-purple-300 mr-2 shadow-inner">
                                    {user.name.charAt(0)}
                                </div>
                                <span className="text-xs font-bold text-gray-300">{user.name}</span>
                            </div>

                            <div className="text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase flex items-center bg-white/5 px-3 py-1.5 rounded-2xl border border-white/5">
                                <Clock className="w-3.5 h-3.5 mr-2 text-gray-600" />
                                {formatDate(rental.startDate)} <span className="mx-2 text-gray-700">➔</span> {formatDate(rental.endDate)}
                            </div>

                            <div className="text-xs font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] bg-emerald-500/5 px-3 py-1.5 rounded-2xl border border-emerald-500/10">
                                {rental.totalPrice ? formatCurrency(rental.totalPrice) : 'N/A'}
                            </div>

                            {isUpcoming && (
                                <span className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 bg-purple-500/20 px-3 py-1.5 rounded-full border border-purple-500/30">
                                    <CalendarClock className="w-3.5 h-3.5 mr-2" /> À venir
                                </span>
                            )}

                            {isLate && (
                                <>
                                    <span className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-rose-400 bg-rose-500/20 px-3 py-1.5 rounded-full border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                                        <AlertTriangle className="w-4 h-4 mr-2" /> Retard
                                    </span>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => onSendOverdueEmail(rental)}
                                        className="shadow-lg shadow-rose-900/30 border-rose-500/20"
                                    >
                                        <Mail className="w-3.5 h-3.5 mr-2" /> Envoyer Rappel
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                    {!isUpcoming && (
                        <div className="flex items-center w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 border-white/5">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="w-full md:w-auto shadow-xl hover:scale-105 transition-transform"
                                onClick={() => onReturn(rental)}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" /> Terminer la Location
                            </Button>
                        </div>
                    )}
                    {isUpcoming && (
                        <div className="flex items-center w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 border-white/5">
                            <Button
                                variant="danger"
                                size="sm"
                                className="w-full md:w-auto shadow-xl hover:scale-105 transition-transform"
                                onClick={() => onCancel(rental)}
                            >
                                <XCircle className="w-4 h-4 mr-2" /> Annuler
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {/* Demandes en attente */}
            {pendingRentals.length > 0 && (
                <div className="bg-amber-500/5 rounded-3xl p-6 border border-amber-500/20">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center tracking-tight">
                        <div className="w-1 h-6 bg-amber-500/50 rounded-full mr-4"></div>
                        Demandes en attente
                        <span className="ml-3 text-sm font-bold text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full">{pendingRentals.length}</span>
                    </h3>
                    <div className="grid gap-6">
                        {pendingRentals.map(rental => renderPendingCard(rental))}
                    </div>
                </div>
            )}

            {/* Locations en cours */}
            <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center tracking-tight">
                    <div className="w-1 h-6 bg-purple-500/50 rounded-full mr-4"></div>
                    Locations en cours
                </h3>
                {currentRentals.length === 0 ? (
                    <div className="text-center py-12 glass-card border-white/5 text-gray-600 italic font-light shadow-inner">
                        Aucune location active actuellement.
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {currentRentals.map(rental => renderRentalCard(rental, false))}
                    </div>
                )}
            </div>

            {/* Locations à venir */}
            {upcomingRentals.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center tracking-tight">
                        <div className="w-1 h-6 bg-purple-500/50 rounded-full mr-4"></div>
                        Locations à venir
                    </h3>
                    <div className="grid gap-6">
                        {upcomingRentals.map(rental => renderRentalCard(rental, true))}
                    </div>
                </div>
            )}
        </div>
    );
};
