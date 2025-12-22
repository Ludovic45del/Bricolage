import React from 'react';
import { Member } from '@/types';
import { MemberRow } from './MemberRow';

interface MemberTableProps {
    users: Member[];
    searchQuery: string;
    onEditMember: (user: Member) => void;
    onRenewMember: (user: Member) => void;
    onDeleteMember: (user: Member) => void;
    onViewMember: (user: Member) => void;
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
                        {(!users || !Array.isArray(users) || users.length === 0) ? (
                            <tr>
                                <td colSpan={5} className="px-8 py-20 text-center text-gray-600 font-light italic">
                                    {(!users || !Array.isArray(users)) ? "Erreur de chargement des membres." : `Aucun membre correspondant à "${searchQuery}".`}
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
