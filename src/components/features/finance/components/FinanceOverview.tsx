import React from 'react';
import { Transaction } from '@/types';
import { formatCurrency } from '@/utils';
import { Wallet, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface FinanceOverviewProps {
    transactions: Transaction[];
}

export const FinanceOverview: React.FC<FinanceOverviewProps> = ({ transactions }) => {
    // Revenu Total = sum of all transactions that are paid
    const totalRevenue = transactions
        .filter(t => t.status === 'paid')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // En Attente = sum of all transactions that are pending
    const pendingRevenue = transactions
        .filter(t => t.status === 'pending')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const stats = [
        { title: 'Revenu Total', value: totalRevenue, icon: Wallet, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { title: 'En Attente', value: pendingRevenue, icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.map((stat, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card p-6 border-white/5 relative overflow-hidden group"
                >
                    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 ${stat.color}`}>
                        <stat.icon size={60} />
                    </div>

                    <div className="relative z-10">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{stat.title}</p>
                        <h3 className="text-2xl font-black text-white mt-1">
                            {formatCurrency(stat.value)}
                        </h3>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
