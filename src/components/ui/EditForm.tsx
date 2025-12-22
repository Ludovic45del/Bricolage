import React, { useState, useEffect } from 'react';
import { generateId } from '@/utils/ids';
import { Tool, ToolImage, ToolDocument } from '@/types';
import { Button } from './Button';
import { CheckCircle } from 'lucide-react';
import { GeneralInfoSection } from './GeneralInfoSection';
import { DocumentationSection } from './DocumentationSection';
import { Category } from '@/hooks/data/useCategoriesQuery';

interface EditFormProps {
    tool?: Tool;
    onSave: (tool: Partial<Tool>) => void;
    onCancel: () => void;
    categories: Category[];
    onAddCategory?: (categoryName: string) => void;
    openDocument: (url: string, name: string) => void;
}

export const EditForm: React.FC<EditFormProps> = ({ tool, onSave, onCancel, categories, onAddCategory, openDocument }) => {
    const [formData, setFormData] = useState<Partial<Tool>>(tool || {});

    useEffect(() => {
        if (tool) {
            setFormData(tool);
        }
    }, [tool]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach((file: File) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const newImage: ToolImage = {
                        id: generateId() + Math.random(),
                        toolId: formData.id || '',
                        filePath: reader.result as string,
                        displayOrder: (formData.images?.length || 0) + 1,
                        isPrimary: false,
                        createdAt: new Date().toISOString()
                    };
                    setFormData(prev => ({
                        ...prev,
                        images: [...(prev.images || []), newImage]
                    }));
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: (prev.images || []).filter((_, i) => i !== index)
        }));
    };

    const handleSpecialDocUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'invoice' | 'manual' | 'ce_cert') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newDoc: ToolDocument = {
                    id: generateId() + Math.random(),
                    toolId: formData.id || '',
                    name: file.name,
                    type: type,
                    filePath: reader.result as string,
                    uploadedAt: new Date().toISOString()
                };

                const otherDocs = (formData.documents || []).filter(d => d.type !== type);
                setFormData(prev => ({
                    ...prev,
                    documents: [...otherDocs, newDoc]
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeSpecialDoc = (type: 'invoice' | 'manual' | 'ce_cert') => {
        setFormData(prev => ({
            ...prev,
            documents: (prev.documents || []).filter(d => d.type !== type)
        }));
    };

    const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach((file: File) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const newDoc: ToolDocument = {
                        id: generateId() + Math.random(),
                        toolId: formData.id || '',
                        name: file.name,
                        type: 'other',
                        filePath: reader.result as string,
                        uploadedAt: new Date().toISOString()
                    };
                    setFormData(prev => ({
                        ...prev,
                        documents: [...(prev.documents || []), newDoc]
                    }));
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeDoc = (index: number) => {
        const otherDocs = (formData.documents || []).filter(d => d.type === 'other' || d.type === undefined);
        const docToRemove = otherDocs[index];
        if (docToRemove) {
            setFormData(prev => ({
                ...prev,
                documents: (prev.documents || []).filter(d => d !== docToRemove)
            }));
        }
    };

    return (
        <form id="edit-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-[1400px] mx-auto">
            <GeneralInfoSection
                formData={formData}
                setFormData={setFormData}
                categories={categories}
                onAddCategory={onAddCategory}
                handleImageUpload={handleImageUpload}
                removeImage={removeImage}
            />

            <div className="space-y-8">
                <DocumentationSection
                    formData={formData}
                    setFormData={setFormData}
                    handleSpecialDocUpload={handleSpecialDocUpload}
                    removeSpecialDoc={removeSpecialDoc}
                    handleDocUpload={handleDocUpload}
                    removeDoc={removeDoc}
                    openDocument={openDocument}
                />

                <div className="flex items-center justify-end gap-6 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-[0.3em] transition-colors"
                    >
                        Annuler les modifications
                    </button>
                    <Button
                        type="submit"
                        className="px-10 py-4 rounded-[20px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_15px_30px_-10px_rgba(16,185,129,0.5)] transition-all hover:scale-[1.01] active:scale-95 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2"
                    >
                        <CheckCircle className="w-4 h-4" /> Enregistrer l'Outil
                    </Button>
                </div>
            </div>
        </form>
    );
};

