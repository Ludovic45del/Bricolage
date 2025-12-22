import React, { useState } from 'react';
import { Member as User, isMembershipActive } from '../api/memberTypes';
import { Tool } from '../api/types'; // Tool is V2
import { Rental as Reservation } from '../api/rentalTypes'; // Reservation V2
import { Transaction, TransactionType } from '../constants'; // Transaction V2
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { formatCurrency, formatDate, isMaintenanceBlocked } from '../utils';
import { AlertTriangle, CheckCircle, Clock, History, Mail, Wrench } from 'lucide-react';
import { Select } from './ui/Select';
import { DateRangePicker } from './ui/DateRangePicker';
import { EmailEditorModal } from './ui/EmailEditorModal';
import { differenceInDays, parseISO, isFriday } from 'date-fns';
import { RentalDetailModal } from './rentals/RentalDetailModal';
import { useHistoryFilters } from '../hooks/useHistoryFilters';
import { HistoryFilterBar } from './HistoryFilterBar';

// Helper for Friday
const isDateFriday = (dateStr: string) => isFriday(parseISO(dateStr));

interface RentalsTabProps {
  users: User[];
  tools: Tool[];
  rentals: Reservation[];
  transactions: Transaction[];
  onAddRental: (rental: Reservation) => Promise<Reservation>;
  onUpdateRental: (rental: Reservation) => Promise<Reservation>;
  onUpdateTool: (tool: Tool) => Promise<Tool>;
  onUpdateUser: (user: User) => Promise<User>;
  onAddTransaction: (tx: Transaction) => Promise<Transaction>;
  showAlert: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'confirm', onConfirm?: () => void) => void;
}

