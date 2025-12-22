import React, { useState } from 'react';
import { useTransactionsQuery, useFinanceMutations } from '@/hooks/data/useFinanceQuery';
import { useOutletContext } from 'react-router-dom';
import { OutletContextType } from '@/components/layouts/MainLayout/MainLayout';
import { Transaction, PaymentMethod } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Plus } from 'lucide-react';
import { FinanceOverview } from './FinanceOverview';
import { TransactionsTable } from './TransactionsTable';
import { NewTransactionForm } from './NewTransactionForm';
import { TransactionDetailModal } from './TransactionDetailModal';

export const FinanceTab: React.FC = () => {
  const { data: transactions = [] } = useTransactionsQuery();
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
      // Update local state to reflect change immediately (modal stays open)
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
      // Update local state
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Finance</h2>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Ajouter une Transaction
        </Button>
      </div>

      <FinanceOverview transactions={transactions} />

      <div className="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-md">
        <h3 className="text-lg font-bold text-white mb-6">Historique des Transactions</h3>
        <TransactionsTable
          transactions={transactions}
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
        onWorkflowChange={handleWorkflowChange}
        onMarkAsPaid={handleMarkAsPaid}
      />
    </div>
  );
};