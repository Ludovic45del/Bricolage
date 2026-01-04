import React, { memo } from 'react';
import { Rental, Member, Tool } from '@/types';
import { Button } from '@/components/ui/Button';
import { isMembershipActive } from '@/utils';
import { RentalCardBase, UserChip } from '@/components/ui/RentalCardBase';

interface PendingRentalCardProps {
    rental: Rental;
    user: Member;
    tool: Tool;
    onApprove: (rental: Rental) => void;
    onReject: (rental: Rental) => void;
}

/**
 * Card component for pending rental requests
 * Uses RentalCardBase for consistent layout
 */
export const PendingRentalCard: React.FC<PendingRentalCardProps> = memo(({
    rental,
    user,
    tool,
    onApprove,
    onReject
}) => {
    const isActive = isMembershipActive(user.membershipExpiry);

    return (
        <RentalCardBase
            toolTitle={tool.title}
            user={user}
            startDate={rental.startDate}
            endDate={rental.endDate}
            userChip={<UserChip user={user} showStatus={isActive} />}
            actions={
                <div className="flex items-center gap-4 w-full md:w-auto">
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
            }
        />
    );
}, (prevProps, nextProps) => {
    return prevProps.rental.id === nextProps.rental.id &&
        prevProps.rental.status === nextProps.rental.status;
});

PendingRentalCard.displayName = 'PendingRentalCard';

export default PendingRentalCard;