export const RentalsTab: React.FC<RentalsTabProps> = ({
  users,
  tools,
  rentals,
  transactions,
  onAddRental,
  onUpdateRental,
  onUpdateTool,
  onUpdateUser,
  onAddTransaction,
  showAlert
}) => {
  // Booking Form State
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedToolId, setSelectedToolId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [manualPrice, setManualPrice] = useState<string>('');
  const [dateError, setDateError] = useState('');

  // Approval Modal State
  const [approvalRental, setApprovalRental] = useState<Reservation | null>(null);
  const [approvalPrice, setApprovalPrice] = useState<number>(0);

  // Email Editor State
  const [emailConfig, setEmailConfig] = useState<{
    isOpen: boolean;
    recipient: string;
    subject: string;
    body: string;
  }>({
    isOpen: false,
    recipient: '',
    subject: '',
    body: ''
  });

  // Return Modal State
  const [returningRental, setReturningRental] = useState<Reservation | null>(null);
  const [returnComment, setReturnComment] = useState('');
  const [viewingRental, setViewingRental] = useState<Reservation | null>(null);

  const selectedUser = users.find(u => u.id === selectedUserId);
  const selectedTool = tools.find(t => t.id === selectedToolId);

  const isUserBlocked = selectedUser ? !isMembershipActive(selectedUser.membershipExpiry) : false;

  // Helpers for approval modal
  const approvalUser = users.find(u => u.id === approvalRental?.userId);
  const isApprovalUserExpired = approvalUser ? !isMembershipActive(approvalUser.membershipExpiry) : false;

  // Calculate estimated price for manual booking
  // V2 uses weeklyPrice. We need to handle logic. 
  // Let's assume weeklyPrice is base, calculate approximate daily or just use weekly logic.
  // Legacy code used daily_price. V2 has weeklyPrice.
  // We can derive daily price as weekly / 7 for estimation.
  const estimatedPrice = React.useMemo(() => {
    if (!startDate || !endDate || !selectedTool) return 0;
    const days = differenceInDays(parseISO(endDate), parseISO(startDate));
    if (days < 0) return 0;
    const dailyPrice = selectedTool.weeklyPrice / 7;
    return days * dailyPrice;
  }, [startDate, endDate, selectedTool]);

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return 'Disponible';
      case 'rented': return 'Loué';
      case 'maintenance': return 'Maintenance';
      case 'active': return 'En cours';
      case 'pending': return 'En attente';
      case 'rejected': return 'Refusé';
      case 'completed': return 'Terminé';
      case 'late': return 'En retard';
      default: return status;
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setDateError('');

    if (!selectedUserId || !selectedToolId || !startDate || !endDate) return;

    if (selectedTool && isMaintenanceBlocked(selectedTool)) {
      showAlert("Maintenance Expiree", `Cet outil (${selectedTool.title}) ne peut pas être loué car sa maintenance est expirée et son niveau d'importance est fixé sur Moyen ou Critique.`, 'warning');
      return;
    }

    if (!isDateFriday(startDate) || !isDateFriday(endDate)) {
      setDateError('Les locations doivent impérativement commencer et finir un Vendredi.');
      return;
    }

    if (parseISO(startDate) >= parseISO(endDate)) {
      setDateError('La date de fin doit être après la date de début.');
      return;
    }

    const finalPrice = manualPrice ? parseFloat(manualPrice) : estimatedPrice;

    const newRental: Reservation = {
      id: Date.now().toString(),
      userId: selectedUserId,
      toolId: selectedToolId,
      startDate: startDate,
      endDate: endDate,
      status: 'active',
      totalPrice: finalPrice,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await onAddRental(newRental);

    // Update tool status
    if (selectedTool) {
      await onUpdateTool({ ...selectedTool, status: 'rented' });
    }

    // FINANCE UPDATE: Add debt immediately upon creation
    if (selectedUser) {
      await onUpdateUser({ ...selectedUser, totalDebt: selectedUser.totalDebt + finalPrice });

      const tx: Transaction = {
        id: Date.now().toString(),
        userId: selectedUser.id,
        amount: finalPrice,
        type: TransactionType.RENTAL,
        method: 'System',
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

  const initiateApproval = (rental: Reservation) => {
    const tool = tools.find(t => t.id === rental.toolId);
    if (tool?.status !== 'available') {
      showAlert("Action Impossible", "L'outil n'est pas disponible pour le moment.", 'warning');
      return;
    }

    // Calculate default price
    const days = differenceInDays(parseISO(rental.endDate), parseISO(rental.startDate));
    const price = days * ((tool?.weeklyPrice || 0) / 7);

    setApprovalRental(rental);
    setApprovalPrice(price);
  };

  const confirmApproval = async () => {
    if (!approvalRental) return;

    const tool = tools.find(t => t.id === approvalRental.toolId);
    const user = users.find(u => u.id === approvalRental.userId);

    // 1. Update Rental Status
    await onUpdateRental({
      ...approvalRental,
      status: 'active',
      totalPrice: approvalPrice
    });

    // 2. Lock Tool
    if (tool) {
      await onUpdateTool({ ...tool, status: 'rented' });
    }

    // 3. FINANCE UPDATE: Charge User Immediately
    if (user) {
      await onUpdateUser({ ...user, totalDebt: user.totalDebt + approvalPrice });

      const tx: Transaction = {
        id: Date.now().toString(),
        userId: user.id,
        amount: approvalPrice,
        type: TransactionType.RENTAL,
        method: 'System',
        date: new Date().toISOString(),
        description: `Demande Location Approuvée : ${tool?.title}`
      };
      await onAddTransaction(tx);
    }

    setApprovalRental(null);
    showAlert("Succès", "Demande approuvée", "success");
  };

  const handleRejectRequest = async (rental: Reservation) => {
    await onUpdateRental({ ...rental, status: 'rejected' });
  };

  const handleReturn = (rental: Reservation) => {
    setReturningRental(rental);
    setReturnComment('');
  };

  const confirmReturn = async () => {
    if (!returningRental) return;

    const rentalTool = tools.find(t => t.id === returningRental.toolId);
    if (!rentalTool) return;

    const updatedRental: Reservation = {
      ...returningRental,
      status: 'completed',
      endDate: new Date().toISOString()
    };

    // Create condition entry
    const newCondition = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      comment: returnComment.trim() || 'Retour effectué (sans commentaire particulier).',
      statusAtTime: 'available' as const,
      adminName: 'Administrateur Bricolage',
      adminId: 'admin' // Placeholder
    };

    const updatedTool: Tool = {
      ...rentalTool,
      status: 'available',
      conditions: [newCondition, ...(rentalTool.conditions || [])]
    };

    await onUpdateRental(updatedRental);
    await onUpdateTool(updatedTool);
    setReturningRental(null);
    showAlert("Succès", "Retour confirmé", "success");
  };

  const handleSendOverdueEmail = (rental: Reservation) => {
    const user = users.find(u => u.id === rental.userId);
    const tool = tools.find(t => t.id === rental.toolId);
    if (!user || !tool) return;

    setEmailConfig({
      isOpen: true,
      recipient: user.email,
      subject: `Retard retour outil - ${tool.title}`,
      body: `Bonjour ${user.name},\n\nVous avez dépassé la date de retour (${formatDate(rental.endDate)}) pour l'outil "${tool.title}".\n\nMerci de le rapporter dès que possible pour éviter des pénalités.\n\nCordialement.`
    });
  };

  const activeRentals = rentals.filter(r => r.status === 'active');
  const pendingRentals = rentals.filter(r => r.status === 'pending');
  // History rentals
  const historyRentals = rentals.filter(r => r.status === 'completed' || r.status === 'rejected');

  const {
    filter,
    setFilter,
    sort,
    requestSort,
    filteredData: filteredRentals,
    availableYears
  } = useHistoryFilters<Reservation>(
    historyRentals,
    (r) => r.endDate || r.createdAt,
    (r) => r.toolId // Accessor for tool ID
  );

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: New Booking Form */}
        <div className="lg:col-span-1 space-y-8">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center tracking-tight">
              <div className="w-1 h-6 bg-purple-500/50 rounded-full mr-4"></div>
              Nouvelle Location
            </h3>
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
                  options={tools.filter(t => t.status === 'available').map(t => ({ id: t.id, name: t.title }))}
                  value={selectedToolId}
                  onChange={setSelectedToolId}
                  placeholder="--- Choisir l'outil ---"
                />

                {selectedTool && isMaintenanceBlocked(selectedTool) && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3">
                    <Wrench className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest leading-relaxed">Location Bloquée</p>
                      <p className="text-[10px] text-rose-200/60 font-medium leading-relaxed italic">
                        La maintenance de cet outil est expirée. Niveau d'importance : {selectedTool.maintenanceImportance === 'high' ? 'Critique' : 'Moyen'}.
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
                />

                <div className="glass-card p-5 border-white/5 bg-white/5">
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
                    />
                  </div>
                </div>

                {dateError && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-[10px] font-bold text-rose-300 uppercase tracking-widest leading-relaxed">
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
        </div>

        {/* Right Column: Active & Pending */}
        <div className="lg:col-span-2 space-y-12">

          {/* Pending Requests Section */}
          {pendingRentals.length > 0 && (
            <div className="animate-fade-in group">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center tracking-tight">
                <div className="w-1 h-6 bg-amber-500/50 rounded-full mr-4"></div>
                Demandes en attente
                <span className="ml-4 bg-amber-500/10 text-amber-300 text-[10px] font-black px-3 py-1 rounded-full border border-amber-500/20">{pendingRentals.length}</span>
              </h3>
              <div className="space-y-6">
                {pendingRentals.map(rental => {
                  const tool = tools.find(t => t.id === rental.toolId);
                  const user = users.find(u => u.id === rental.userId);
                  if (!tool || !user) return null;

                  return (
                    <div key={rental.id} className="glass-card p-6 border-white/5 hover:border-amber-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl transition-all duration-500 hover:scale-[1.01]">
                      <div>
                        <h4 className="font-bold text-white text-xl tracking-tight leading-none mb-2">{tool.title}</h4>
                        <div className="flex items-center text-sm text-gray-500 font-medium">
                          Initié par : <span className="font-bold text-gray-300 ml-2">{user.name}</span>
                          <span className={`ml-3 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${isMembershipActive(user.membershipExpiry)
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                            }`}>
                            {isMembershipActive(user.membershipExpiry) ? 'Actif' : 'Expiré'}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mt-4 flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-2"></span>
                          {formatDate(rental.startDate)} ➔ {formatDate(rental.endDate)}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-white/5">
                        <Button variant="ghost" size="sm" className="flex-1 md:flex-none border-white/5 hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/20" onClick={() => handleRejectRequest(rental)}>
                          Décliner
                        </Button>
                        <Button variant="secondary" size="sm" className="flex-1 md:flex-none shadow-lg shadow-amber-500/10" onClick={() => initiateApproval(rental)}>
                          Approuver
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Rentals Section */}
          <div className="group">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center tracking-tight">
              <div className="w-1 h-6 bg-purple-500/50 rounded-full mr-4"></div>
              Locations en cours
            </h3>
            {activeRentals.length === 0 ? (
              <div className="text-center py-20 glass-card border-white/5 text-gray-600 italic font-light shadow-inner">
                Aucune location active détectée dans le système.
              </div>
            ) : (
              <div className="grid gap-6">
                {activeRentals.map(rental => {
                  const tool = tools.find(t => t.id === rental.toolId);
                  const user = users.find(u => u.id === rental.userId);
                  if (!tool || !user) return null;

                  const isLate = parseISO(rental.endDate) < new Date();

                  return (
                    <div key={rental.id} className={`group glass-card p-6 border transition-all duration-500 hover:scale-[1.01] ${isLate ? 'border-rose-500/30 bg-rose-500/5 shadow-[0_15px_40px_-10px_rgba(244,63,94,0.15)]' : 'border-white/5 hover:border-white/20'}`}>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex-1">
                          <h4 className="font-black text-white text-xl tracking-tight mb-3 group-hover:text-purple-400 transition-colors">{tool.title}</h4>
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center bg-white/5 px-3 py-1.5 rounded-2xl border border-white/5">
                              <div className="h-6 w-6 rounded-lg glass-card flex items-center justify-center text-[10px] font-black text-purple-300 mr-2 shadow-inner">
                                {user.name.charAt(0)}
                              </div>
                              <span className="text-xs font-bold text-gray-300">{user.name}</span>
                            </div>

                            <div className="text-[10px] font-black text-gray-500 tracking-[0.15em] uppercase flex items-center bg-white/5 px-3 py-1.5 rounded-2xl border border-white/5">
                              <Clock className="w-3.5 h-3.5 mr-2 text-gray-600" />
                              {formatDate(rental.startDate)} <span className="mx-2 text-gray-700">➔</span> {formatDate(rental.endDate)}
                            </div>

                            <div className="text-xs font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] bg-emerald-500/5 px-3 py-1.5 rounded-2xl border border-emerald-500/10">
                              {rental.totalPrice ? formatCurrency(rental.totalPrice) : 'N/A'}
                            </div>
                          </div>

                          {isLate && (
                            <div className="mt-6 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-700">
                              <span className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-rose-400 bg-rose-500/20 px-3 py-1.5 rounded-full border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                                <AlertTriangle className="w-4 h-4 mr-2 animate-bounce" /> Retard
                              </span>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleSendOverdueEmail(rental)}
                                className="shadow-lg shadow-rose-900/30 border-rose-500/20"
                              >
                                <Mail className="w-3.5 h-3.5 mr-2" /> Envoyer Rappel
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 border-white/5">
                          <Button variant="secondary" size="sm" className="w-full md:w-auto shadow-xl group-hover:scale-105 transition-transform" onClick={() => handleReturn(rental)}>
                            <CheckCircle className="w-4 h-4 mr-2" /> Terminer la Location
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rental History Section */}
      <div className="pt-12 mt-10 border-t border-white/5 opacity-80 hover:opacity-100 transition-opacity">
        <h3 className="text-xl font-bold text-white mb-8 flex items-center tracking-tight">
          <History className="w-6 h-6 mr-3 text-gray-500" /> Historique des Locations
        </h3>

        <HistoryFilterBar
          filter={filter}
          setFilter={setFilter}
          availableYears={availableYears}
          tools={tools.map(t => ({ id: t.id, name: t.title }))}
        />

        <div className="glass-card shadow-2xl border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5">
              <thead className="bg-white/5">
                <tr>
                  <th onClick={() => requestSort('toolId')} className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Outil {sort.key === 'toolId' && (sort.direction === 'asc' ? '↑' : '↓')}</th>
                  <th onClick={() => requestSort('userId')} className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Membre {sort.key === 'userId' && (sort.direction === 'asc' ? '↑' : '↓')}</th>
                  <th onClick={() => requestSort('startDate')} className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Intervalles {sort.key === 'startDate' && (sort.direction === 'asc' ? '↑' : '↓')}</th>
                  <th onClick={() => requestSort('status')} className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Statut {sort.key === 'status' && (sort.direction === 'asc' ? '↑' : '↓')}</th>
                  <th onClick={() => requestSort('totalPrice')} className="px-8 py-5 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Coût {sort.key === 'totalPrice' && (sort.direction === 'asc' ? '↑' : '↓')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-400 font-light">
                {filteredRentals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-sm italic opacity-30">L'historique est vide.</td>
                  </tr>
                ) : (
                  filteredRentals.map(rental => {
                    const tool = tools.find(t => t.id === rental.toolId);
                    const user = users.find(u => u.id === rental.userId);
                    return (
                      <tr
                        key={rental.id}
                        onClick={() => setViewingRental(rental)}
                        className="hover:bg-white/5 transition-colors group cursor-pointer"
                      >
                        <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                          {tool?.title || 'Outil Disparu'}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                          {user?.name || 'Inconnu'}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-xs font-medium tracking-tighter">
                          {formatDate(rental.startDate)} — {formatDate(rental.endDate)}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-md ${rental.status === 'completed' ? 'bg-white/5 text-gray-500 border-white/10' : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                            }`}>
                            {getStatusLabel(rental.status)}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-black text-white">
                          {rental.totalPrice ? formatCurrency(rental.totalPrice) : '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Approval Modal Content Redesigned using existing Modal component structure */}
      <Modal
        isOpen={!!approvalRental}
        onClose={() => setApprovalRental(null)}
        title="Détails de la Réservation"
      >
        <div className="space-y-8">
          <div className={`p-6 rounded-[32px] border flex items-start space-x-4 ${isApprovalUserExpired ? 'bg-rose-500/10 border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.1)]' : 'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]'}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${isApprovalUserExpired ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {isApprovalUserExpired ? (
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              ) : (
                <CheckCircle className="w-6 h-6" />
              )}
            </div>
            <div>
              <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isApprovalUserExpired ? 'text-rose-300' : 'text-emerald-300'}`}>
                {isApprovalUserExpired ? 'Adhésion Expirée' : 'Adhésion Valide'}
              </h4>
              <p className={`text-xs font-medium leading-relaxed ${isApprovalUserExpired ? 'text-rose-200/70' : 'text-emerald-200/70'}`}>
                {isApprovalUserExpired
                  ? `Attention : Le cycle a expiré le ${formatDate(approvalUser?.membershipExpiry || '')}.`
                  : `Le cycle est valide jusqu'au ${formatDate(approvalUser?.membershipExpiry || '')}.`
                }
              </p>
            </div>
          </div>

          <div className="glass-card p-6 border-white/10 space-y-4 shadow-inner bg-white/5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Membre Demandeur</span>
              <span className="font-bold text-white tracking-tight">{approvalUser?.name}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Outil Loué</span>
              <span className="font-bold text-white tracking-tight">{tools.find(t => t.id === approvalRental?.toolId)?.title}</span>
            </div>
            <div className="flex justify-between items-center text-sm pt-4 border-t border-white/[0.03]">
              <span className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Période de Location</span>
              <span className="font-black text-gray-300">
                {formatDate(approvalRental?.startDate || '')} ➔ {formatDate(approvalRental?.endDate || '')}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-1">Montant à Facturer (€)</label>
            <div className="relative group">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 text-2xl font-light">€</span>
              <input
                type="number"
                step="0.01"
                className="block w-full rounded-[32px] glass-input p-6 pl-14 text-4xl font-black transition-all focus:ring-0 shadow-lg"
                value={approvalPrice}
                onChange={(e) => setApprovalPrice(parseFloat(e.target.value))}
              />
            </div>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-4 ml-1 italic text-center">Ce montant sera ajouté à la balance du membre.</p>
          </div>

          <div className="flex justify-end w-full pt-10">
            <Button
              onClick={confirmApproval}
              variant="primary"
              size="lg"
              className="w-full py-6 rounded-[24px] shadow-[0_20px_50px_-10px_rgba(139,92,246,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] text-xl font-black uppercase tracking-widest"
            >
              Valider & Facturer
            </Button>
          </div>
        </div>
      </Modal>

      <EmailEditorModal
        isOpen={emailConfig.isOpen}
        onClose={() => setEmailConfig({ ...emailConfig, isOpen: false })}
        recipientEmail={emailConfig.recipient}
        initialSubject={emailConfig.subject}
        initialBody={emailConfig.body}
        onSend={() => {
          showAlert("Succès", "Rappel de retard envoyé !", 'success');
          setEmailConfig({ ...emailConfig, isOpen: false });
        }}
      />

      <Modal
        isOpen={!!returningRental}
        onClose={() => setReturningRental(null)}
        title="Retour d'Outil"
      >
        <div className="space-y-8">
          <div className="p-6 rounded-[32px] border border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.1)] flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-emerald-300">Confirmation de Retour</h4>
              <p className="text-xs font-medium text-emerald-200/70">
                Confirmez-vous que l'outil a été rendu en bon état ?
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Commentaire sur l'état</label>
            <textarea
              rows={4}
              className="block w-full rounded-2xl glass-input p-4 text-sm transition-all focus:ring-0 resize-none"
              placeholder="Ex: Propre, batterie pleine, lame ok..."
              value={returnComment}
              onChange={(e) => setReturnComment(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={() => setReturningRental(null)}
              className="text-sm font-bold text-gray-500 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <Button
              onClick={confirmReturn}
              variant="primary"
              className="px-10 py-5 rounded-[24px] shadow-[0_15px_40px_-5px_rgba(139,92,246,0.3)]"
            >
              Confirmer le Retour
            </Button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      {viewingRental && (
        <RentalDetailModal
          isOpen={true}
          onClose={() => setViewingRental(null)}
          rental={viewingRental}
          tool={tools.find(t => t.id === viewingRental.toolId)}
          user={users.find(u => u.id === viewingRental.userId)}
          transaction={transactions.find(t =>
            t.type === TransactionType.RENTAL &&
            t.userId === viewingRental.userId &&
            Math.abs(t.amount) === viewingRental.totalPrice
            // In a real app we'd link by ID, here we fuzzy match by user/amount/type
          )}
        />
      )}
    </div>
  );
};