import React, { useState, useCallback, useMemo } from 'react';
import { Tool, ToolImage, ToolDocument, MaintenanceImportance, ToolStatus } from '@/types';
import { generateId } from '@/utils/ids';

interface ToolFormData {
    title: string;
    description: string;
    categoryId: string;
    weeklyPrice: number;
    purchasePrice?: number;
    purchaseDate?: string;
    maintenanceImportance: MaintenanceImportance;
    maintenanceInterval?: number;
    images: ToolImage[];
    documents: ToolDocument[];
}

const createEmptyFormData = (): ToolFormData => ({
    title: '',
    description: '',
    categoryId: '',
    weeklyPrice: 0,
    purchasePrice: undefined,
    purchaseDate: undefined,
    maintenanceImportance: 'low',
    maintenanceInterval: undefined,
    images: [],
    documents: []
});

const toolToFormData = (tool: Tool): ToolFormData => ({
    title: tool.title,
    description: tool.description || '',
    categoryId: tool.categoryId || '',
    weeklyPrice: tool.weeklyPrice,
    purchasePrice: tool.purchasePrice,
    purchaseDate: tool.purchaseDate,
    maintenanceImportance: tool.maintenanceImportance,
    maintenanceInterval: tool.maintenanceInterval,
    images: tool.images || [],
    documents: tool.documents || []
});

interface UseToolFormOptions {
    onSave: (tool: Tool) => void;
    onUpdate: (tool: Tool) => void;
}

interface UseToolFormReturn {
    formData: ToolFormData;
    setFormData: React.Dispatch<React.SetStateAction<ToolFormData>>;
    isEditing: boolean;
    editingToolId: string | null;

    // Actions
    openAdd: () => void;
    openEdit: (tool: Tool) => void;
    close: () => void;
    submit: (e: React.FormEvent) => void;

    // Field helpers
    updateField: <K extends keyof ToolFormData>(field: K, value: ToolFormData[K]) => void;

    // Image management
    addImage: (url: string) => void;
    removeImage: (index: number) => void;

    // Document management
    addDocument: (doc: { name: string; url: string }) => void;
    updateDocumentName: (index: number, name: string) => void;
    removeDocument: (index: number) => void;

    // Validation
    isValid: boolean;
    errors: Partial<Record<keyof ToolFormData, string>>;
}

/**
 * Custom hook for managing tool form state and logic
 * Separates form logic from UI components
 */
export const useToolForm = (options: UseToolFormOptions): UseToolFormReturn => {
    const { onSave, onUpdate } = options;

    const [formData, setFormData] = useState<ToolFormData>(createEmptyFormData);
    const [editingToolId, setEditingToolId] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const isEditing = editingToolId !== null;

    // Validation
    const errors = useMemo(() => {
        const errs: Partial<Record<keyof ToolFormData, string>> = {};

        if (!formData.title.trim()) {
            errs.title = 'Le nom est requis';
        }
        if (!formData.categoryId.trim()) {
            errs.categoryId = 'La catégorie est requise';
        }
        if (formData.weeklyPrice < 0) {
            errs.weeklyPrice = 'Le prix doit être positif';
        }

        return errs;
    }, [formData.title, formData.categoryId, formData.weeklyPrice]);

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

        const now = new Date().toISOString();
        const toolData: Tool = {
            id: editingToolId || generateId(),
            title: formData.title,
            description: formData.description,
            categoryId: formData.categoryId,
            weeklyPrice: formData.weeklyPrice,
            status: 'available' as ToolStatus,
            images: formData.images,
            documents: formData.documents,
            conditions: [],
            maintenanceImportance: formData.maintenanceImportance,
            purchasePrice: formData.purchasePrice,
            purchaseDate: formData.purchaseDate,
            maintenanceInterval: formData.maintenanceInterval,
            createdAt: isEditing ? now : now,
            updatedAt: now
        };

        if (isEditing) {
            onUpdate(toolData);
        } else {
            onSave(toolData);
        }

        close();
    }, [formData, isValid, isEditing, editingToolId, onSave, onUpdate, close]);

    // Field helpers
    const updateField = useCallback(<K extends keyof ToolFormData>(field: K, value: ToolFormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    // Image management
    const addImage = useCallback((url: string) => {
        const newImage: ToolImage = {
            id: generateId(),
            toolId: editingToolId || '',
            filePath: url,
            displayOrder: formData.images.length,
            isPrimary: formData.images.length === 0,
            createdAt: new Date().toISOString()
        };
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, newImage]
        }));
    }, [editingToolId, formData.images.length]);

    const removeImage = useCallback((index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    }, []);

    // Document management
    const addDocument = useCallback((doc: { name: string; url: string }) => {
        const newDoc: ToolDocument = {
            id: generateId(),
            toolId: editingToolId || '',
            name: doc.name,
            type: 'other',
            filePath: doc.url,
            uploadedAt: new Date().toISOString()
        };
        setFormData(prev => ({
            ...prev,
            documents: [...prev.documents, newDoc]
        }));
    }, [editingToolId]);

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
