import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Rental } from '@/types';

interface ToolAvailabilityCalendarProps {
    toolId: string;
    rentals: Rental[];
}

export const ToolAvailabilityCalendar: React.FC<ToolAvailabilityCalendarProps> = ({ toolId, rentals }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const toolRentals = rentals.filter(r => r.toolId === toolId && (r.status === 'active' || r.status === 'pending'));

    const isDateReserved = (date: Date) => {
        return toolRentals.some(rental => {
            try {
                const start = parseISO(rental.startDate);
                const end = parseISO(rental.endDate);
                return isWithinInterval(date, { start, end });
            } catch {
                return false;
            }
        });
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const renderHeader = () => (
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
            <button type="button" onClick={prevMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-gray-500 hover:text-white">
                <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex flex-col items-center">
                <span className="text-[9px] font-black text-white uppercase tracking-wider">
                    {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                </span>
            </div>
            <button type="button" onClick={nextMonth} className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-gray-500 hover:text-white">
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );

    const renderDays = () => {
        const days = [];
        const dateNames = ['LU', 'MA', 'ME', 'JE', 'VE', 'SA', 'DI'];
        for (let i = 0; i < 7; i++) {
            days.push(
                <div key={i} className="text-[8px] font-black text-gray-600 uppercase tracking-wide text-center py-2">
                    {dateNames[i]}
                </div>
            );
        }
        return <div className="grid grid-cols-7 border-b border-white/5 px-3">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startOfCal = startOfWeek(monthStart, { weekStartsOn: 1 });

        const rows = [];
        let days = [];
        let day = startOfCal;

        while (rows.length < 6) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const isReserved = isDateReserved(day);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const formattedDate = format(day, "d");
                const isToday = isSameDay(day, new Date());

                days.push(
                    <div
                        key={day.getTime()}
                        className={`relative h-8 flex items-center justify-center transition-all duration-200
                            ${!isCurrentMonth ? "text-gray-800" : "text-gray-300"}
                        `}
                    >
                        <div className={`absolute inset-1 rounded-lg transition-all duration-200
                            ${isReserved && isCurrentMonth ? "bg-rose-500/20 ring-1 ring-rose-500/30" : ""}
                            ${isToday && !isReserved ? "ring-1 ring-purple-500/50" : ""}
                        `}></div>

                        <span className={`relative text-[10px] font-bold z-10 ${isReserved && isCurrentMonth ? "text-rose-400" : ""} ${isToday ? "text-purple-400" : ""}`}>
                            {formattedDate}
                        </span>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(<div className="grid grid-cols-7" key={rows.length}>{days}</div>);
            days = [];
        }
        return <div className="p-3">{rows}</div>;
    };

    return (
        <div className="glass-card bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
            <div className="p-3 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="w-3.5 h-3.5 text-purple-400" />
                    <h4 className="text-[9px] font-black text-purple-400 uppercase tracking-[0.25em]">Disponibilité</h4>
                </div>
            </div>

            {renderHeader()}
            {renderDays()}
            {renderCells()}

            <div className="px-4 py-3 border-t border-white/5 bg-white/[0.02] flex items-center gap-3 text-[8px]">
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-rose-500/20 ring-1 ring-rose-500/30"></div>
                    <span className="text-gray-400 font-medium uppercase tracking-wide">Réservé</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded ring-1 ring-purple-500/50"></div>
                    <span className="text-gray-400 font-medium uppercase tracking-wide">Aujourd'hui</span>
                </div>
            </div>
        </div>
    );
};
