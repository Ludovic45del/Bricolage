import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, isFriday, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerProps {
    date: string; // ISO String YYYY-MM-DD
    onChange: (date: string) => void;
    label: string;
    error?: string;
    placeholder?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ date, onChange, label, error, placeholder = "Sélectionner une date" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(date ? parseISO(date) : new Date());
    const containerRef = useRef<HTMLDivElement>(null);

    // Reset current month when opening if date exists
    useEffect(() => {
        if (isOpen && date) {
            const parsed = parseISO(date);
            if (isValid(parsed)) {
                setCurrentMonth(parsed);
            }
        }
    }, [isOpen, date]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        if (isOpen) document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    const onDateClick = (day: Date) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        onChange(dateStr);
        setIsOpen(false);
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const renderHeader = () => (
        <div className="relative border-b border-white/5 bg-white/[0.02]">
            <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl transition-all text-gray-500 hover:text-white z-10"
                aria-label="Fermer"
            >
                <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center gap-8 px-6 py-4">
                <button type="button" onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-500 hover:text-white">
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] whitespace-nowrap">
                    {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                </span>

                <button type="button" onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-500 hover:text-white">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
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
        const start = date ? parseISO(date) : null;

        const rows = [];
        let days = [];
        let day = startOfCal;

        while (rows.length < 6) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const isSelected = start && isSameDay(day, start);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const formattedDate = format(day, "d");

                days.push(
                    <div
                        key={day.getTime()}
                        className={`relative h-14 flex items-center justify-center cursor-pointer transition-all duration-300 group/cell
                            ${!isCurrentMonth ? "text-gray-800" : "text-gray-300 hover:text-white"}
                        `}
                        onClick={() => onDateClick(cloneDay)}
                    >
                        {/* Selection Circle */}
                        <div className={`absolute inset-2 rounded-2xl transition-all duration-300
                            ${isSelected ? "bg-purple-600 shadow-[0_0_20px_rgba(139,92,246,0.4)] ring-2 ring-purple-400/50" : "group-hover/cell:bg-white/5"}
                        `}></div>

                        <span className={`relative text-sm font-bold z-10 ${isSelected ? "text-white" : ""}`}>
                            {formattedDate}
                        </span>
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
        <div className="relative" ref={containerRef}>
            {label && <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 block mb-2">{label}</label>}
            <div
                onClick={() => setIsOpen(true)}
                className={`flex items-center w-full rounded-2xl glass-input p-3 text-sm transition-all cursor-pointer group hover:bg-white/5 active:scale-[0.98] border border-transparent
                    ${isOpen ? '!border-purple-500/50 bg-white/5' : ''}
                    ${error ? 'border-rose-500/50 bg-rose-500/5' : ''}
                `}
            >
                <CalendarIcon className={`w-4 h-4 mr-3 transition-colors ${isOpen ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-400'}`} />
                <span className={`${date ? 'text-white font-bold' : 'text-gray-400 italic'}`}>
                    {date ? format(parseISO(date), 'd MMMM yyyy', { locale: fr }) : placeholder}
                </span>
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
                        {renderHeader()}
                        {renderDays()}
                        {renderCells()}

                        <div className="px-8 pb-8 flex justify-center">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-black text-white uppercase tracking-widest transition-all border border-white/5"
                            >
                                Confirmer
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
