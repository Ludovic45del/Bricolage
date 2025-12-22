import React from 'react';
import { Member as User } from '../../api/memberTypes';
import { MemberRow } from './MemberRow';

interface MemberTableProps {
    users: User[];
    searchQuery: string;
    onEditMember: (user: User) => void;
    onRenewMember: (user: User) => void;
    onDeleteMember: (user: User) => void;
    onViewMember: (user: User) => void;
}

export const MemberTable: React.FC<MemberTableProps> = ({
    users,
    searchQuery,
    onEditMember,
    onRenewMember,
    onDeleteMember,
    onViewMember
}) => {
    return (
        <div className="glass-card shadow-2xl border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/5">
                    <thead className="bg-white/5">
                        <tr>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Membre</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Statut</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Échéance</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Dette</th>
                            <th className="px-8 py-5 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-8 py-20 text-center text-gray-600 font-light italic">
                                    Aucun membre correspondant à "{searchQuery}".
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <MemberRow
                                    key={user.id}
                                    user={user}
                                    onEdit={onEditMember}
                                    onRenew={onRenewMember}
                                    onDelete={onDeleteMember}
                                    onView={onViewMember}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
