import React from 'react';
import { Search, UserPlus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';

interface MemberSearchHeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onAddMember: () => void;
    statusFilter: string;
    setStatusFilter: (status: any) => void;
    membershipFilter: string;
    setMembershipFilter: (status: any) => void;
}

export const MemberSearchHeader: React.FC<MemberSearchHeaderProps> = ({
    searchQuery,
    setSearchQuery,
    onAddMember,
    statusFilter,
    setStatusFilter,
    membershipFilter,
    setMembershipFilter
}) => {
    return (
        <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center py-4 px-1">
            <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto flex-1">
                <div className="relative w-full md:w-48">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        className="block w-full h-11 pl-10 pr-4 py-2.5 glass-input rounded-2xl text-sm font-medium transition-all focus:ring-0 placeholder-gray-500/50"
                        placeholder="Rechercher un membre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="w-full md:w-44">
                    <Select
                        options={[
                            { id: 'All', name: 'Tous les comptes' },
                            { id: 'Active', name: 'Compte Actif' },
                            { id: 'Suspended', name: 'Suspendu' },
                            { id: 'Archived', name: 'Archivé' }
                        ]}
                        value={statusFilter}
                        onChange={setStatusFilter}
                    />
                </div>

                <div className="w-full md:w-44">
                    <Select
                        options={[
                            { id: 'All', name: 'Toutes adhésions' },
                            { id: 'Active', name: 'Adhésion OK' },
                            { id: 'Expired', name: 'Déjà Expiré' }
                        ]}
                        value={membershipFilter}
                        onChange={setMembershipFilter}
                    />
                </div>
            </div>

            <div className="flex items-center gap-3 w-full xl:w-auto">
                <Button
                    onClick={onAddMember}
                    className="flex-1 xl:flex-none py-2.5 px-6 bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 shadow-[0_4px_20px_rgba(168,85,247,0.15)] rounded-2xl transition-all"
                >
                    <UserPlus className="w-4 h-4 mr-2" /> Nouveau Membre
                </Button>
            </div>
        </div >
    );
};
