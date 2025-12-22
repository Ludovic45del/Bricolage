import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Member as User } from '../api/memberTypes';
import { Tool } from '../api/types';
import { Rental as Reservation } from '../api/rentalTypes';
import { isMembershipActive, formatDate, formatCurrency, isDateFriday, isMaintenanceBlocked, isMaintenanceUrgent, isMaintenanceExpired, getMaintenanceExpiration, getStatusLabel } from '../utils';
import { UserToolCard } from './dashboard/UserToolCard';
import { UserReservationList } from './dashboard/UserReservationList';
import { Plus, Wrench } from 'lucide-react';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Select } from './ui/Select';
import { DateRangePicker } from './ui/DateRangePicker';
import { ArrowRight, Calendar, CheckCircle, Clock, Filter, Layers, LogOut, Search, ShoppingBag, User as UserIcon, XCircle, AlertTriangle, ChevronLeft, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { parseISO, differenceInDays } from 'date-fns';

interface UserDashboardProps {
  currentUser: User;
  tools: Tool[];
  categories: string[];
  myRentals: Reservation[];
  onLogout: () => void;
  onRequestReservation: (reservation: Reservation) => void;
  onUpdateUser: (user: User) => void;
  showAlert: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'confirm') => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  tools,
  categories,
  myRentals,
  onLogout,
  onRequestReservation,
  onUpdateUser,
  showAlert
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'my-rentals'>('catalog');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Filters & Search State
  const [categoryFilter, setCategoryFilter] = useState('Toutes');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Booking Form State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateError, setDateError] = useState('');

  // Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    email: '',
    phone: '',
    badgeNumber: ''
  });

  const isActiveMember = isMembershipActive(currentUser.membershipExpiry);

  // Derive categories for the UI (adding 'Toutes' at the start)
  const uiCategories = useMemo(() => {
    return ['Toutes', ...categories];
  }, [categories]);

  // Filter Logic
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      // Mock categories are names. If category object is present, use name, else categoryId (which is name in mock)
      const catName = tool.category?.name || tool.categoryId || 'Divers';
      const matchesCategory = categoryFilter === 'Toutes' || catName === categoryFilter;
      const matchesAvailability = !showAvailableOnly || tool.status === 'available';
      const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tool.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesAvailability && matchesSearch;
    });
  }, [tools, categoryFilter, showAvailableOnly, searchQuery]);

  // Calculate price estimate
  const estimatedPrice = useMemo(() => {
    if (!startDate || !endDate || !selectedTool) return 0;
    const days = differenceInDays(parseISO(endDate), parseISO(startDate));
    if (days < 0) return 0;
    // Assuming weeklyPrice is for 7 days, daily is /7 roughly or just use logic.
    // Legacy used daily_price. New type is weeklyPrice.
    // We'll calculate proportional weekly price.
    return (selectedTool.weeklyPrice / 7) * days;
  }, [startDate, endDate, selectedTool]);

  const handleToolClick = (tool: Tool) => {
    setSelectedTool(tool);
    setCurrentImageIndex(0);
    setStartDate('');
    setEndDate('');
    setDateError('');
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTool) return;

    if (isMaintenanceBlocked({ ...selectedTool, maintenanceImportance: selectedTool.maintenanceImportance })) {
      showAlert("Outil Indisponible", "Cet outil nécessite une maintenance et ne peut pas être réservé pour le moment.", 'warning');
      return;
    }

    if (!isDateFriday(startDate) || !isDateFriday(endDate)) {
      setDateError('Les réservations doivent commencer et finir un Vendredi.');
      return;
    }

    if (parseISO(startDate) >= parseISO(endDate)) {
      setDateError('La date de fin doit être après la date de début.');
      return;
    }

    const newReservation: Reservation = {
      id: Date.now().toString(),
      userId: currentUser.id,
      toolId: selectedTool.id,
      startDate: startDate,
      endDate: endDate,
      status: 'pending',
      totalPrice: estimatedPrice,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onRequestReservation(newReservation);
    setSelectedTool(null);
    showAlert("Demande envoyée !", "Un administrateur va examiner votre demande de réservation.", 'success');
  };

  const handleOpenProfile = () => {
    setProfileFormData({
      email: currentUser.email,
      phone: currentUser.phone,
      badgeNumber: currentUser.badgeNumber
    });
    setIsProfileModalOpen(true);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...currentUser,
      email: profileFormData.email,
      phone: profileFormData.phone,
      badgeNumber: profileFormData.badgeNumber
    });
    setIsProfileModalOpen(false);
    showAlert("Profil mis à jour", "Vos modifications ont été enregistrées avec succès.", 'success');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      {/* Header */}
      <header className="glass-sidebar shadow-xl border-b border-white/10 m-4 rounded-3xl">
        <div className="max-w-full mx-auto px-10 h-20 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 glass-card rounded-xl border-white/20">
              <ShoppingBag className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Espace <span className="text-purple-400">Bricolage</span></span>
          </div>

          {/* User Profile Area with Bubble */}
          <div className="flex items-center space-x-6">
            <div
              className="group flex items-center space-x-4 cursor-pointer p-1.5 rounded-2xl hover:bg-white/5 transition-all duration-300"
              onClick={handleOpenProfile}
            >
              <div className="flex flex-col items-end hidden sm:block">
                <span className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{currentUser.name}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Membre</span>
              </div>
              <div className="w-12 h-12 rounded-2xl glass-card text-white flex items-center justify-center font-bold text-sm border-white/20 shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-purple-400">{getInitials(currentUser.name)}</span>
              </div>
            </div>

            <div className="h-8 w-px bg-white/10 mx-2"></div>

            <Button variant="ghost" size="sm" onClick={onLogout} className="border-white/5 hover:border-white/20">
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Quitter</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-full w-full mx-auto px-10 py-8">

        {/* Status Card */}
        <div className="glass-card p-8 mb-10 flex flex-col md:flex-row justify-between items-center border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-purple-500/50 to-indigo-500/50"></div>
          <div className="relative z-10">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] mb-3">Statut Adhésion</h2>
            <div className="flex items-center space-x-3">
              {isActiveMember ? (
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <CheckCircle className="w-4 h-4 mr-2" /> Actif jusqu'au {formatDate(currentUser.membershipExpiry)}
                </span>
              ) : (
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                  <XCircle className="w-4 h-4 mr-2" /> Expiré le {formatDate(currentUser.membershipExpiry)}
                </span>
              )}
            </div>
          </div>
          <div className="mt-8 md:mt-0 text-center md:text-right relative z-10">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] mb-1">Contribution</div>
            <div className={`text-4xl font-black tracking-tighter ${currentUser.totalDebt > 0 ? 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]'}`}>
              {formatCurrency(currentUser.totalDebt)}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-6 py-3 rounded-2xl font-bold text-sm tracking-wide transition-colors duration-300 flex items-center relative ${activeTab === 'catalog'
              ? 'text-white'
              : 'text-gray-500 hover:text-white'
              }`}
          >
            {activeTab === 'catalog' && (
              <motion.div
                layoutId="userTabs"
                className="absolute inset-0 bg-white/10 glass-card rounded-2xl border-white/20"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <ShoppingBag className="w-4 h-4 mr-3 relative z-10" />
            <span className="relative z-10">Catalogue Outils</span>
          </button>
          <button
            onClick={() => setActiveTab('my-rentals')}
            className={`px-6 py-3 rounded-2xl font-bold text-sm tracking-wide transition-colors duration-300 flex items-center relative ${activeTab === 'my-rentals'
              ? 'text-white'
              : 'text-gray-500 hover:text-white'
              }`}
          >
            {activeTab === 'my-rentals' && (
              <motion.div
                layoutId="userTabs"
                className="absolute inset-0 bg-white/10 glass-card rounded-2xl border-white/20"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Clock className="w-4 h-4 mr-3 relative z-10" />
            <span className="relative z-10">Historique & Demandes</span>
          </button>
        </div>

        {/* Catalog Content */}
        {activeTab === 'catalog' && (
          <>
            {/* Filters Bar */}
            <div className="glass-card p-4 mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between border-white/5 relative z-30">

              {/* Search Input */}
              <div className="relative w-full lg:w-[350px]">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-4 h-[42px] glass-input rounded-xl text-sm transition-all focus:ring-0"
                  placeholder="Chercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
                <Select
                  options={uiCategories.map(cat => ({ id: cat, name: cat }))}
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  className="w-full sm:w-48"
                />

                <label className="flex items-center cursor-pointer whitespace-nowrap group bg-white/5 px-4 h-[42px] rounded-xl border border-white/5 transition-all hover:bg-white/10">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={showAvailableOnly}
                      onChange={(e) => setShowAvailableOnly(e.target.checked)}
                    />
                    <div className={`block w-9 h-5 rounded-full transition-all duration-500 ${showAvailableOnly ? 'bg-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'bg-white/10'}`}></div>
                    <div className={`dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-all duration-500 ${showAvailableOnly ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <span className="ml-3 text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-white transition-colors">Disponibles</span>
                </label>

                <div className="h-8 w-px bg-white/10 hidden sm:block mx-1"></div>

                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 h-[42px] items-center">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-purple-500/20 text-purple-400 shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                    title="Vue Grandes Icones"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'list' ? 'bg-purple-500/20 text-purple-400 shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                    title="Vue Lignes"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "flex flex-col gap-6"}>
              {filteredTools.length === 0 ? (
                <div className="col-span-full glass-card p-20 text-center text-gray-500 font-light border-white/5">
                  <Layers className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Aucun outil trouvé dans cette catégorie.</p>
                </div>
              ) : (
                filteredTools.map((tool) => (
                  <UserToolCard
                    key={tool.id}
                    tool={tool}
                    viewMode={viewMode}
                    onClick={handleToolClick}
                  />
                ))
              )}
            </div>
          </>
        )}

        {/* My Rentals Content */}
        {activeTab === 'my-rentals' && (
          <UserReservationList rentals={myRentals} tools={tools} />
        )}
      </main>

      {/* Tool Details Modal */}
      <Modal
        isOpen={!!selectedTool}
        onClose={() => setSelectedTool(null)}
        title="Détails de l'Outil"
        size="6xl"
      >
        {selectedTool && (
          <div className="max-w-[1400px] mx-auto pb-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left Column: Visuals & History */}
              <div className="space-y-6">
                <div
                  className="relative group/img h-[450px] w-full rounded-[40px] overflow-hidden shadow-2xl border border-white/10 cursor-zoom-in bg-gradient-to-br from-gray-800/50 to-gray-900/50"
                  onClick={() => selectedTool.images && selectedTool.images.length > 0 && setZoomImage(selectedTool.images[currentImageIndex]?.filePath)}
                >
                  {selectedTool.images && selectedTool.images.length > 0 ? (
                    <img
                      src={selectedTool.images[currentImageIndex]?.filePath}
                      alt={selectedTool.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Wrench className="w-24 h-24 text-gray-700/30" />
                    </div>
                  )}
                  {selectedTool.images && selectedTool.images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (selectedTool.images && prev === 0 ? selectedTool.images.length - 1 : prev - 1)); }}
                        className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-black/40 backdrop-blur-xl rounded-full text-white opacity-0 group-hover/img:opacity-100 transition-all hover:bg-black/60"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (selectedTool.images && prev === selectedTool.images.length - 1 ? 0 : prev + 1)); }}
                        className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-black/40 backdrop-blur-xl rounded-full text-white opacity-0 group-hover/img:opacity-100 transition-all hover:bg-black/60"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Right Column: Information Dashboard */}
              <div className="space-y-6 lg:sticky lg:top-0">
                <div className="glass-card p-10 bg-white/5 border border-white/10 rounded-[48px] shadow-inner space-y-8">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <h3 className="text-5xl font-black text-white tracking-tighter leading-tight">{selectedTool.title}</h3>
                      <div className={`px-4 py-1.5 rounded-full inline-flex self-start ${selectedTool.status === 'available' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {getStatusLabel(selectedTool.status)}
                      </div>
                    </div>
                    <p className="text-gray-400 text-lg font-light leading-relaxed">{selectedTool.description}</p>
                  </div>

                  <div className="flex items-center justify-between p-8 bg-white/5 border border-white/10 rounded-[32px] shadow-xl">
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tarif Locatif</div>
                      <div className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Par Semaine</div>
                    </div>
                    <div className="text-5xl font-black text-white tracking-tighter">
                      {formatCurrency(selectedTool.weeklyPrice)}
                    </div>
                  </div>

                  {/* Booking Section */}
                  {selectedTool.status === 'available' ? (
                    <div className="space-y-6 pt-4">
                      <DateRangePicker
                        label=""
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(start, end) => {
                          setStartDate(start);
                          setEndDate(end);
                        }}
                        error={dateError}
                      />

                      {startDate && endDate && (
                        <div className="text-white font-bold text-center text-xl">
                          Total Estimé: {formatCurrency(estimatedPrice)}
                        </div>
                      )}

                      <Button
                        type="button"
                        onClick={handleSubmitRequest}
                        disabled={!isActiveMember || isMaintenanceBlocked({ ...selectedTool, maintenanceImportance: selectedTool.maintenanceImportance })}
                        className="w-full py-6 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-lg"
                      >
                        Réserver
                      </Button>
                    </div>
                  ) : (
                    <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center text-rose-300 font-bold">
                      Indisponible
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Profile Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Configuration du Profil"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400">Email</label>
            <input
              type="email"
              className="glass-input w-full p-3 rounded-xl"
              value={profileFormData.email}
              onChange={e => setProfileFormData({ ...profileFormData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400">Téléphone</label>
            <input
              type="tel"
              className="glass-input w-full p-3 rounded-xl"
              value={profileFormData.phone}
              onChange={e => setProfileFormData({ ...profileFormData, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-400">Numéro Adhérent</label>
            <input
              type="text"
              className="glass-input w-full p-3 rounded-xl text-white/50"
              value={profileFormData.badgeNumber}
              readOnly
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" onClick={() => setIsProfileModalOpen(false)} variant="ghost">Annuler</Button>
            <Button type="submit">Sauvegarder</Button>
          </div>
        </form>
      </Modal>

      {/* Lightbox */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in cursor-zoom-out p-4 md:p-10"
          onClick={() => setZoomImage(null)}
        >
          <img src={zoomImage} className="max-h-full max-w-full rounded-xl" />
        </div>
      )}
    </div>
  );
};