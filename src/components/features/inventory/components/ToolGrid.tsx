import React from 'react';
import { Tool } from '@/types';
import { ToolCard } from './ToolCard';
import { ToolListItem } from './ToolListItem';
import { Search } from 'lucide-react';

interface ToolGridProps {
    tools: Tool[];
    viewMode: 'grid' | 'list';
    onToolClick: (tool: Tool) => void;
}

export const ToolGrid: React.FC<ToolGridProps> = ({ tools, viewMode, onToolClick }) => {
    if (tools.length === 0) {
        return (
            <div className="flex flex-col gap-4 items-center justify-center py-24 glass-card border-white/5 text-gray-600">
                <Search className="w-16 h-16 opacity-20" />
                <p className="text-lg font-light italic">Aucun outil ne correspond à votre recherche.</p>
            </div>
        );
    }

    return (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
            {tools.map((tool) => (
                viewMode === 'grid' ? (
                    <ToolCard
                        key={tool.id}
                        tool={tool}
                        onClick={onToolClick}
                    />
                ) : (
                    <ToolListItem
                        key={tool.id}
                        tool={tool}
                        onClick={onToolClick}
                    />
                )
            ))}
        </div>
    );
};
