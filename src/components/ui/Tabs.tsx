import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Tab {
    id: string;
    label: string;
    icon?: React.ReactNode;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (tabId: string) => void;
    className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = 'border-b border-white/10' }) => {
    return (
        <div className={className}>
            <nav className="flex gap-1" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`
              relative px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors duration-300
              ${activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'}
            `}
                        aria-current={activeTab === tab.id ? 'page' : undefined}
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {tab.icon}
                            {tab.label}
                        </span>
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </button>
                ))}
            </nav>
        </div>
    );
};

interface TabPanelProps {
    children: React.ReactNode;
    isActive: boolean;
    className?: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({ children, isActive, className = '' }) => {
    if (!isActive) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4, cubicBezier: [0.4, 0, 0.2, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
};
