import React, { useState, useCallback, useMemo } from 'react';
import { Tool } from '../../../types';

interface FormData {
    title: string;
    description: string;
    category: string;
    daily_price: number;
    purchase_price?: number;
    purchase_date?: string;
    maintenance_importance: 'Low' | 'Medium' | 'High';
    maintenance_interval?: number;
    manual_url?: string;
    ce_cert_url?: string;
    invoice_url?: string;
    images: string[];
    documents: { name: string; url: string; date: string }[];
}

const createEmptyFormData = (): FormData => ({
    title: '',
    description: '',
    category: '',
    daily_price: 0,
    purchase_price: undefined,
    purchase_date: undefined,
    maintenance_importance: 'Low',
    maintenance_interval: undefined,
    manual_url: undefined,
    ce_cert_url: undefined,
    invoice_url: undefined,
    images: [],
    documents: []
});

const toolToFormData = (tool: Tool): FormData => ({
    title: tool.title,
    description: tool.description,
    category: tool.category,
    daily_price: tool.daily_price,
    purchase_price: tool.purchase_price,
    purchase_date: tool.purchase_date,
    maintenance_importance: tool.maintenance_importance,
    maintenance_interval: tool.maintenance_interval,
    manual_url: tool.manual_url,
    ce_cert_url: tool.ce_cert_url,
    invoice_url: tool.invoice_url,
    images: tool.images || [],
    documents: tool.documents || []
});

interface UseToolFormOptions {
    onSave: (tool: Tool) => void;
    onUpdate: (tool: Tool) => void;
}

interface UseToolFormReturn {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    isEditing: boolean;
    editingToolId: string | null;

    // Actions
    openAdd: () => void;
    openEdit: (tool: Tool) => void;
    close: () => void;
    submit: (e: React.FormEvent) => void;

    // Field helpers
    updateField: <K extends keyof FormData>(field: K, value: FormData[K]) => void;

    // Image management
    addImage: (url: string) => void;
    removeImage: (index: number) => void;

    // Document management
    addDocument: (doc: { name: string; url: string }) => void;
    updateDocumentName: (index: number, name: string) => void;
    removeDocument: (index: number) => void;

    // Validation
    isValid: boolean;
    errors: Partial<Record<keyof FormData, string>>;
}

/**
 * Custom hook for managing tool form state and logic
 * Separates form logic from UI components
 */
export const useToolForm = (options: UseToolFormOptions): UseToolFormReturn => {
    const { onSave, onUpdate } = options;

    const [formData, setFormData] = useState<FormData>(createEmptyFormData);
    const [editingToolId, setEditingToolId] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const isEditing = editingToolId !== null;

    // Validation
    const errors = useMemo(() => {
        const errs: Partial<Record<keyof FormData, string>> = {};

        if (!formData.title.trim()) {
            errs.title = 'Le nom est requis';
        }
        if (!formData.category.trim()) {
            errs.category = 'La catégorie est requise';
        }
        if (formData.daily_price < 0) {
            errs.daily_price = 'Le prix doit être positif';
        }

        return errs;
    }, [formData.title, formData.category, formData.daily_price]);

    const isValid = Object.keys(errors).length === 0;

    // Actions
    const openAdd = useCallback(() => {
        setFormData(createEmptyFormData());
        setEditingToolId(null);
        setIsOpen(true);
    }, []);

    const openEdit = useCallback((tool: Tool) => {
        setFormData(toolToFormData(tool));
        setEditingToolId(tool.id);
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        setFormData(createEmptyFormData());
        setEditingToolId(null);
    }, []);

    const submit = useCallback((e: React.FormEvent) => {
        e.preventDefault();

        if (!isValid) return;

        const toolData: Tool = {
            id: editingToolId || Date.now().toString(),
            title: formData.title,
            description: formData.description,
            category: formData.category,
            daily_price: formData.daily_price,
            status: 'Available',
            images: formData.images,
            conditions: [],
            maintenance_importance: formData.maintenance_importance,
            purchase_price: formData.purchase_price,
            purchase_date: formData.purchase_date,
            maintenance_interval: formData.maintenance_interval,
            manual_url: formData.manual_url,
            ce_cert_url: formData.ce_cert_url,
            invoice_url: formData.invoice_url,
            documents: formData.documents
        };

        if (isEditing) {
            onUpdate(toolData);
        } else {
            onSave(toolData);
        }

        close();
    }, [formData, isValid, isEditing, editingToolId, onSave, onUpdate, close]);

    // Field helpers
    const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    // Image management
    const addImage = useCallback((url: string) => {
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, url]
        }));
    }, []);

    const removeImage = useCallback((index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    }, []);

    // Document management
    const addDocument = useCallback((doc: { name: string; url: string }) => {
        setFormData(prev => ({
            ...prev,
            documents: [...prev.documents, { ...doc, date: new Date().toISOString() }]
        }));
    }, []);

    const updateDocumentName = useCallback((index: number, name: string) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents.map((doc, i) =>
                i === index ? { ...doc, name } : doc
            )
        }));
    }, []);

    const removeDocument = useCallback((index: number) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents.filter((_, i) => i !== index)
        }));
    }, []);

    return {
        formData,
        setFormData,
        isEditing,
        editingToolId,
        openAdd,
        openEdit,
        close,
        submit,
        updateField,
        addImage,
        removeImage,
        addDocument,
        updateDocumentName,
        removeDocument,
        isValid,
        errors
    };
};

export default useToolForm;
