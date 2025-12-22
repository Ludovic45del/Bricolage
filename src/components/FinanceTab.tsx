import React, { useState } from 'react';
import { Member as User } from '../api/memberTypes';
import { Transaction, TransactionType } from '../constants';
import { formatCurrency, formatDate } from '../utils';
import { Button } from './ui/Button';
import { DollarSign, CreditCard, Mail, History, Settings, CheckSquare, Square, AlertCircle, Info } from 'lucide-react';
import { Select } from './ui/Select';
import { EmailEditorModal } from './ui/EmailEditorModal';
import { TransactionDetailModal } from './finance/TransactionDetailModal';
import { useStore } from '../context/StoreContext';
import { useHistoryFilters } from '../hooks/useHistoryFilters';
import { HistoryFilterBar } from './HistoryFilterBar';

interface FinanceTabProps {
  users: User[];
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => Promise<Transaction>;
  onUpdateTransaction: (tx: Transaction) => Promise<Transaction>;
  onUpdateUser: (user: User) => Promise<User>;
  showAlert: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'confirm') => void;
  membershipCost: number;
  onUpdateMembershipCost: (cost: number) => void;
}

export const FinanceTab: React.FC<FinanceTabProps> = ({
  users,
  transactions,
  onAddTransaction,
  onUpdateTransaction,
  onUpdateUser,
  showAlert,
  membershipCost,
  onUpdateMembershipCost
}) => {
  const [selectedPayerId, setSelectedPayerId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Check' | 'Cash'>('Card');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Modal State
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  const { tools } = useStore();

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

  const debtors = users.filter(u => u.totalDebt > 0);
  const selectedPayer = users.find(u => u.id === selectedPayerId);

  // Items due for the selected payer
  const dueItems = transactions.filter(t =>
    t.userId === selectedPayerId &&
    (t.type === TransactionType.RENTAL || t.type === TransactionType.MEMBERSHIP_FEE) &&
    t.status !== 'paid'
    // In a real app we'd filter for "unpaid" ones. Here we show all debts as candidates.
  );

  // Filter Transactions for History
  const financialOperations = transactions.filter(t => t.type === TransactionType.PAYMENT);

  const {
    filter,
    setFilter,
    sort,
    requestSort,
    filteredData: filteredTransactions,
    availableYears
  } = useHistoryFilters(financialOperations, (t) => t.date);

  const selectedTx = transactions.find(t => t.id === selectedTxId);
  const txUser = users.find(u => u.id === selectedTx?.userId);
  const txTool = tools.find(t => t.id === selectedTx?.toolId);

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'Card': return 'Carte Bancaire';
      case 'Check': return 'Chèque';
      case 'Cash': return 'Espèces';
      default: return method;
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayer || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    const selectedDescription = selectedItems.length > 0
      ? `Paiement pour : ${dueItems.filter(i => selectedItems.includes(i.id)).map(i => i.description || i.type).join(', ')}`
      : `Paiement via ${getMethodLabel(paymentMethod)}`;

    // 1. Create Transaction
    const tx: Transaction = {
      id: Date.now().toString(),
      userId: selectedPayer.id,
      amount: -amount, // Negative amount for payment credit
      type: TransactionType.PAYMENT,
      method: paymentMethod,
      date: new Date().toISOString(),
      description: selectedDescription
    };
    await onAddTransaction(tx);

    // 2. Mark selected items as paid
    if (selectedItems.length > 0) {
      const itemsToUpdate = dueItems.filter(i => selectedItems.includes(i.id));
      for (const item of itemsToUpdate) {
        await onUpdateTransaction({ ...item, status: 'paid' });
      }
    }

    // 3. Update Debt
    await onUpdateUser({
      ...selectedPayer,
      totalDebt: Math.max(0, selectedPayer.totalDebt - amount)
    });

    // Reset
    setPaymentAmount('');
    setSelectedItems([]);
    showAlert("Succès", "Paiement traité avec succès !", 'success');
  };

  const handleDebtReminder = (user: User) => {
    setEmailConfig({
      isOpen: true,
      recipient: user.email,
      subject: `Rappel de paiement - Section Bricolage`,
      body: `Bonjour ${user.name},\n\nSauf erreur de notre part, vous avez un solde débiteur de ${formatCurrency(user.totalDebt)}.\n\nMerci de régulariser votre situation lors de votre prochaine visite.\n\nCordialement,\nLe bureau.`
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Ledger */}
      <div className="space-y-10">
        <h3 className="text-xl font-bold text-white flex items-center tracking-tight">
          <div className="w-1 h-6 bg-emerald-500/50 rounded-full mr-4"></div>
          Dettes en cours
        </h3>
        <div className="glass-card shadow-2xl border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Membre</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Montant Dû</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-400">
                {debtors.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-8 py-20 text-center text-sm italic opacity-30">L'équilibre budgétaire est atteint.</td>
                  </tr>
                ) : (
                  debtors.map(u => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6 text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{u.name}</td>
                      <td className="px-8 py-6 text-right text-sm text-rose-400 font-black drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]">{formatCurrency(u.totalDebt)}</td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end items-center space-x-4">
                          <button
                            className="text-purple-400 hover:text-white text-[10px] font-black uppercase tracking-widest p-2 rounded-xl transition-all"
                            onClick={() => setSelectedPayerId(u.id)}
                          >
                            Choisir
                          </button>
                          <button
                            className="p-2 glass-card border-white/5 hover:border-white/20 text-gray-500 hover:text-rose-400 transition-all shadow-lg"
                            title="Envoyer un rappel par email"
                            onClick={() => handleDebtReminder(u)}
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mt-12 mb-6 flex items-center tracking-tight">
          <div className="w-1 h-6 bg-gray-500/50 rounded-full mr-4"></div>
          Historique des Paiements
        </h3>

        <HistoryFilterBar
          filter={filter}
          setFilter={setFilter}
          availableYears={availableYears}
        />

        <div className="glass-card shadow-2xl border-white/5 overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5">
              <thead className="bg-white/5">
                <tr>
                  <th onClick={() => requestSort('date')} className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Date {sort.key === 'date' && (sort.direction === 'asc' ? '↑' : '↓')}</th>
                  <th onClick={() => requestSort('userId')} className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Membre {sort.key === 'userId' && (sort.direction === 'asc' ? '↑' : '↓')}</th>
                  <th onClick={() => requestSort('method')} className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Mode {sort.key === 'method' && (sort.direction === 'asc' ? '↑' : '↓')}</th>
                  <th onClick={() => requestSort('amount')} className="px-6 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Montant {sort.key === 'amount' && (sort.direction === 'asc' ? '↑' : '↓')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-400 font-light">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-sm italic opacity-30">Aucun paiement récent.</td>
                  </tr>
                ) : (
                  filteredTransactions.map(tx => {
                    const user = users.find(u => u.id === tx.userId);
                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-emerald-500/5 transition-colors group cursor-pointer"
                        onClick={() => {
                          setSelectedTxId(tx.id);
                          setIsTxModalOpen(true);
                        }}
                      >
                        <td className="px-6 py-4 text-[10px] font-medium">{formatDate(tx.date)}</td>
                        <td className="px-6 py-4 text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{user?.name || 'Inconnu'}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-300 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                            {getMethodLabel(tx.method)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                          {formatCurrency(Math.abs(tx.amount))}
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

      {/* Payment Form */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center tracking-tight">
          <div className="w-1 h-6 bg-purple-500/50 rounded-full mr-4"></div>
          Encaisser un Paiement
        </h3>
        <div className="glass-card p-8 border-white/5 h-fit shadow-2xl sticky top-8">
          <form onSubmit={handlePayment} className="space-y-8">
            <Select
              label="Sélection du Payeur"
              options={debtors.map(u => ({
                id: u.id,
                name: `${u.name} (${formatCurrency(u.totalDebt)})`
              }))}
              value={selectedPayerId}
              onChange={val => {
                setSelectedPayerId(val);
                const u = users.find(user => user.id === val);
                if (u) {
                  setPaymentAmount(u.totalDebt.toString());
                  setSelectedItems([]);
                }
              }}
              placeholder="-- Sélectionner Membre --"
            />

            {selectedPayerId && dueItems.length > 0 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Items à régler</label>
                  <span className="text-[10px] font-black text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">Sélection multiple</span>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto no-scrollbar pr-2">
                  {dueItems.map(item => {
                    const isSelected = selectedItems.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          const newSelected = isSelected
                            ? selectedItems.filter(id => id !== item.id)
                            : [...selectedItems, item.id];
                          setSelectedItems(newSelected);

                          // Auto-calc amount
                          const total = dueItems
                            .filter(i => newSelected.includes(i.id))
                            .reduce((sum, i) => sum + i.amount, 0);
                          setPaymentAmount(total > 0 ? total.toString() : '');
                        }}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${isSelected
                          ? 'glass-card border-purple-500/30 bg-purple-500/10'
                          : 'border-white/5 bg-white/2 hover:border-white/10'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-700'}`}>
                            {isSelected ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-bold text-white leading-none mb-1">{item.description || item.type}</p>
                            <p className="text-[9px] text-gray-500 uppercase font-medium">{formatDate(item.date)}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-black ${isSelected ? 'text-purple-400' : 'text-gray-400'}`}>
                          {formatCurrency(item.amount)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Montant du Paiement (€)</label>
              <div className="glass-card p-5 border-white/5 bg-white/5">
                <div className="flex items-center">
                  <span className="text-gray-500 mr-3 text-xl font-light">€</span>
                  <input
                    type="number"
                    step="0.01"
                    className="block w-full bg-transparent border-none p-0 text-3xl font-black text-white focus:outline-none placeholder-gray-700"
                    placeholder="0.00"
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Méthode de Paiement</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'Card', label: 'Carte Bancaire', icon: CreditCard },
                  { id: 'Check', label: 'Chèque', icon: History },
                  { id: 'Cash', label: 'Espèces', icon: DollarSign }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 gap-2 ${paymentMethod === m.id
                      ? 'glass-card border-purple-500/50 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.2)] scale-105'
                      : 'border-white/5 hover:border-white/20'
                      }`}
                    onClick={() => setPaymentMethod(m.id as any)}
                  >
                    <m.icon className={`w-5 h-5 ${paymentMethod === m.id ? 'text-purple-400' : 'text-gray-600'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest text-center ${paymentMethod === m.id ? 'text-white' : 'text-gray-500'}`}>
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-5 shadow-[0_15px_40px_-5px_rgba(139,92,246,0.3)] transition-all hover:scale-105 active:scale-95"
              disabled={!selectedPayerId}
            >
              Finaliser le Paiement
            </Button>
          </form>
        </div>
      </div>

      <EmailEditorModal
        isOpen={emailConfig.isOpen}
        onClose={() => setEmailConfig({ ...emailConfig, isOpen: false })}
        recipientEmail={emailConfig.recipient}
        initialSubject={emailConfig.subject}
        initialBody={emailConfig.body}
        onSend={() => {
          showAlert("Succès", "Rappel envoyé avec succès !", 'success');
        }}
      />

      {selectedTx && (
        <TransactionDetailModal
          isOpen={isTxModalOpen}
          onClose={() => setIsTxModalOpen(false)}
          transaction={selectedTx}
          user={txUser}
          tool={txTool}
        />
      )}
    </div>
  );
};