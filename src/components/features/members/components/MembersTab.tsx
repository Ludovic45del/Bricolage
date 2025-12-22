import React from 'react';
import { Transaction } from '@/types';
import { RenewalModal } from '@/components/ui/RenewalModal';
import { MemberSearchHeader } from './MemberSearchHeader';
import { MemberTable } from './MemberTable';
import { MemberDetailModal } from './MemberDetailModal';
import { MemberFormModal } from './MemberFormModal';
import { useUsersQuery, useUserMutations } from '@/hooks/data/useUsersQuery';
import { useMembership } from '@/components/features/members/hooks/useMembership'; // Keeping for UI state logic (pagination, filters) if needed, or stripping it down

export interface MembersTabProps {
  // Props are now minimal as data fetching is internal, or we can keep onAddTransaction if not yet migrated
  onAddTransaction: (tx: Transaction) => Promise<Transaction>;
  showAlert: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'confirm', onConfirm?: () => void) => void;
}

export const MembersTab: React.FC<MembersTabProps> = ({ onAddTransaction, showAlert }) => {
  // Data Fetching
  const { data: users = [], isLoading } = useUsersQuery();
  const { createUser, updateUser, deleteUser, renewMembership } = useUserMutations();

  // Local UI State (Modals, Selection) - We can reuse parts of useMembership or simplify here
  // For Phase 2, let's keep it simple and lift state here or adapt useMembership later.
  // Actually, useMembership expects 'users' prop. Let's feed it the query result.

  // We need to adapt the signatures because useMembership calling 'onUpdateUser' expects a Promise returning Member.
  // Our mutations return results too.

  const handleUpdateUser = async (user: any) => {
    // Filter fields to match backend UpdateUserDto
    const { name, email, phone, employer, status } = user;
    const data = { name, email, phone, employer, status };
    return await updateUser.mutateAsync({ id: user.id, data });
  };

  const handleAddUser = async (user: any) => {
    // Filter fields to match backend RegisterDto
    const { name, email, badgeNumber, phone, employer } = user;
    const data = { name, email, badgeNumber, phone, employer };
    return await createUser.mutateAsync(data);
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteUser.mutateAsync(userId);
  };

  const handleRenewMembership = async (id: string, data: { amount: number; paymentMethod: 'card' | 'check' | 'cash'; durationMonths?: number }) => {
    return await renewMembership.mutateAsync({ id, data });
  };

  const { state, actions } = useMembership({
    users: users,
    onUpdateUser: handleUpdateUser,
    onAddUser: handleAddUser,
    onDeleteUser: handleDeleteUser,
    onAddTransaction: onAddTransaction,
    onRenewMembership: handleRenewMembership,
    showAlert: showAlert
  });

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Chargement des membres...</div>;
  }

  return (
    <div className="space-y-8">
      <MemberSearchHeader
        searchQuery={state.searchQuery}
        setSearchQuery={actions.setSearchQuery}
        onAddMember={actions.handleOpenAdd}
        statusFilter={state.statusFilter}
        setStatusFilter={actions.setStatusFilter}
        membershipFilter={state.membershipFilter}
        setMembershipFilter={actions.setMembershipFilter}
      />

      <MemberTable
        users={state.filteredUsers}
        searchQuery={state.searchQuery}
        onEditMember={actions.handleOpenEdit}
        onRenewMember={actions.handleOpenRenew}
        onDeleteMember={actions.handleDeleteUser}
        onViewMember={actions.setViewingUser}
      />

      <MemberFormModal
        isOpen={!!state.editingUser}
        onClose={() => actions.setEditingUser(null)}
        user={state.editingUser}
        onSave={actions.handleSaveUser}
      />

      <MemberDetailModal
        isOpen={!!state.viewingUser}
        onClose={() => actions.setViewingUser(null)}
        user={state.viewingUser}
        onEdit={actions.handleOpenEdit}
        onRenew={actions.handleOpenRenew}
        onDelete={actions.handleDeleteUser}
      />

      <RenewalModal
        isOpen={state.renewalConfig.isOpen}
        onClose={() => actions.setRenewalConfig({ isOpen: false, user: null })}
        memberName={state.renewalConfig.user?.name || ''}
        defaultPrice={state.renewalConfig.user?.totalDebt || 0}
        onConfirm={actions.confirmRenewal}
      />
    </div>
  );
};