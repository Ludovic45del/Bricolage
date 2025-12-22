import React from 'react';
import { Member } from '@/types';
import { CheckCircle, XCircle } from 'lucide-react';
import { formatDate, formatCurrency, isMembershipActive } from '@/utils';

interface UserMembershipStatusProps {
    currentUser: Member;
}

export const UserMembershipStatus: React.FC<UserMembershipStatusProps> = ({ currentUser }) => {
    const isActiveMember = isMembershipActive(currentUser.membershipExpiry);

    return (
        <div className="glass-card p-8 mb-10 flex flex-col md:flex-row justify-between items-center border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-purple-500/50 to-indigo-500/50"></div>
            <div className="relative z-10">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] mb-3">Statut Adhésion</h2>
                <div className="flex items-center space-x-3">
                    {isActiveMember ? (
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            <CheckCircle className="w-4 h-4 mr-2" /> Actif jusqu'au {formatDate(currentUser.membershipExpiry)}
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                            <XCircle className="w-4 h-4 mr-2" /> Expiré le {formatDate(currentUser.membershipExpiry)}
                        </span>
                    )}
                </div>
            </div>
            <div className="mt-8 md:mt-0 text-center md:text-right relative z-10">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] mb-1">Contribution</div>
                <div className={`text-4xl font-black tracking-tighter ${currentUser.totalDebt > 0 ? 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]'}`}>
                    {formatCurrency(currentUser.totalDebt)}
                </div>
            </div>
        </div>
    );
};
