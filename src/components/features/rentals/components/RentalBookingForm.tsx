import React, { useState, useMemo } from 'react';
import { generateId } from '@/utils/ids';
import { Member, Tool, Rental, Transaction, TransactionType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { ToolAvailabilityCalendar } from '@/components/ui/ToolAvailabilityCalendar';
import { Wrench } from 'lucide-react';
import { formatDate, isMaintenanceBlocked, isMembershipActive } from '@/utils';
import { differenceInDays, parseISO, isFriday } from 'date-fns';

const isDateFriday = (dateStr: string) => isFriday(parseISO(dateStr));

interface RentalBookingFormProps {
    users: Member[];
    tools: Tool[];
    rentals: Rental[];
    onAddRental: (rental: Rental) => Promise<Rental>;
    onUpdateTool: (tool: Tool) => Promise<Tool>;
    onUpdateUser: (user: Member) => Promise<Member>;
    onAddTransaction: (tx: Transaction) => Promise<Transaction>;
    showAlert: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'confirm') => void;
}

export const RentalBookingForm: React.FC<RentalBookingFormProps> = ({
    users,
    tools,
    rentals,
    onAddRental,
    onUpdateTool,
    onUpdateUser,
    onAddTransaction,
    showAlert
}) => {
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedToolId, setSelectedToolId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [manualPrice, setManualPrice] = useState<string>('');
    const [dateError, setDateError] = useState('');

    const selectedUser = users.find(u => u.id === selectedUserId);
    const selectedTool = tools.find(t => t.id === selectedToolId);
    const isUserBlocked = selectedUser ? !isMembershipActive(selectedUser.membershipExpiry) : false;

    const estimatedPrice = useMemo(() => {
        if (!startDate || !endDate || !selectedTool) return 0;
        const days = differenceInDays(parseISO(endDate), parseISO(startDate));
        if (days < 0) return 0;
        const dailyPrice = selectedTool.weeklyPrice / 7;
        return days * dailyPrice;
    }, [startDate, endDate, selectedTool]);

    const handleCreateBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setDateError('');

        if (!selectedUserId || !selectedToolId || !startDate || !endDate) return;

        if (selectedTool && isMaintenanceBlocked(selectedTool)) {
            showAlert("Maintenance Expirée", `Cet outil (${selectedTool.title}) ne peut pas être loué car sa maintenance est expirée.`, 'warning');
            return;
        }

        if (!isDateFriday(startDate) || !isDateFriday(endDate)) {
            setDateError('Les locations doivent commencer et finir un Vendredi.');
            return;
        }

        if (parseISO(startDate) >= parseISO(endDate)) {
            setDateError('La date de fin doit être après la date de début.');
            return;
        }

        const finalPrice = manualPrice ? parseFloat(manualPrice) : estimatedPrice;

        const newRental: Rental = {
            id: generateId(),
            userId: selectedUserId,
            toolId: selectedToolId,
            startDate,
            endDate,
            status: 'active',
            totalPrice: finalPrice,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await onAddRental(newRental);

        if (selectedTool) {
            await onUpdateTool({ ...selectedTool, status: 'rented' });
        }

        if (selectedUser) {
            await onUpdateUser({ ...selectedUser, totalDebt: selectedUser.totalDebt + finalPrice });

            const tx: Transaction = {
                id: generateId(),
                userId: selectedUser.id,
                amount: finalPrice,
                type: TransactionType.RENTAL,
                method: 'system',
                date: new Date().toISOString(),
                description: `Location de ${selectedTool?.title} (${formatDate(startDate)} - ${formatDate(endDate)})`
            };
            await onAddTransaction(tx);
        }

        // Reset Form
        setSelectedUserId('');
        setSelectedToolId('');
        setStartDate('');
        setEndDate('');
        setManualPrice('');
        showAlert("Succès", "Location créée avec succès", "success");
    };

    return (
        <div className="space-y-6">
            <div className="glass-card p-8 border-white/5 sticky top-8 shadow-2xl">
                <form onSubmit={handleCreateBooking} className="space-y-6">
                    <Select
                        label="Sélectionner un Membre"
                        options={users.map(u => ({ id: u.id, name: u.name }))}
                        value={selectedUserId}
                        onChange={setSelectedUserId}
                        placeholder="--- Choisir un membre ---"
                    />

                    <Select
                        label="Outil à Louer"
                        options={tools.map(t => ({ id: t.id, name: t.title, status: t.status }))}
                        value={selectedToolId}
                        onChange={setSelectedToolId}
                        placeholder="--- Choisir l'outil ---"
                    />

                    {selectedTool && isMaintenanceBlocked(selectedTool) && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3">
                            <Wrench className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest">Location Bloquée</p>
                                <p className="text-[10px] text-rose-200/60 font-medium italic">
                                    La maintenance de cet outil est expirée. Niveau : {selectedTool.maintenanceImportance === 'high' ? 'Critique' : 'Moyen'}.
                                </p>
                            </div>
                        </div>
                    )}

                    <DateRangePicker
                        label="Période de Location"
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(start, end) => {
                            setStartDate(start);
                            setEndDate(end);
                        }}
                        error={dateError || undefined}
                        reservedPeriods={selectedToolId ? rentals
                            .filter(r => r.toolId === selectedToolId && (r.status === 'active' || r.status === 'pending'))
                            .map(r => ({ start: r.startDate, end: r.endDate }))
                            : []
                        }
                    />

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Montant Estimé</label>
                        <div className="flex items-center mt-3">
                            <span className="text-gray-500 mr-3 text-xl font-light">€</span>
                            <input
                                type="number"
                                step="0.01"
                                className="block w-full bg-transparent border-none p-0 text-3xl font-black text-white focus:outline-none placeholder-gray-700"
                                placeholder={estimatedPrice.toFixed(2)}
                                value={manualPrice}
                                onChange={(e) => setManualPrice(e.target.value)}
                                aria-label="Montant estimé (dépassement manuel)"
                            />
                        </div>
                    </div>

                    {dateError && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-[10px] font-bold text-rose-300 uppercase tracking-widest">
                            {dateError}
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full py-4 shadow-[0_10px_30px_-5px_rgba(139,92,246,0.3)]"
                        disabled={isUserBlocked || !selectedUserId || !selectedToolId}
                    >
                        Confirmer la Location
                    </Button>
                </form>
            </div>
        </div>
    );
};
