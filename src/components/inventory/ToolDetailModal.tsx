import React, { useState, useEffect } from 'react';
import { Tool } from '../../api/types';
import { Modal } from '../ui/Modal';
import { Tabs, TabPanel } from '../ui/Tabs';
import { EditForm } from '../ui/EditForm';
import { MaintenanceForm } from '../ui/MaintenanceForm';
import { getPlaceholderImage, formatCurrency, formatDate, getMaintenanceExpiration, getStatusLabel, openDocument } from '../../utils';
import { ChevronLeft, ChevronRight, FileText, AlertTriangle, Shield, Paperclip, History, Edit, Settings } from 'lucide-react';

interface ToolDetailModalProps {
    tool: Tool | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdateTool: (tool: Tool) => void;
    categories: string[];
    showAlert: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'confirm', onConfirm?: () => void) => void;
}

export const ToolDetailModal: React.FC<ToolDetailModalProps> = ({
    tool,
    isOpen,
    onClose,
    onUpdateTool,
    categories,
    showAlert
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
                    {/* Details Tab */}
                    <TabPanel isActive={activeTab === 'details'}>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-[1400px] mx-auto">
                            {/* LEFT COLUMN: Visuals & History */}
                            <div className="lg:col-span-5 space-y-8">
                                {/* Image Gallery */}
                                <div className="space-y-4">
                                    <div className="relative group/img h-[400px] w-full rounded-[32px] overflow-hidden shadow-2xl border border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                                        {selectedTool.images && selectedTool.images.length > 0 ? (
                                            <img
                                                src={selectedTool.images[currentImageIndex]?.filePath}
                                                alt={selectedTool.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Settings className="w-20 h-20 text-gray-700/30" />
                                            </div>
                                        )}
                                        {selectedTool.images && selectedTool.images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={() => setCurrentImageIndex(prev => (selectedTool.images && prev === 0 ? selectedTool.images.length - 1 : prev - 1))}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 bg-black/40 backdrop-blur-xl rounded-full text-white opacity-0 group-hover/img:opacity-100 transition-all hover:bg-black/60"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => setCurrentImageIndex(prev => (selectedTool.images && prev === selectedTool.images.length - 1 ? 0 : prev + 1))}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-black/40 backdrop-blur-xl rounded-full text-white opacity-0 group-hover/img:opacity-100 transition-all hover:bg-black/60"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {selectedTool.images && selectedTool.images.length > 1 && (
                                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-1">
                                            {selectedTool.images.map((img, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setCurrentImageIndex(i)}
                                                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${i === currentImageIndex ? 'border-purple-500 scale-105 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'border-transparent opacity-40 hover:opacity-100'}`}
                                                >
                                                    <img src={img.filePath} className="w-full h-full object-cover" alt="" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Timeline History */}
                                <div className="space-y-6 pt-6 border-t border-white/5">
                                    <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                                        <History className="w-3.5 h-3.5" /> Historique & Suivi
                                    </h5>
                                    <div className="relative ml-4 space-y-6 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-white/5 max-h-[350px] overflow-y-auto no-scrollbar pr-4">
                                        {selectedTool.conditions && selectedTool.conditions.length > 0 ? (
                                            selectedTool.conditions.map((c) => (
                                                <div key={c.id} className="relative pl-8 group/item">
                                                    <div className="absolute left-0 top-1.5 w-2.5 h-2.5 -translate-x-1/2 rounded-full bg-slate-900 border-2 border-white/10 group-hover/item:border-purple-500 group-hover/item:scale-125 transition-all duration-300"></div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{formatDate(c.createdAt)}</span>
                                                        <span className={`badge-liquid ${c.statusAtTime === 'available' ? 'badge-liquid-emerald' : 'badge-liquid-amber'} !text-[7px] !px-1.5 !py-0`}>
                                                            {c.statusAtTime === 'available' ? 'RETOUR' : 'MAINTENANCE'}
                                                        </span>
                                                        {c.cost && c.cost > 0 && (
                                                            <span className="text-[10px] font-black text-rose-400">
                                                                -{formatCurrency(c.cost)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-300 font-light leading-relaxed italic group-hover/item:text-white transition-colors">
                                                        "{c.comment || 'Aucun commentaire.'}"
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-[10px] text-gray-600 italic pl-8">Aucun historique disponible.</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Info */}
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

                                    {/* Financial Stats Grid */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-8 bg-white/5 border border-white/10 rounded-[32px] shadow-xl space-y-1 group hover:bg-white/10 transition-all">
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tarif Locatif</span>
                                            <div className="text-4xl font-black text-white group-hover:text-purple-400 transition-colors">
                                                {formatCurrency(selectedTool.weeklyPrice)}
                                            </div>
                                        </div>
                                        <div className="p-8 bg-white/5 border border-white/10 rounded-[32px] shadow-xl space-y-1 group hover:bg-white/10 transition-all">
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Valeur d'Acquisition</span>
                                            <div className="text-4xl font-black text-white group-hover:text-emerald-400 transition-colors">
                                                {selectedTool.purchasePrice ? formatCurrency(selectedTool.purchasePrice) : '--'}
                                            </div>

                                            {invoiceDoc && (
                                                <button
                                                    onClick={() => openDocument(invoiceDoc.filePath, invoiceDoc.name)}
                                                    className="text-[9px] font-bold text-purple-400 hover:text-white flex items-center gap-1 uppercase tracking-widest mt-2"
                                                >
                                                    <FileText className="w-3 h-3" /> Voir Facture
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Maintenance Health */}
                                    <div className="relative group">
                                        <div className={`absolute -inset-1 rounded-[36px] blur-md opacity-20 group-hover:opacity-30 transition duration-1000 ${selectedTool.maintenanceImportance === 'high' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
                                        <div className="relative glass-card p-8 bg-slate-900/60 border border-white/10 rounded-[32px] overflow-hidden">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className={`p-3 rounded-2xl backdrop-blur-2xl ${selectedTool.maintenanceImportance === 'high' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20' : 'bg-amber-500/20 text-amber-400 border border-amber-500/20'}`}>
                                                    <AlertTriangle className="w-6 h-6" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <span className="text-[11px] font-black text-white uppercase tracking-widest">État de Maintenance</span>
                                                    <div className="text-[10px] font-bold uppercase tracking-widest">
                                                        <span className={selectedTool.maintenanceImportance === 'high' ? 'text-rose-400' : 'text-amber-400'}>
                                                            Priorité {selectedTool.maintenanceImportance === 'high' ? 'Critique' : selectedTool.maintenanceImportance === 'medium' ? 'Moyenne' : 'Faible'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-8 border-t border-white/5 pt-6">
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Dernière Révision</span>
                                                    <div className="text-sm font-bold text-white">{formatDate(selectedTool.lastMaintenanceDate || '')}</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Prochaine Échéance</span>
                                                    <div className="text-sm font-bold text-purple-400">
                                                        {getMaintenanceExpiration(selectedTool.lastMaintenanceDate, selectedTool.maintenanceInterval)
                                                            ? formatDate(getMaintenanceExpiration(selectedTool.lastMaintenanceDate, selectedTool.maintenanceInterval)?.toISOString() || '')
                                                            : '--'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Documents */}
                                    <div className="space-y-4">
                                        <h6 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-2">Documentation Technique</h6>
                                        <div className="grid grid-cols-2 gap-3">
                                            {manualDoc && (
                                                <button
                                                    onClick={() => openDocument(manualDoc.filePath, 'notice')}
                                                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                                                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Notice d'utilisation</span>
                                                    </div>
                                                    <ChevronRight className="w-3 h-3 text-gray-600" />
                                                </button>
                                            )}

                                            {ceCertDoc && (
                                                <button
                                                    onClick={() => openDocument(ceCertDoc.filePath, 'certificat_ce')}
                                                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Shield className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                                                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Certificat CE</span>
                                                    </div>
                                                    <ChevronRight className="w-3 h-3 text-gray-600" />
                                                </button>
                                            )}

                                            {selectedTool.documents && selectedTool.documents.filter(d => d.type === 'other').map((doc, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => openDocument(doc.filePath, doc.name)}
                                                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group col-span-2"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Paperclip className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" />
                                                        <span className="text-[10px] font-bold text-white uppercase tracking-widest truncate max-w-[200px]">{doc.name}</span>
                                                    </div>
                                                    <ChevronRight className="w-3 h-3 text-gray-600" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabPanel>

                    {/* Edit Tab */}
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

                    {/* Maintenance Tab */}
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
