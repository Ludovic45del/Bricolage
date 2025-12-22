import React, { memo } from 'react';
import { Reservation, User, Tool } from '../../types';
import { Button } from '../ui/Button';
import { formatDate, formatCurrency } from '../../utils';
import { Clock, CheckCircle, AlertTriangle, Mail } from 'lucide-react';
import { parseISO } from 'date-fns';

interface ActiveRentalCardProps {
    rental: Reservation;
    user: User;
    tool: Tool;
    onReturn: (rental: Reservation) => void;
    onSendReminder: (rental: Reservation) => void;
}

/**
 * Card component for active rentals
 * Shows late warning and reminder button if overdue
 */
export const ActiveRentalCard: React.FC<ActiveRentalCardProps> = memo(({
    rental,
    user,
    tool,
    onReturn,
    onSendReminder
}) => {
    const isLate = parseISO(rental.end_date) < new Date();

    return (
        <div className={`group glass-card p-6 border transition-all duration-500 hover:scale-[1.01] ${isLate
                ? 'border-rose-500/30 bg-rose-500/5 shadow-[0_15px_40px_-10px_rgba(244,63,94,0.15)]'
                : 'border-white/5 hover:border-white/20'
            }`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1">
                    <h4 className="font-black text-white text-xl tracking-tight mb-3 group-hover:text-purple-400 transition-colors">
                        {tool.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-4">
                        {/* User chip */}
                        <div className="flex items-center bg-white/5 px-3 py-1.5 rounded-2xl border border-white/5">
                            <div className="h-6 w-6 rounded-lg glass-card flex items-center justify-center text-[10px] font-black text-purple-300 mr-2 shadow-inner">
                                {user.name.charAt(0)}
                            </div>
                            <span className="text-xs font-bold text-gray-300">{user.name}</span>
                        </div>

                        {/* Date chip */}
                        <div className="text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase flex items-center bg-white/5 px-3 py-1.5 rounded-2xl border border-white/5">
                            <Clock className="w-3.5 h-3.5 mr-2 text-gray-600" />
                            {formatDate(rental.start_date)} <span className="mx-2 text-gray-700">➔</span> {formatDate(rental.end_date)}
                        </div>

                        {/* Price chip */}
                        <div className="text-xs font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] bg-emerald-500/5 px-3 py-1.5 rounded-2xl border border-emerald-500/10">
                            {rental.total_price ? formatCurrency(rental.total_price) : 'N/A'}
                        </div>
                    </div>

                    {/* Late warning */}
                    {isLate && (
                        <div className="mt-6 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-700">
                            <span className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-rose-400 bg-rose-500/20 px-3 py-1.5 rounded-full border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                                <AlertTriangle className="w-4 h-4 mr-2 animate-bounce" /> Retard
                            </span>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => onSendReminder(rental)}
                                className="shadow-lg shadow-rose-900/30 border-rose-500/20"
                            >
                                <Mail className="w-3.5 h-3.5 mr-2" /> Envoyer Rappel
                            </Button>
                        </div>
                    )}
                </div>

                {/* Return button */}
                <div className="flex items-center w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 border-white/5">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="w-full md:w-auto shadow-xl group-hover:scale-105 transition-transform"
                        onClick={() => onReturn(rental)}
                    >
                        <CheckCircle className="w-4 h-4 mr-2" /> Terminer
                    </Button>
                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    return prevProps.rental.id === nextProps.rental.id &&
        prevProps.rental.status === nextProps.rental.status &&
        prevProps.rental.end_date === nextProps.rental.end_date;
});

ActiveRentalCard.displayName = 'ActiveRentalCard';

export default ActiveRentalCard;
