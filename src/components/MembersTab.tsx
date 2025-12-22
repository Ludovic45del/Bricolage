import React from 'react';
import { Member as User } from '../api/memberTypes';
import { Transaction } from '../constants';
import { RenewalModal } from './ui/RenewalModal';
import { MemberSearchHeader } from './members/MemberSearchHeader';
import { MemberTable } from './members/MemberTable';
import { MemberDetailModal } from './members/MemberDetailModal';
import { MemberFormModal } from './members/MemberFormModal';
import { useMembership } from './members/useMembership';

export interface MembersTabProps {
  users: User[];
  onUpdateUser: (user: User) => Promise<User>;
  onAddUser: (user: User) => Promise<User>;
  onDeleteUser: (userId: string) => Promise<void>;
  onAddTransaction: (tx: Transaction) => Promise<Transaction>;
  showAlert: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'confirm', onConfirm?: () => void) => void;
}

export const MembersTab: React.FC<MembersTabProps> = (props) => {
  const { state, actions } = useMembership({
    users: props.users,
    onUpdateUser: props.onUpdateUser,
    onAddUser: props.onAddUser,
    onDeleteUser: props.onDeleteUser,
    onAddTransaction: props.onAddTransaction,
    showAlert: props.showAlert
  });

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