import React, { useState, useMemo } from 'react';
import { useTransactionsQuery, useFinanceMutations } from '@/hooks/data/useFinanceQuery';
import { useRentalsQuery } from '@/hooks/data/useRentalsQuery';
import { useOutletContext } from 'react-router-dom';
import { OutletContextType } from '@/components/layouts/MainLayout/MainLayout';
import { Transaction, PaymentMethod } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { FilterSelect } from '@/components/ui/FilterSelect';
import { Plus, X } from 'lucide-react';
import { FinanceOverview } from './FinanceOverview';
import { TransactionsTable } from './TransactionsTable';
import { NewTransactionForm } from './NewTransactionForm';
import { TransactionDetailModal } from './TransactionDetailModal';

export const FinanceTab: React.FC = () => {
  const { data: transactions = [] } = useTransactionsQuery();
  const { data: rentals = [] } = useRentalsQuery();
  const { createTransaction, updateTransaction } = useFinanceMutations();
  const { showAlert } = useOutletContext<OutletContextType>();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const handleAddTransaction = async (data: Partial<Transaction>) => {
    try {
      await createTransaction.mutateAsync(data);
      setIsAddModalOpen(false);
      showAlert("Succès", "Transaction ajoutée", 'success');
    } catch (e) {
      showAlert("Erreur", "Impossible d'ajouter la transaction", 'warning');
    }
  };

  const handleStatusChange = async (transactionId: string, newStatus: 'pending' | 'paid') => {
    try {
      await updateTransaction.mutateAsync({ id: transactionId, data: { status: newStatus } });
      showAlert("Succès", "Statut mis à jour", 'success');
    } catch (e) {
      showAlert("Erreur", "Impossible de mettre à jour le statut", 'warning');
    }
  };

  const handleWorkflowChange = async (transactionId: string, newStep: 'requested' | 'in_progress' | 'tool_returned' | 'completed') => {
    try {
      await updateTransaction.mutateAsync({ id: transactionId, data: { workflowStep: newStep } });
      if (selectedTransaction && selectedTransaction.id === transactionId) {
        setSelectedTransaction(prev => prev ? {
          ...prev,
          workflowStep: newStep,
        } : null);
      }
      const stepLabels: Record<string, string> = {
        'requested': 'Demande effectuée',
        'in_progress': 'En cours',
        'tool_returned': 'Outil Retourné',
        'completed': 'Terminé'
      };
      showAlert("Succès", `Étape: ${stepLabels[newStep] || newStep}`, 'success');
    } catch (e) {
      showAlert("Erreur", "Impossible de mettre à jour l'étape", 'warning');
    }
  };

  const handleMarkAsPaid = async (transactionId: string, paymentMethod: string) => {
    try {
      await updateTransaction.mutateAsync({
        id: transactionId,
        data: {
          status: 'paid',
          method: paymentMethod as PaymentMethod
        }
      });
      if (selectedTransaction && selectedTransaction.id === transactionId) {
        setSelectedTransaction(prev => prev ? {
          ...prev,
          status: 'paid',
          method: paymentMethod as PaymentMethod
        } : null);
      }
      showAlert("Succès", "Paiement confirmé", 'success');
    } catch (e) {
      showAlert("Erreur", "Impossible de confirmer le paiement", 'warning');
    }
  };

  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  // Transform rentals to include tool info for the modal
  const rentalsWithTool = rentals.map((r: any) => ({
    id: r.id,
    toolId: r.toolId,
    startDate: r.startDate,
    endDate: r.endDate,
    tool: r.tool ? { title: r.tool.title } : (r.toolTitle ? { title: r.toolTitle } : undefined),
  }));

  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');

  // Get available years from transactions
  const availableYears = useMemo(() => {
    const years = [...new Set(transactions.map(tx => new Date(tx.date).getFullYear()))].sort((a, b) => b - a);
    return years;
  }, [transactions]);

  const yearOptions = [
    { value: 'all', label: 'Toutes les années' },
    ...availableYears.map(year => ({ value: year.toString(), label: year.toString() }))
  ];

  const semesterOptions = [
    { value: 'all', label: 'Tous les semestres' },
    { value: '1', label: 'S1 (Jan-Juin)' },
    { value: '2', label: 'S2 (Juil-Déc)' },
  ];

  // Filter transactions for table
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      const year = txDate.getFullYear();
      const month = txDate.getMonth() + 1;
      const semester = month <= 6 ? 1 : 2;
      const yearMatch = selectedYear === 'all' || year.toString() === selectedYear;
      const semesterMatch = selectedSemester === 'all' || semester.toString() === selectedSemester;
      return yearMatch && semesterMatch;
    });
  }, [transactions, selectedYear, selectedSemester]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-center sm:justify-end items-stretch sm:items-center">
        <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto justify-center">
          <Plus className="w-4 h-4 mr-2" /> Ajouter une Transaction
        </Button>
      </div>

      <FinanceOverview transactions={filteredTransactions} />

      <div className="bg-white/5 rounded-3xl p-4 md:p-6 border border-white/10 backdrop-blur-md overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h3 className="text-lg font-bold text-white">Historique des Transactions</h3>
          <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
            <FilterSelect
              options={yearOptions}
              value={selectedYear}
              onChange={setSelectedYear}
              placeholder="Année"
            />
            <FilterSelect
              options={semesterOptions}
              value={selectedSemester}
              onChange={setSelectedSemester}
              placeholder="Semestre"
            />
            {(selectedYear !== 'all' || selectedSemester !== 'all') && (
              <button
                onClick={() => { setSelectedYear('all'); setSelectedSemester('all'); }}
                className="p-2 text-gray-400 hover:text-white bg-gray-900/80 border border-gray-700/50 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <TransactionsTable
          transactions={filteredTransactions}
          onStatusChange={handleStatusChange}
          onRowClick={handleRowClick}
        />
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Nouvelle Transaction"
      >
        <NewTransactionForm
          onSubmit={handleAddTransaction}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      <TransactionDetailModal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
        rentals={rentalsWithTool}
        onWorkflowChange={handleWorkflowChange}
        onMarkAsPaid={handleMarkAsPaid}
      />
    </div>
  );
};