import React from 'react';
import { Member as User, isMembershipActive, getMemberRoleLabel, getMemberStatusLabel } from '../../api/memberTypes';
import { formatDate, formatCurrency } from '../../utils';
import { CheckCircle, XCircle, CreditCard, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface MemberRowProps {
    user: User;
    onEdit: (user: User) => void;
    onRenew: (user: User) => void;
    onDelete: (user: User) => void;
    onView: (user: User) => void;
}

export const MemberRow: React.FC<MemberRowProps> = React.memo(({
    user,
    onEdit,
    onRenew,
    onDelete,
    onView
}) => {
    const isActive = isMembershipActive(user.membershipExpiry);

    return (
        <tr className="hover:bg-white/5 transition-colors group">
            <td className="px-8 py-6">
                <div
                    className="flex items-center cursor-pointer group/cell"
                    onClick={() => onView(user)}
                >
                    <div className="h-12 w-12 rounded-2xl glass-card flex items-center justify-center text-white font-black border-white/20 mr-4 shadow-lg group-hover/cell:scale-110 transition-transform">
                        <span className="text-purple-400">{user.name.charAt(0)}</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="text-sm font-bold text-white group-hover/cell:text-purple-400 transition-colors">{user.name}</div>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : user.role === 'staff' ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5 text-gray-500'}`}>
                                {getMemberRoleLabel(user.role)}
                            </span>
                        </div>
                        <div className="text-[10px] text-gray-500 font-medium tracking-tighter uppercase">{user.badgeNumber} • {user.email}</div>
                    </div>
                </div>
            </td>
            <td className="px-8 py-6 whitespace-nowrap">
                <div className="flex flex-col gap-1.5">
                    {isActive ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 w-fit">
                            <CheckCircle className="w-3 h-3 mr-1.5" /> Actif
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-300 border border-rose-500/20 w-fit">
                            <XCircle className="w-3 h-3 mr-1.5" /> Expiré
                        </span>
                    )}
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border w-fit ${user.status === 'active' ? 'bg-white/5 border-white/10 text-gray-400' : user.status === 'suspended' ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-gray-500/10 border-gray-500/20 text-gray-500'}`}>
                        {getMemberStatusLabel(user.status)}
                    </span>
                </div>
            </td>
            <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-400 font-light">
                {formatDate(user.membershipExpiry)}
            </td>
            <td className="px-8 py-6 whitespace-nowrap text-sm font-black">
                <span className={user.totalDebt > 0 ? "text-rose-400" : "text-emerald-400"}>
                    {formatCurrency(user.totalDebt)}
                </span>
            </td>
            <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium space-x-3">
                <Button variant="ghost" size="sm" onClick={() => onEdit(user)} className="border-white/5 hover:border-white/10">Éditer</Button>
                <Button variant="secondary" size="sm" onClick={() => onRenew(user)}>
                    <CreditCard className="w-3 h-3 mr-2" /> Renouveler
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(user)}
                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border-transparent"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </td>
        </tr>
    );
});
