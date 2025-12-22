import React, { memo } from 'react';
import { Reservation, User, Tool } from '../../types';
import { Button } from '../ui/Button';
import { formatDate, formatCurrency, isMembershipActive } from '../../utils';
import { Clock } from 'lucide-react';

interface PendingRentalCardProps {
    rental: Reservation;
    user: User;
    tool: Tool;
    onApprove: (rental: Reservation) => void;
    onReject: (rental: Reservation) => void;
}

/**
 * Card component for pending rental requests
 * Displays user membership status and action buttons
 */
export const PendingRentalCard: React.FC<PendingRentalCardProps> = memo(({
    rental,
    user,
    tool,
    onApprove,
    onReject
}) => {
    const isActive = isMembershipActive(user.membership_expiry);

    return (
        <div className="glass-card p-6 border-white/5 hover:border-amber-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl transition-all duration-500 hover:scale-[1.01]">
            <div>
                <h4 className="font-bold text-white text-xl tracking-tight leading-none mb-2">
                    {tool.title}
                </h4>
                <div className="flex items-center text-sm text-gray-500 font-medium">
                    Initié par : <span className="font-bold text-gray-300 ml-2">{user.name}</span>
                    <span className={`ml-3 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${isActive
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                        }`}>
                        {isActive ? 'Actif' : 'Expiré'}
                    </span>
                </div>
                <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mt-4 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-2" />
                    {formatDate(rental.start_date)} ➔ {formatDate(rental.end_date)}
                </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-white/5">
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 md:flex-none border-white/5 hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/20"
                    onClick={() => onReject(rental)}
                >
                    Décliner
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 md:flex-none shadow-lg shadow-amber-500/10"
                    onClick={() => onApprove(rental)}
                >
                    Approuver
                </Button>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    return prevProps.rental.id === nextProps.rental.id &&
        prevProps.rental.status === nextProps.rental.status;
});

PendingRentalCard.displayName = 'PendingRentalCard';

export default PendingRentalCard;
