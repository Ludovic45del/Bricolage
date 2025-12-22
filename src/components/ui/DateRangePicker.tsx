import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, isFriday, parseISO, isAfter, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DateRangePickerProps {
    startDate: string;
    endDate: string;
    onChange: (start: string, end: string) => void;
    label: string;
    error?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ startDate, endDate, onChange, label, error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(startDate ? parseISO(startDate) : new Date());
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        if (isOpen) document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    const onDateClick = (day: Date) => {
        const dateStr = format(day, 'yyyy-MM-dd');

        if (!startDate || (startDate && endDate)) {
            // First click or reset
            onChange(dateStr, "");
        } else {
            // Second click
            const start = parseISO(startDate);
            if (isBefore(day, start)) {
                onChange(dateStr, startDate);
            } else {
                onChange(startDate, dateStr);
            }
            // Optional: auto-close after range selection? 
            // Better to keep open for visual confirmation or allow manual close.
            // Let's auto-close for better UX if both are selected.
            setIsOpen(false);
        }
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const renderHeader = () => (
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02]">
            <button type="button" onClick={prevMonth} className="p-3 hover:bg-white/10 rounded-2xl transition-all text-gray-500 hover:text-white">
                <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center">
                <span className="text-[12px] font-black text-white uppercase tracking-[0.3em]">
                    {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                </span>
            </div>
            <button type="button" onClick={nextMonth} className="p-3 hover:bg-white/10 rounded-2xl transition-all text-gray-500 hover:text-white">
                <ChevronRight className="w-6 h-6" />
            </button>
        </div>
    );

    const renderDays = () => {
        const days = [];
        const dateNames = ['LU', 'MA', 'ME', 'JE', 'VE', 'SA', 'DI'];
        for (let i = 0; i < 7; i++) {
            days.push(
                <div key={i} className="text-[10px] font-black text-gray-600 uppercase tracking-widest text-center py-4">
                    {dateNames[i]}
                </div>
            );
        }
        return <div className="grid grid-cols-7 border-b border-white/5 px-6">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startOfCal = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endOfCal = endOfWeek(monthEnd, { weekStartsOn: 1 });

        const rows = [];
        let days = [];
        let day = startOfCal;

        const start = startDate ? parseISO(startDate) : null;
        const end = endDate ? parseISO(endDate) : null;

        while (rows.length < 6) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const isSelectedStart = start && isSameDay(day, start);
                const isSelectedEnd = end && isSameDay(day, end);
                const isWithinRange = start && end && isAfter(day, start) && isBefore(day, end);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isFri = isFriday(day);
                const formattedDate = format(day, "d");

                days.push(
                    <div
                        key={day.getTime()}
                        className={`relative h-14 flex items-center justify-center cursor-pointer transition-all duration-300 group/cell
                            ${!isCurrentMonth ? "text-gray-800" : "text-gray-300 hover:text-white"}
                        `}
                        onClick={() => onDateClick(cloneDay)}
                    >
                        {/* Range Background */}
                        {isWithinRange && isCurrentMonth && (
                            <div className="absolute inset-y-2 inset-x-0 bg-purple-500/10"></div>
                        )}
                        {isSelectedStart && end && (
                            <div className="absolute inset-y-2 right-0 left-1/2 bg-purple-500/10"></div>
                        )}
                        {isSelectedEnd && start && (
                            <div className="absolute inset-y-2 left-0 right-1/2 bg-purple-500/10"></div>
                        )}

                        {/* Selection Circle */}
                        <div className={`absolute inset-2 rounded-2xl transition-all duration-300
                            ${isSelectedStart || isSelectedEnd ? "bg-purple-600 shadow-[0_0_20px_rgba(139,92,246,0.4)] ring-2 ring-purple-400/50" : "group-hover/cell:bg-white/5"}
                        `}></div>

                        <span className={`relative text-sm font-bold z-10 ${isSelectedStart || isSelectedEnd ? "text-white" : ""}`}>
                            {formattedDate}
                        </span>

                        {isFri && isCurrentMonth && (
                            <div className={`absolute bottom-3 w-1.5 h-1.5 rounded-full transition-colors
                                ${isSelectedStart || isSelectedEnd ? "bg-white" : "bg-purple-500 shadow-[0_0_10px_rgba(139,92,246,1)] animate-pulse"}
                            `}></div>
                        )}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(<div className="grid grid-cols-7" key={rows.length}>{days}</div>);
            days = [];
        }
        return <div className="p-6">{rows}</div>;
    };

    return (
        <div className="relative space-y-2" ref={containerRef}>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">{label}</label>
            <div
                onClick={() => setIsOpen(true)}
                className={`flex items-center w-full rounded-2xl glass-input p-4 text-sm transition-all cursor-pointer group hover:bg-white/5 active:scale-[0.98] border border-transparent
                    ${isOpen ? '!border-purple-500/50 bg-white/5' : ''}
                    ${error ? 'border-rose-500/50 bg-rose-500/5' : ''}
                `}
            >
                <CalendarIcon className={`w-4 h-4 mr-3 transition-colors ${isOpen ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-400'}`} />
                <div className="flex-1 flex items-center justify-between">
                    <span className={`${startDate ? 'text-white font-bold' : 'text-gray-700 italic'}`}>
                        {startDate ? format(parseISO(startDate), 'dd MMM yyyy', { locale: fr }) : 'Début'}
                    </span>
                    <div className="h-px w-4 bg-gray-800 mx-2"></div>
                    <span className={`${endDate ? 'text-white font-bold' : 'text-gray-700 italic'}`}>
                        {endDate ? format(parseISO(endDate), 'dd MMM yyyy', { locale: fr }) : 'Fin'}
                    </span>
                </div>
            </div>

            {isOpen && createPortal(
                <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Calendar Card */}
                    <div className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] overflow-hidden animate-scale-in">
                        <div className="absolute top-6 right-6 z-10">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-500 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {renderHeader()}
                        {renderDays()}
                        {renderCells()}

                        <div className="px-8 pb-8 flex justify-center">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-black text-white uppercase tracking-widest transition-all border border-white/5"
                            >
                                Confirmer la Période
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {error && (
                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest ml-1 animate-pulse">
                    {error}
                </p>
            )}
        </div>
    );
};
