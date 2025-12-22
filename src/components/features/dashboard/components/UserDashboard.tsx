import React, { useState, useMemo } from 'react';
import { generateId } from '@/utils/ids';
import { motion } from 'framer-motion';
import { Member, Rental } from '@/types';
import { Tool } from '@/types';
import { isDateFriday, isMaintenanceBlocked, isMembershipActive } from '@/utils';
import { UserToolCard } from './UserToolCard';
import { UserReservationList } from './UserReservationList';
import { ShoppingBag, Clock, Layers } from 'lucide-react';
import { parseISO, differenceInDays } from 'date-fns';
import { UserDashboardHeader } from './UserDashboardHeader';
import { UserMembershipStatus } from './UserMembershipStatus';
import { UserCatalogFilters } from './UserCatalogFilters';
import { ToolDetailModal } from './ToolDetailModal';
import { UserProfileModal } from './UserProfileModal';

interface UserDashboardProps {
  currentUser: Member;
  tools: Tool[];
  categories: string[];
  myRentals: Rental[];
  onLogout: () => void;
  onRequestRental: (reservation: Rental) => void;
  onUpdateUser: (user: Member) => void;
  showAlert: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'confirm') => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  tools,
  categories,
  myRentals,
  onLogout,
  onRequestRental,
  onUpdateUser,
  showAlert
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'my-rentals'>('catalog');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('Toutes');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateError, setDateError] = useState('');

  const isActiveMember = isMembershipActive(currentUser.membershipExpiry);
  const uiCategories = useMemo(() => ['Toutes', ...categories], [categories]);

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const catName = tool.category?.name || tool.categoryId || 'Divers';
      const matchesCategory = categoryFilter === 'Toutes' || catName === categoryFilter;
      const matchesAvailability = !showAvailableOnly || tool.status === 'available';
      const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tool.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesAvailability && matchesSearch;
    });
  }, [tools, categoryFilter, showAvailableOnly, searchQuery]);

  const handleToolClick = (tool: Tool) => {
    setSelectedTool(tool);
    setStartDate('');
    setEndDate('');
    setDateError('');
  };

  const handleSubmitRequest = (estimatedPrice: number) => {
    if (!selectedTool) return;
    if (isMaintenanceBlocked(selectedTool)) return showAlert("Outil Indisponible", "Cet outil nécessite une maintenance.", 'warning');
    if (!isDateFriday(startDate) || !isDateFriday(endDate)) return setDateError('Les réservations doivent commencer et finir un Vendredi.');
    if (parseISO(startDate) >= parseISO(endDate)) return setDateError('La date de fin doit être après la date de début.');

    onRequestRental({
      id: generateId(),
      userId: currentUser.id,
      toolId: selectedTool.id,
      startDate,
      endDate,
      status: 'pending',
      totalPrice: estimatedPrice,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setSelectedTool(null);
    showAlert("Demande envoyée !", "Un administrateur va examiner votre demande.", 'success');
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <UserDashboardHeader currentUser={currentUser} onLogout={onLogout} onProfileClick={() => setIsProfileModalOpen(true)} />

      <main className="flex-1 max-w-full w-full mx-auto px-10 py-8">
        <UserMembershipStatus currentUser={currentUser} />

        <div className="flex space-x-4 mb-8">
          <button onClick={() => setActiveTab('catalog')} className={`px-6 py-3 rounded-2xl font-bold text-sm tracking-wide transition-colors relative ${activeTab === 'catalog' ? 'text-white' : 'text-gray-500 hover:text-white'}`}>
            {activeTab === 'catalog' && (
              <motion.div layoutId="userTabs" className="absolute inset-0 bg-white/10 glass-card rounded-2xl border-white/20" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
            )}
            <ShoppingBag className="w-4 h-4 mr-3 relative z-10" /> <span className="relative z-10">Catalogue Outils</span>
          </button>
          <button onClick={() => setActiveTab('my-rentals')} className={`px-6 py-3 rounded-2xl font-bold text-sm tracking-wide transition-colors relative ${activeTab === 'my-rentals' ? 'text-white' : 'text-gray-500 hover:text-white'}`}>
            {activeTab === 'my-rentals' && (
              <motion.div layoutId="userTabs" className="absolute inset-0 bg-white/10 glass-card rounded-2xl border-white/20" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
            )}
            <Clock className="w-4 h-4 mr-3 relative z-10" /> <span className="relative z-10">Historique & Demandes</span>
          </button>
        </div>

        {activeTab === 'catalog' ? (
          <>
            <UserCatalogFilters
              searchQuery={searchQuery} onSearchChange={setSearchQuery}
              categoryFilter={categoryFilter} onCategoryChange={setCategoryFilter} categories={uiCategories}
              showAvailableOnly={showAvailableOnly} onToggleAvailable={setShowAvailableOnly}
              viewMode={viewMode} onViewModeChange={setViewMode}
            />
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "flex flex-col gap-6"}>
              {filteredTools.length === 0 ? (
                <div className="col-span-full glass-card p-20 text-center text-gray-500 border-white/5">
                  <Layers className="w-12 h-12 mx-auto mb-4 opacity-20" /> <p>Aucun outil trouvé.</p>
                </div>
              ) : (
                filteredTools.map((tool) => <UserToolCard key={tool.id} tool={tool} viewMode={viewMode} onClick={handleToolClick} />)
              )}
            </div>
          </>
        ) : (
          <UserReservationList rentals={myRentals} tools={tools} />
        )}
      </main>

      <ToolDetailModal
        tool={selectedTool}
        onClose={() => setSelectedTool(null)}
        currentUser={currentUser}
        isActiveMember={isActiveMember}
        startDate={startDate}
        endDate={endDate}
        onDateChange={(s, e) => { setStartDate(s); setEndDate(e); }}
        dateError={dateError}
        onReserve={handleSubmitRequest}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onUpdateProfile={(data) => { onUpdateUser({ ...currentUser, ...data }); setIsProfileModalOpen(false); showAlert("Profil mis à jour", "Modifications enregistrées.", 'success'); }}
      />
    </div>
  );
};