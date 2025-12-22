import React from 'react';
import { Member, Rental, Tool } from '@/types';
import { formatDate, isMembershipActive } from '@/utils';
import { Button } from '@/components/ui/Button';

interface PendingRentalsListProps {
    rentals: Rental[];
    users: Member[];
    tools: Tool[];
    onApprove: (rental: Rental) => void;
    onReject: (rental: Rental) => void;
}

export const PendingRentalsList: React.FC<PendingRentalsListProps> = ({
    rentals,
    users,
    tools,
    onApprove,
    onReject
}) => {
    if (rentals.length === 0) return null;

    return (
        <div className="animate-fade-in group">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center tracking-tight">
                <div className="w-1 h-6 bg-amber-500/50 rounded-full mr-4"></div>
                Demandes en attente
                <span className="ml-4 bg-amber-500/10 text-amber-300 text-[10px] font-black px-3 py-1 rounded-full border border-amber-500/20">
                    {rentals.length}
                </span>
            </h3>
            <div className="space-y-6">
                {rentals.map(rental => {
                    const tool = tools.find(t => t.id === rental.toolId);
                    const user = users.find(u => u.id === rental.userId);
                    if (!tool || !user) return null;

                    return (
                        <div
                            key={rental.id}
                            className="glass-card p-6 border-white/5 hover:border-amber-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl transition-all duration-500 hover:scale-[1.01]"
                        >
                            <div>
                                <h4 className="font-bold text-white text-xl tracking-tight leading-none mb-2">{tool.title}</h4>
                                <div className="flex items-center text-sm text-gray-500 font-medium">
                                    Initié par : <span className="font-bold text-gray-300 ml-2">{user.name}</span>
                                    <span className={`ml-3 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${isMembershipActive(user.membershipExpiry)
                                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                                        : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                                        }`}>
                                        {isMembershipActive(user.membershipExpiry) ? 'Actif' : 'Expiré'}
                                    </span>
                                </div>
                                <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mt-4 flex items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-2"></span>
                                    {formatDate(rental.startDate)} ➔ {formatDate(rental.endDate)}
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
                })}
            </div>
        </div>
    );
};
