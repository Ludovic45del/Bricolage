import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Wrench, Calendar, DollarSign, BarChart3, LogOut } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { AlertModal } from '@/components/ui/AlertModal';

export type OutletContextType = {
    showAlert: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'confirm', onConfirm?: () => void) => void;
};

export const MainLayout: React.FC = () => {
    const { currentUser, logout, rentals, users } = useStore();
    const location = useLocation();
    const navigate = useNavigate();

    // Alert Modal State
    const [alertConfig, setAlertConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'info' | 'success' | 'warning' | 'confirm';
        onConfirm?: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    const showAlert = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'confirm' = 'info', onConfirm?: () => void) => {
        setAlertConfig({ isOpen: true, title, message, type, onConfirm });
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Notification Counts
    const pendingRentalsCount = rentals.filter(r => r.status === 'pending').length;
    const debtorsCount = users.filter(u => u.totalDebt > 0).length;

    const navItems = [
        { id: 'members', label: 'Membres', icon: Users, path: '/members' },
        { id: 'inventory', label: 'Inventaire', icon: Wrench, path: '/inventory' },
        { id: 'rentals', label: 'Locations', icon: Calendar, path: '/rentals', badge: pendingRentalsCount, badgeColor: 'bg-red-500' },
        { id: 'finance', label: 'Finances', icon: DollarSign, path: '/finance', badge: debtorsCount, badgeColor: 'bg-red-500' },
        { id: 'reports', label: 'Rapports', icon: BarChart3, path: '/reports' },
    ];

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-transparent">
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-72 glass-sidebar text-white flex-shrink-0 flex flex-col m-4 rounded-3xl overflow-hidden">
                <div className="p-8">
                    <div className="flex items-center space-x-3 mb-12">
                        <div className="p-2 glass-card rounded-xl">
                            <LayoutDashboard className="w-8 h-8 text-purple-300" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-purple-400">Section Bricolage</span>
                    </div>

                    <nav className="space-y-3">
                        {navItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <NavLink
                                    key={item.id}
                                    to={item.path}
                                    className={`w-full relative flex items-center justify-between px-5 py-4 rounded-2xl transition-colors duration-300 group ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebarActive"
                                            className="absolute inset-0 bg-white/10 glass-card rounded-2xl border-white/20"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <div className="flex items-center space-x-4 relative z-10">
                                        <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-300' : ''}`} />
                                        <span className="font-medium">{item.label}</span>
                                    </div>
                                    {item.badge && item.badge > 0 && (
                                        <span className={`relative z-10 ${item.badgeColor} backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ring-white/20`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-6 mt-auto border-t border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-purple-400 font-bold border border-white/10">
                                {currentUser?.name.charAt(0) || 'A'}
                            </div>
                            <div>
                                <p className="text-sm font-semibold truncate max-w-[120px]">{currentUser?.name || 'Utilisateur'}</p>
                                <p className="text-[11px] text-gray-400 uppercase tracking-widest font-bold">
                                    {currentUser?.role || 'Guest'}
                                </p>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors border border-transparent hover:border-white/5">
                            <LogOut className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-8 md:p-12 overflow-auto h-screen">
                <div className="max-w-full mx-auto pb-12 px-4 md:px-0">
                    <Outlet context={{ showAlert }} />
                </div>
            </main>

            <AlertModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={alertConfig.onConfirm}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
            />
        </div>
    );
};
