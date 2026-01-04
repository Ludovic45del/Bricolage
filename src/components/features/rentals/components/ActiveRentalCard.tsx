import React, { memo } from 'react';
import { Rental, Member, Tool } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils';
import { RentalCardBase, UserChip, PriceChip } from '@/components/ui/RentalCardBase';
import { CheckCircle, AlertTriangle, Mail } from 'lucide-react';
import { parseISO } from 'date-fns';

interface ActiveRentalCardProps {
    rental: Rental;
    user: Member;
    tool: Tool;
    onReturn: (rental: Rental) => void;
    onSendReminder: (rental: Rental) => void;
}

/**
 * Card component for active rentals
 * Uses RentalCardBase for consistent layout
 */
export const ActiveRentalCard: React.FC<ActiveRentalCardProps> = memo(({
    rental,
    user,
    tool,
    onReturn,
    onSendReminder
}) => {
    const isLate = parseISO(rental.endDate) < new Date();

    return (
        <RentalCardBase
            toolTitle={tool.title}
            user={user}
            startDate={rental.startDate}
            endDate={rental.endDate}
            isWarning={isLate}
            userChip={<UserChip user={user} />}
            additionalInfo={
                <PriceChip amount={rental.totalPrice} formatter={formatCurrency} />
            }
            warningContent={isLate ? (
                <div className="flex items-center gap-4">
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
            ) : undefined}
            actions={
                <Button
                    variant="secondary"
                    size="sm"
                    className="w-full md:w-auto shadow-xl group-hover:scale-105 transition-transform"
                    onClick={() => onReturn(rental)}
                >
                    <CheckCircle className="w-4 h-4 mr-2" /> Terminer
                </Button>
            }
        />
    );
}, (prevProps, nextProps) => {
    return prevProps.rental.id === nextProps.rental.id &&
        prevProps.rental.status === nextProps.rental.status &&
        prevProps.rental.endDate === nextProps.rental.endDate;
});

ActiveRentalCard.displayName = 'ActiveRentalCard';

export default ActiveRentalCard;

