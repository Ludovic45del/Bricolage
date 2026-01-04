import React from 'react';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { Tool } from '@/types';

interface ToolImageGalleryProps {
    images: Tool['images'];
    title: string;
    currentIndex: number;
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
}

export const ToolImageGallery: React.FC<ToolImageGalleryProps> = ({
    images,
    title,
    currentIndex,
    setCurrentIndex
}) => {
    if (!images || images.length === 0) {
        return (
            <div className="relative group/img h-[240px] w-full rounded-3xl overflow-hidden shadow-xl border border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                <div className="w-full h-full flex items-center justify-center">
                    <Settings className="w-16 h-16 text-gray-700/30" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="relative group/img h-[240px] w-full rounded-3xl overflow-hidden shadow-xl border border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                <img
                    src={images[currentIndex]?.filePath}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                />
                {images.length > 1 && (
                    <>
                        <button
                            onClick={() => setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 backdrop-blur-xl rounded-full text-white opacity-0 group-hover/img:opacity-100 transition-all hover:bg-black/60"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 backdrop-blur-xl rounded-full text-white opacity-0 group-hover/img:opacity-100 transition-all hover:bg-black/60"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </>
                )}
            </div>

            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${i === currentIndex ? 'border-purple-500 scale-105 shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'border-transparent opacity-40 hover:opacity-100'}`}
                        >
                            <img src={img.filePath} className="w-full h-full object-cover" alt="" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
