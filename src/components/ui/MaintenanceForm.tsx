import React, { useState, useMemo } from 'react';
import { Tool, ToolStatus, MaintenanceImportance } from '@/types';
import { parseISO, addMonths, isValid } from 'date-fns';
import { MaintenanceStatusCard } from './MaintenanceStatusCard';
import { MaintenanceSchedulingCard } from './MaintenanceSchedulingCard';
import { MaintenanceAttachmentsSection } from './MaintenanceAttachmentsSection';

interface MaintenanceFormProps {
    tool: Tool;
    onUpdate: (tool: Tool) => void;
    adminName: string;
}

export const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ tool, onUpdate }) => {
    const [status, setStatus] = useState<ToolStatus>(tool.status);
    const [comment, setComment] = useState('');
    const [lastMaintenanceDate, setLastMaintenanceDate] = useState(tool.lastMaintenanceDate || new Date().toISOString());
    const [maintenanceInterval, setMaintenanceInterval] = useState(tool.maintenanceInterval || 6);
    const [maintenanceImportance, setMaintenanceImportance] = useState<MaintenanceImportance>(tool.maintenanceImportance || 'low');
    const [cost, setCost] = useState<string>('');
    const [documents, setDocuments] = useState<{ name: string; url: string; date: string }[]>([]);

    const nextMaintenanceDate = useMemo(() => {
        if (!lastMaintenanceDate) return null;
        const date = parseISO(lastMaintenanceDate);
        if (!isValid(date)) return null;
        return addMonths(date, maintenanceInterval);
    }, [lastMaintenanceDate, maintenanceInterval]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach((file: File) => {
                const reader = new FileReader();
                reader.onload = () => {
                    if (reader.result) {
                        setDocuments(prev => [...prev, {
                            name: file.name,
                            url: reader.result as string,
                            date: new Date().toISOString()
                        }]);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeDocument = (index: number) => {
        setDocuments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Create updated tool with only the fields the backend accepts
        const updatedTool: Tool = {
            ...tool,
            status: status,
            lastMaintenanceDate: lastMaintenanceDate,
            maintenanceInterval: maintenanceInterval,
            maintenanceImportance: maintenanceImportance,
        };

        // Call the update handler
        onUpdate(updatedTool);

        // Reset form fields
        setComment('');
        setDocuments([]);
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[1400px] mx-auto">
            <div className="space-y-5">
                <MaintenanceStatusCard
                    status={status}
                    setStatus={setStatus}
                    comment={comment}
                    setComment={setComment}
                />

                <MaintenanceSchedulingCard
                    maintenanceImportance={maintenanceImportance}
                    setMaintenanceImportance={setMaintenanceImportance}
                    lastMaintenanceDate={lastMaintenanceDate}
                    setLastMaintenanceDate={setLastMaintenanceDate}
                    maintenanceInterval={maintenanceInterval}
                    setMaintenanceInterval={setMaintenanceInterval}
                    cost={cost}
                    setCost={setCost}
                    nextMaintenanceDate={nextMaintenanceDate}
                />
            </div>

            <div className="flex flex-col h-full space-y-5">
                <MaintenanceAttachmentsSection
                    documents={documents}
                    handleFileUpload={handleFileUpload}
                    removeDocument={removeDocument}
                />
            </div>
        </form>
    );
};
