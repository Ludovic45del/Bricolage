import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useOutletContext } from 'react-router-dom';
import { OutletContextType } from './MainLayout';
import { Tool } from '../api/types';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { InventoryFilters } from './inventory/InventoryFilters';
import { ToolGrid } from './inventory/ToolGrid';
import { ToolDetailModal } from './inventory/ToolDetailModal';
import { EditForm } from './ui/EditForm';
import { isMaintenanceExpired, isMaintenanceUrgent, openDocument } from '../utils';
import { Plus, List, X } from 'lucide-react';

export const InventoryTab: React.FC = () => {
  const { tools, categories, addTool, updateTool, updateCategories } = useStore();
  const { showAlert } = useOutletContext<OutletContextType>();

  // UI State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Toutes');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [maintenanceFilter, setMaintenanceFilter] = useState('Tous');

  // Derived state for filtering
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = !searchQuery ||
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Note: categories are strings in mock, but we might check if categoryId maps to name
      const matchesCategory = categoryFilter === 'Toutes' || tool.categoryId === categoryFilter;
      const matchesStatus = statusFilter === 'Tous' || tool.status === statusFilter.toLowerCase(); // statusFilter is likely Capitalized from UI?

      let matchesMaintenance = true;
      if (maintenanceFilter === 'Urgent') {
        matchesMaintenance = isMaintenanceUrgent(tool.lastMaintenanceDate, tool.maintenanceInterval);
      } else if (maintenanceFilter === 'Expired') {
        matchesMaintenance = isMaintenanceExpired(tool.lastMaintenanceDate, tool.maintenanceInterval);
      } else if (maintenanceFilter === 'InMaintenance') {
        matchesMaintenance = tool.status === 'maintenance';
      } else if (maintenanceFilter === 'Ok') {
        matchesMaintenance = !isMaintenanceExpired(tool.lastMaintenanceDate, tool.maintenanceInterval) &&
          !isMaintenanceUrgent(tool.lastMaintenanceDate, tool.maintenanceInterval);
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesMaintenance;
    });
  }, [tools, searchQuery, categoryFilter, statusFilter, maintenanceFilter]);

  const sortedTools = useMemo(() => {
    const statusPriority: Record<string, number> = {
      'available': 1,
      'unavailable': 2,
      'rented': 3,
      'maintenance': 4
    };

    return [...filteredTools].sort((a, b) => {
      const priorityA = statusPriority[a.status] || 99;
      const priorityB = statusPriority[b.status] || 99;
      return priorityA - priorityB;
    });
  }, [filteredTools]);

  // Handlers
  const handleOpenAdd = () => setIsAddModalOpen(true);

  const handleToolClick = (tool: Tool) => {
    setSelectedTool(tool);
    setIsDetailModalOpen(true);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    if (categories.includes(newCategoryName.trim())) {
      showAlert("Erreur", "Cette catégorie existe déjà.", 'warning');
      return;
    }
    updateCategories([...categories, newCategoryName.trim()].sort());
    setNewCategoryName('');
  };

  const handleDeleteCategory = (catToDelete: string) => {
    const toolsInCategory = tools.filter(t => t.category === catToDelete);
    if (toolsInCategory.length > 0) {
      showAlert(
        "Action impossible",
        `La catégorie "${catToDelete}" contient encore ${toolsInCategory.length} outil(s). Veuillez les déplacer avant de supprimer la catégorie.`,
        'warning'
      );
      return;
    }

    showAlert(
      "Supprimer la catégorie ?",
      `Voulez-vous vraiment supprimer la catégorie "${catToDelete}" ?`,
      'confirm',
      () => {
        updateCategories(categories.filter(c => c !== catToDelete));
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Integrated Filters & Actions Section */}
      <InventoryFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        categories={categories}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        maintenanceFilter={maintenanceFilter}
        onMaintenanceFilterChange={setMaintenanceFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddTool={handleOpenAdd}
        onManageCategories={() => setIsCategoryModalOpen(true)}
      />

      {/* Tools Grid */}
      <ToolGrid
        tools={sortedTools}
        viewMode={viewMode}
        onToolClick={handleToolClick}
      />

      {/* Detail/Edit Modal */}
      <ToolDetailModal
        tool={selectedTool}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTool(null);
        }}
        onUpdateTool={updateTool}
        categories={categories}
        showAlert={showAlert}
      />

      {/* Add Tool Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ajouter un Nouvel Outil"
        size="7xl"
      >
        <EditForm
          categories={categories}
          onAddCategory={(newCat) => {
            if (!categories.includes(newCat)) {
              updateCategories([...categories, newCat].sort());
            }
          }}
          onSave={(newToolData) => {
            const newTool: Tool = {
              id: Date.now().toString(),
              status: 'available', // Default to available (green)
              ...newToolData as Tool
            };
            addTool(newTool);
            setIsAddModalOpen(false);
          }}
          onCancel={() => setIsAddModalOpen(false)}
          openDocument={openDocument}
        />
      </Modal>

      {/* Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Gestion des Catégories"
      >
        <div className="space-y-8">
          <form onSubmit={handleAddCategory} className="flex gap-4">
            <input
              type="text"
              className="flex-1 rounded-2xl glass-input p-4 text-sm transition-all focus:ring-0"
              placeholder="Nouvelle catégorie..."
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
            />
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" /> Ajouter
            </Button>
          </form>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Catégories existantes</label>
            <div className="grid grid-cols-1 gap-2">
              {categories.map(cat => (
                <div key={cat} className="flex items-center justify-between p-4 glass-card border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-sm font-bold text-white tracking-wide">{cat}</span>
                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    className="p-2 text-gray-500 hover:text-rose-400 transition-colors hover:bg-rose-500/10 rounded-xl"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-center py-8 text-gray-600 italic text-sm">Aucune catégorie définie.</p>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex justify-end">
            <Button variant="secondary" onClick={() => setIsCategoryModalOpen(false)}>Fermer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};