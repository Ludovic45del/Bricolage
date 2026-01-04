import React from 'react';
import { Member } from '@/types';
import { formatDate } from '@/utils';
import { Clock } from 'lucide-react';

interface RentalCardBaseProps {
    /** Tool title displayed as header */
    toolTitle: string;
    /** User who made the rental */
    user: Member;
    /** Rental start date */
    startDate: string;
    /** Rental end date */
    endDate: string;
    /** Whether the card has a warning state (e.g., late) */
    isWarning?: boolean;
    /** User info chip to display (custom component) */
    userChip?: React.ReactNode;
    /** Additional content to display after user info */
    additionalInfo?: React.ReactNode;
    /** Warning/alert content to display */
    warningContent?: React.ReactNode;
    /** Action buttons */
    actions: React.ReactNode;
    /** Optional className override */
    className?: string;
}

/**
 * Shared base component for rental cards (Active, Pending, etc.)
 * Provides consistent layout and styling across different rental card types
 */
export const RentalCardBase: React.FC<RentalCardBaseProps> = ({
    toolTitle,
    user,
    startDate,
    endDate,
    isWarning = false,
    userChip,
    additionalInfo,
    warningContent,
    actions,
    className = ''
}) => {
    return (
        <div className={`group glass-card p-6 border transition-all duration-500 hover:scale-[1.01] ${isWarning
            ? 'border-rose-500/30 bg-rose-500/5 shadow-[0_15px_40px_-10px_rgba(244,63,94,0.15)]'
            : 'border-white/5 hover:border-white/20'
            } ${className}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1">
                    {/* Tool Title */}
                    <h4 className="font-black text-white text-xl tracking-tight mb-3 group-hover:text-purple-400 transition-colors">
                        {toolTitle}
                    </h4>

                    <div className="flex flex-wrap items-center gap-4">
                        {/* User chip - custom or default */}
                        {userChip || (
                            <UserChip user={user} />
                        )}

                        {/* Date chip */}
                        <DateRangeChip startDate={startDate} endDate={endDate} />

                        {/* Additional info slot */}
                        {additionalInfo}
                    </div>

                    {/* Warning content slot */}
                    {warningContent && (
                        <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-700">
                            {warningContent}
                        </div>
                    )}
                </div>

                {/* Actions slot */}
                <div className="flex items-center w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 border-white/5">
                    {actions}
                </div>
            </div>
        </div>
    );
};

/**
 * Reusable user chip component
 */
export const UserChip: React.FC<{ user: Member; showStatus?: boolean }> = ({ user, showStatus }) => (
    <div className="flex items-center bg-white/5 px-3 py-1.5 rounded-2xl border border-white/5">
        <div className="h-6 w-6 rounded-lg glass-card flex items-center justify-center text-[10px] font-black text-purple-300 mr-2 shadow-inner">
            {user.name.charAt(0)}
        </div>
        <span className="text-xs font-bold text-gray-300">{user.name}</span>
        {showStatus !== undefined && (
            <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${showStatus
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                }`}>
                {showStatus ? 'Actif' : 'Expiré'}
            </span>
        )}
    </div>
);

/**
 * Reusable date range chip component
 */
export const DateRangeChip: React.FC<{ startDate: string; endDate: string }> = ({ startDate, endDate }) => (
    <div className="text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase flex items-center bg-white/5 px-3 py-1.5 rounded-2xl border border-white/5">
        <Clock className="w-3.5 h-3.5 mr-2 text-gray-600" />
        {formatDate(startDate)} <span className="mx-2 text-gray-700">➔</span> {formatDate(endDate)}
    </div>
);

/**
 * Reusable price chip component
 */
export const PriceChip: React.FC<{ amount: number | undefined; formatter: (n: number) => string }> = ({ amount, formatter }) => (
    <div className="text-xs font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] bg-emerald-500/5 px-3 py-1.5 rounded-2xl border border-emerald-500/10">
        {amount ? formatter(amount) : 'N/A'}
    </div>
);

export default RentalCardBase;
