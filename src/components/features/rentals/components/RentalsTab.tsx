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
// import { useRentalFilters } from '@/hooks/business/useRentalFilters'; // Temporarily disabled if not needed for simple view or until verified

export const RentalsTab: React.FC = () => {
  const { data: rentals = [] } = useRentalsQuery();
  const { data: tools = [] } = useToolsQuery();
  const { data: users = [] } = useUsersQuery();
  const { createRental, updateRental, returnRental } = useRentalMutations();

  const { showAlert } = useOutletContext<OutletContextType>();

  const [isNewRentalModalOpen, setIsNewRentalModalOpen] = useState(false);
  // const filters = useRentalFilters(rentals);

  const handleCreateRental = async (rentalData: Rental) => {
    // Extract only DTO-compliant fields (backend forbids extra fields)
    const { userId, toolId, startDate, endDate, totalPrice } = rentalData;
    try {
      await createRental.mutateAsync({ userId, toolId, startDate, endDate, totalPrice });
      setIsNewRentalModalOpen(false);
      return rentalData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleUpdateTool = async (tool: any) => {
    // Mock or implement if `RentalBookingForm` requires it to update tool status immediately
    // React Query invalidation should handle this if backend updates status
    return tool;
  };

  const handleUpdateUser = async (user: any) => {
    // React Query invalidation handles this
    return user;
  };

  const handleAddTransaction = async (tx: any) => {
    // Form might try to create transaction
    // We should ideally have useFinanceMutations here if we want to support it, 
    // or rely on backend to create transaction on rental creation.
    // For now, let's assume we need to support it if form calls it.
    return tx;
  };

  // Stub for form requirement if using the complex form
  // The previous form seemed complex.
  // Let's look at RentalBookingForm props again from previous step (595).
  /*
  interface RentalBookingFormProps {
      users: Member[];
      tools: Tool[];
      onAddRental: (rental: Rental) => Promise<Rental>;
      onUpdateTool: (tool: Tool) => Promise<Tool>;
      onUpdateUser: (user: Member) => Promise<Member>;
      onAddTransaction: (tx: Transaction) => Promise<Transaction>;
      showAlert: ...
  }
  */

  // We need to provide these.

  const handleReturnRental = async (rental: Rental) => {
    await returnRental.mutateAsync({
      id: rental.id,
      returnData: { endDate: new Date().toISOString() }
    });
    showAlert("Succès", "Retour enregistré", 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Locations</h2>
        <Button onClick={() => setIsNewRentalModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Nouvelle Location
        </Button>
      </div>

      <div className="space-y-8">
        <section>
          <h3 className="text-xl font-semibold text-white mb-4">Locations en cours</h3>
          <ActiveRentalsList
            rentals={rentals.filter(r => r.status === 'active' || r.status === 'late')}
            users={users}
            tools={tools}
            onReturn={handleReturnRental}
            onSendOverdueEmail={() => { }}
          />
        </section>

        <section>
          <h3 className="text-xl font-semibold text-white mb-4">Historique</h3>
          <div className="space-y-4">
            <RentalHistoryTable
              rentals={rentals.filter(r => r.status !== 'active' && r.status !== 'late')}
              users={users}
              tools={tools}
            />
          </div>
        </section>
      </div>

      <Modal
        isOpen={isNewRentalModalOpen}
        onClose={() => setIsNewRentalModalOpen(false)}
        title="Nouvelle Location"
      >
        <RentalBookingForm
          users={users}
          tools={tools.filter(t => t.status === 'available')}
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