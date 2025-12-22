import React from 'react';
import { Member } from '@/types';
import { ShoppingBag, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface UserDashboardHeaderProps {
    currentUser: Member;
    onLogout: () => void;
    onProfileClick: () => void;
}

export const UserDashboardHeader: React.FC<UserDashboardHeaderProps> = ({
    currentUser,
    onLogout,
    onProfileClick
}) => {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="glass-sidebar shadow-xl border-b border-white/10 m-4 rounded-3xl">
            <div className="max-w-full mx-auto px-10 h-20 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="p-2 glass-card rounded-xl border-white/20">
                        <ShoppingBag className="w-6 h-6 text-purple-400" />
                    </div>
                    <span className="text-2xl font-bold text-white tracking-tight">Espace <span className="text-purple-400">Bricolage</span></span>
                </div>

                <div className="flex items-center space-x-6">
                    <div
                        className="group flex items-center space-x-4 cursor-pointer p-1.5 rounded-2xl hover:bg-white/5 transition-all duration-300"
                        onClick={onProfileClick}
                    >
                        <div className="flex flex-col items-end hidden sm:block">
                            <span className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{currentUser.name}</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Membre</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl glass-card text-white flex items-center justify-center font-bold text-sm border-white/20 shadow-lg group-hover:scale-110 transition-transform">
                            <span className="text-purple-400">{getInitials(currentUser.name)}</span>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-white/10 mx-2"></div>

                    <Button variant="ghost" size="sm" onClick={onLogout} className="border-white/5 hover:border-white/20">
                        <LogOut className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Quitter</span>
                    </Button>
                </div>
            </div>
        </header>
    );
};
