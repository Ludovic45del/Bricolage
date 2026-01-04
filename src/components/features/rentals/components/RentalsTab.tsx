import React, { useState } from 'react';
import { useRentalsQuery, useRentalMutations } from '@/hooks/data/useRentalsQuery';
import { useToolsQuery } from '@/hooks/data/useToolsQuery';
import { useUsersQuery } from '@/hooks/data/useUsersQuery';
import { useOutletContext } from 'react-router-dom';
import { OutletContextType } from '@/components/layouts/MainLayout/MainLayout';
import { Rental } from '@/types';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { RentalBookingForm } from './RentalBookingForm';
import { ActiveRentalsList } from './ActiveRentalsList';
import { RentalHistoryTable } from './RentalHistoryTable';

export const RentalsTab: React.FC = () => {
  const { data: rentals = [] } = useRentalsQuery();
  const { data: tools = [] } = useToolsQuery();
  const { data: users = [] } = useUsersQuery();
  const { createRental, updateRental, deleteRental, returnRental } = useRentalMutations();

  const { showAlert } = useOutletContext<OutletContextType>();

  const [isNewRentalModalOpen, setIsNewRentalModalOpen] = useState(false);

  const handleCreateRental = async (rentalData: Rental) => {
    const { userId, toolId, startDate, endDate, totalPrice } = rentalData;
    const payload = { userId, toolId, startDate, endDate, totalPrice };

    try {
      await createRental.mutateAsync(payload);
      setIsNewRentalModalOpen(false);
      return rentalData;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Une erreur est survenue lors de la création';
      showAlert('Erreur', errorMessage, 'warning');
      throw error;
    }
  };

  const handleUpdateTool = async (tool: any) => tool;

  const handleUpdateUser = async (user: any) => user;

  const handleAddTransaction = async (tx: any) => tx;

  const handleReturnRental = async (rental: Rental) => {
    await returnRental.mutateAsync({
      id: rental.id,
      returnData: { endDate: new Date().toISOString() }
    });
    showAlert("Succès", "Retour enregistré", 'success');
  };

  const handleCancelRental = async (rental: Rental) => {
    try {
      await deleteRental.mutateAsync(rental.id);
      showAlert("Succès", "Location annulée et supprimée", 'success');
    } catch {
      showAlert("Erreur", "Impossible d'annuler la location", 'warning');
    }
  };

  const handleApproveRental = async (rental: Rental) => {
    try {
      await updateRental.mutateAsync({ id: rental.id, data: { status: 'active' } });
      showAlert("Succès", "Demande approuvée", 'success');
    } catch {
      showAlert("Erreur", "Impossible d'approuver la demande", 'warning');
    }
  };

  const handleRejectRental = async (rental: Rental) => {
    try {
      await updateRental.mutateAsync({ id: rental.id, data: { status: 'rejected' } });
      showAlert("Succès", "Demande refusée", 'success');
    } catch {
      showAlert("Erreur", "Impossible de refuser la demande", 'warning');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-center sm:justify-end items-stretch sm:items-center">
        <Button onClick={() => setIsNewRentalModalOpen(true)} className="w-full sm:w-auto justify-center">
          <Plus className="w-4 h-4 mr-2" /> Nouvelle Location
        </Button>
      </div>

      <div className="space-y-8">
        <section>
          <ActiveRentalsList
            rentals={rentals.filter(r => r.status === 'active' || r.status === 'late' || r.status === 'pending')}
            users={users}
            tools={tools}
            onReturn={handleReturnRental}
            onCancel={handleCancelRental}
            onApprove={handleApproveRental}
            onReject={handleRejectRental}
            onSendOverdueEmail={() => { }}
          />
        </section>

        <section>
          <RentalHistoryTable
            rentals={rentals.filter(r => r.status === 'completed')}
            users={users}
            tools={tools}
          />
        </section>

      </div>

      <Modal
        isOpen={isNewRentalModalOpen}
        onClose={() => setIsNewRentalModalOpen(false)}
        title="Nouvelle Location"
        size="4xl"
      >
        <RentalBookingForm
          users={users}
          tools={tools}
          rentals={rentals}
          onAddRental={handleCreateRental}
          onUpdateTool={handleUpdateTool}
          onUpdateUser={handleUpdateUser}
          onAddTransaction={handleAddTransaction}
          showAlert={showAlert}
        />
      </Modal>
    </div>
  );
};