import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useOutletContext } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import { MainLayout, OutletContextType } from './components/MainLayout';
import { LoginScreen } from './components/LoginScreen';
import { UserDashboard } from './components/UserDashboard';
import { MembersTab } from './components/MembersTab';
import { InventoryTab } from './components/InventoryTab';
import { RentalsTab } from './components/RentalsTab';
import { FinanceTab } from './components/FinanceTab';
import { ReportsTab } from './components/ReportsTab';
import { AlertModal } from './components/ui/AlertModal';
import { ToolDetailModal } from './components/inventory/ToolDetailModal';

// --- Route Wrappers to connect Store Context to Component Props ---

const LoginWrapper = () => {
  const { users, login, addUser } = useStore();
  const navigate = useNavigate();
  const [alertConfig, setAlertConfig] = useState<any>({ isOpen: false });

  const showAlert = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'confirm' = 'info', onConfirm?: () => void) => {
    setAlertConfig({ isOpen: true, title, message, type, onConfirm });
  };

  const handleLogin = async (role: 'admin' | 'user', userId?: string) => {
    if (userId) {
      // In legacy LoginScreen, it passes role and ID. 
      // We need to fetch the user to get email/badge if we want to use store.login(email, badge)
      // OR we can just use store.setCurrentUser if we expose it, but better to use the public API.
      // However, LoginScreen logic is UI driven. 
      // Let's assume for now we bypass strict credential check here since LoginScreen already validated password match.
      // We can just find the user and set it.
      // But store.login takes email/badge.
      const user = users.find(u => u.id === userId);
      if (user) {
        try {
          await login(user.email, user.badgeNumber);
          if (role === 'admin') navigate('/members');
          else navigate('/dashboard');
        } catch (e) {
          console.error(e);
          showAlert('Erreur', 'Connexion échouée', 'warning');
        }
      }
    }
  };

  return (
    <>
      <LoginScreen
        users={users}
        onLogin={handleLogin}
        onRegister={(u) => addUser(u)}
        showAlert={showAlert}
      />
      <AlertModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        onConfirm={alertConfig.onConfirm}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </>
  );
};

const UserDashboardWrapper = () => {
  const { currentUser, logout, tools, categories, rentals, addRental, updateUser } = useStore();
  const navigate = useNavigate();
  const [alertConfig, setAlertConfig] = useState<any>({ isOpen: false });

  const showAlert = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'confirm' = 'info', onConfirm?: () => void) => {
    setAlertConfig({ isOpen: true, title, message, type, onConfirm });
  };

  if (!currentUser) return <Navigate to="/login" />;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <UserDashboard
        currentUser={currentUser}
        tools={tools}
        categories={categories}
        myRentals={rentals.filter(r => r.user_id === currentUser.id)}
        onLogout={handleLogout}
        onRequestReservation={addRental}
        onUpdateUser={updateUser}
        showAlert={showAlert}
      />
      <AlertModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        onConfirm={alertConfig.onConfirm}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </>
  );
};

const MembersWrapper = () => {
  const { users, updateUser, addUser, deleteUser, addTransaction } = useStore();
  const { showAlert } = useOutletContext<OutletContextType>();
  return (
    <MembersTab
      users={users}
      onUpdateUser={updateUser}
      onAddUser={addUser}
      onDeleteUser={deleteUser}
      onAddTransaction={addTransaction}
      showAlert={showAlert}
    />
  );
};

const InventoryWrapper = () => {
  const { tools, categories, updateTool, addTool, updateCategories } = useStore();
  const { showAlert } = useOutletContext<OutletContextType>();
  return (
    <InventoryTab
      tools={tools}
      categories={categories}
      onUpdateTool={updateTool}
      onAddTool={addTool}
      onUpdateCategories={updateCategories}
      showAlert={showAlert}
    />
  );
};

const RentalsWrapper = () => {
  const { users, tools, rentals, transactions, addRental, updateRental, updateTool, updateUser, addTransaction } = useStore();
  const { showAlert } = useOutletContext<OutletContextType>();
  return (
    <RentalsTab
      users={users}
      tools={tools}
      rentals={rentals}
      transactions={transactions}
      onAddRental={addRental}
      onUpdateRental={updateRental}
      onUpdateTool={updateTool}
      onUpdateUser={updateUser}
      onAddTransaction={addTransaction}
      showAlert={showAlert}
    />
  );
};

const FinanceWrapper = () => {
  const { users, transactions, addTransaction, updateTransaction, updateUser, membershipCost, updateMembershipCost } = useStore();
  const { showAlert } = useOutletContext<OutletContextType>();

  return (
    <FinanceTab
      users={users}
      transactions={transactions}
      onAddTransaction={addTransaction}
      onUpdateTransaction={updateTransaction}
      onUpdateUser={updateUser}
      showAlert={showAlert}
      membershipCost={membershipCost}
      onUpdateMembershipCost={updateMembershipCost}
    />
  );
};

const ReportsWrapper = ({ onToolClick }: { onToolClick: (id: string) => void }) => {
  const { users, tools, rentals, transactions } = useStore();
  return (
    <ReportsTab
      users={users}
      tools={tools}
      rentals={rentals}
      transactions={transactions}
      onToolClick={onToolClick}
    />
  );
};

const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { isAuthenticated, isAdmin } = useStore();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" />;
  return children;
};

// --- Main App Component ---

const AppContent = () => {
  const { tools, updateTool, categories } = useStore();
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToolClick = (toolId: string) => {
    setSelectedToolId(toolId);
    setIsModalOpen(true);
  };

  const selectedTool = tools.find(t => t.id === selectedToolId);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginWrapper />} />

          {/* Member Route */}
          <Route path="/dashboard" element={<UserDashboardWrapper />} />

          {/* User Home Redirect */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Admin Routes with Layout */}
          <Route path="/" element={<MainLayout />}>
            <Route path="members" element={
              <ProtectedRoute requireAdmin={true}><MembersWrapper /></ProtectedRoute>
            } />
            <Route path="inventory" element={
              <ProtectedRoute requireAdmin={true}><InventoryWrapper /></ProtectedRoute>
            } />
            <Route path="rentals" element={
              <ProtectedRoute requireAdmin={true}><RentalsWrapper /></ProtectedRoute>
            } />
            <Route path="finance" element={
              <ProtectedRoute requireAdmin={true}><FinanceWrapper /></ProtectedRoute>
            } />
            <Route path="reports" element={
              <ProtectedRoute requireAdmin={true}><ReportsWrapper onToolClick={handleToolClick} /></ProtectedRoute>
            } />
          </Route>

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>

      {/* Global Tool Detail Modal */}
      {selectedTool && (
        <ToolDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          tool={selectedTool}
          onUpdateTool={updateTool}
          categories={categories}
        />
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
};

export default App;