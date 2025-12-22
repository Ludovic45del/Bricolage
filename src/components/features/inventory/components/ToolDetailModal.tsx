import React, { useState, useEffect } from 'react';
import { Tool } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import { EditForm } from '@/components/ui/EditForm';
import { MaintenanceForm } from '@/components/ui/MaintenanceForm';
import { getStatusLabel, openDocument } from '@/utils';
import { FileText, Edit, Settings } from 'lucide-react';
import { ToolImageGallery } from './ToolImageGallery';
import { ToolMaintenanceHistory } from './ToolMaintenanceHistory';
import { ToolFinancialInfo } from './ToolFinancialInfo';
import { ToolMaintenanceHealth } from './ToolMaintenanceHealth';
import { ToolDocumentsSection } from './ToolDocumentsSection';
import { Category } from '@/hooks/data/useCategoriesQuery';

interface ToolDetailModalProps {
    tool: Tool | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdateTool: (tool: Tool) => void;
    categories: Category[];
    showAlert: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'confirm', onConfirm?: () => void) => void;
}

export const ToolDetailModal: React.FC<ToolDetailModalProps> = ({
    tool,
    isOpen,
    onClose,
    onUpdateTool,
    categories
}) => {
    const [activeTab, setActiveTab] = useState<'details' | 'edit' | 'maintenance'>('details');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedTool, setSelectedTool] = useState<Tool | null>(tool);

    useEffect(() => {
        setSelectedTool(tool);
        setCurrentImageIndex(0);
        setActiveTab('details');
    }, [tool]);

    if (!selectedTool) return null;

    const manualDoc = selectedTool.documents?.find(d => d.type === 'manual');
    const ceCertDoc = selectedTool.documents?.find(d => d.type === 'ce_cert');
    const invoiceDoc = selectedTool.documents?.find(d => d.type === 'invoice');
    const otherDocs = selectedTool.documents?.filter(d => d.type === 'other');

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="7xl"
            title={
                <Tabs
                    tabs={[
                        { id: 'details', label: 'Détails', icon: <FileText className="w-4 h-4" /> },
                        { id: 'edit', label: 'Modifier', icon: <Edit className="w-4 h-4" /> },
                        { id: 'maintenance', label: 'Maintenance & Suivi', icon: <Settings className="w-4 h-4" /> }
                    ]}
                    activeTab={activeTab}
                    onChange={(id) => setActiveTab(id as any)}
                    className="border-none"
                />
            }
        >
            <div className="flex flex-col h-full">
                <div className="mt-2 flex-1">
                    <TabPanel isActive={activeTab === 'details'}>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-[1400px] mx-auto">
                            <div className="lg:col-span-5 space-y-8">
                                <ToolImageGallery
                                    images={selectedTool.images}
                                    title={selectedTool.title}
                                    currentIndex={currentImageIndex}
                                    setCurrentIndex={setCurrentImageIndex}
                                />
                                <ToolMaintenanceHistory conditions={selectedTool.conditions || []} />
                            </div>

                            <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-0">
                                <div className="glass-card p-10 bg-white/5 border border-white/10 rounded-[48px] shadow-2xl space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">
                                                {selectedTool.category?.name || selectedTool.categoryId || 'N/A'}
                                            </span>
                                            <div className={`badge-liquid ${selectedTool.status === 'available' ? 'badge-liquid-emerald' :
                                                selectedTool.status === 'rented' ? 'badge-liquid-blue' :
                                                    'badge-liquid-rose'}`}>
                                                {getStatusLabel(selectedTool.status)}
                                            </div>
                                        </div>
                                        <h3 className="text-5xl font-black text-white tracking-tighter leading-tight drop-shadow-2xl">
                                            {selectedTool.title}
                                        </h3>
                                        <p className="text-gray-400 text-lg font-light leading-relaxed italic">
                                            "{selectedTool.description || 'Aucune description fournie.'}"
                                        </p>
                                    </div>

                                    <ToolFinancialInfo
                                        weeklyPrice={selectedTool.weeklyPrice}
                                        purchasePrice={selectedTool.purchasePrice}
                                        invoiceDoc={invoiceDoc}
                                    />

                                    <ToolMaintenanceHealth
                                        maintenanceImportance={selectedTool.maintenanceImportance || 'low'}
                                        lastMaintenanceDate={selectedTool.lastMaintenanceDate || ''}
                                        maintenanceInterval={selectedTool.maintenanceInterval || 6}
                                    />

                                    <ToolDocumentsSection
                                        manualDoc={manualDoc}
                                        ceCertDoc={ceCertDoc}
                                        otherDocs={otherDocs}
                                    />
                                </div>
                            </div>
                        </div>
                    </TabPanel>

                    <TabPanel isActive={activeTab === 'edit'}>
                        <EditForm
                            tool={selectedTool}
                            categories={categories}
                            onSave={(updatedData) => {
                                const updatedTool = { ...selectedTool, ...updatedData } as Tool;
                                setSelectedTool(updatedTool);
                                onUpdateTool(updatedTool);
                                setActiveTab('details');
                            }}
                            onCancel={() => setActiveTab('details')}
                            openDocument={openDocument}
                        />
                    </TabPanel>

                    <TabPanel isActive={activeTab === 'maintenance'}>
                        <MaintenanceForm
                            tool={selectedTool}
                            onUpdate={(updated) => {
                                setSelectedTool(updated);
                                onUpdateTool(updated);
                                setActiveTab('details');
                            }}
                            adminName="Administrateur Bricolage"
                        />
                    </TabPanel>
                </div>
            </div>
        </Modal>
    );
};

