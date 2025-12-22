import React from 'react';
import { Member, Tool, Rental } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/utils';
import { AlertTriangle, CheckCircle, Clock, Mail } from 'lucide-react';
import { parseISO } from 'date-fns';

interface ActiveRentalsListProps {
    rentals: Rental[];
    users: Member[];
    tools: Tool[];
    onReturn: (rental: Rental) => void;
    onSendOverdueEmail: (rental: Rental) => void;
}

export const ActiveRentalsList: React.FC<ActiveRentalsListProps> = ({
    rentals,
    users,
    tools,
    onReturn,
    onSendOverdueEmail
}) => {
    return (
        <div className="group">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center tracking-tight">
                <div className="w-1 h-6 bg-purple-500/50 rounded-full mr-4"></div>
                Locations en cours
            </h3>
            {rentals.length === 0 ? (
                <div className="text-center py-20 glass-card border-white/5 text-gray-600 italic font-light shadow-inner">
                    Aucune location active détectée dans le système.
                </div>
            ) : (
                <div className="grid gap-6">
                    {rentals.map(rental => {
                        const tool = tools.find(t => t.id === rental.toolId);
                        const user = users.find(u => u.id === rental.userId);
                        if (!tool || !user) return null;

                        const isLate = parseISO(rental.endDate) < new Date();

                        return (
                            <div
                                key={rental.id}
                                className={`group glass-card p-6 border transition-all duration-500 hover:scale-[1.01] ${isLate
                                    ? 'border-rose-500/30 bg-rose-500/5 shadow-[0_15px_40px_-10px_rgba(244,63,94,0.15)]'
                                    : 'border-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="flex-1">
                                        <h4 className="font-black text-white text-xl tracking-tight mb-3 group-hover:text-purple-400 transition-colors">
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

                                        {isLate && (
                                            <div className="mt-6 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-700">
                                                <span className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-rose-400 bg-rose-500/20 px-3 py-1.5 rounded-full border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                                                    <AlertTriangle className="w-4 h-4 mr-2 animate-bounce" /> Retard
                                                </span>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => onSendOverdueEmail(rental)}
                                                    className="shadow-lg shadow-rose-900/30 border-rose-500/20"
                                                >
                                                    <Mail className="w-3.5 h-3.5 mr-2" /> Envoyer Rappel
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 border-white/5">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="w-full md:w-auto shadow-xl group-hover:scale-105 transition-transform"
                                            onClick={() => onReturn(rental)}
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" /> Terminer la Location
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
