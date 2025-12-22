import React from 'react';
import { Printer } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

type Period = 'Annual' | 'S1' | 'S2';

interface ReportsHeaderProps {
    selectedYear: number;
    setSelectedYear: (year: number) => void;
    selectedPeriod: Period;
    setSelectedPeriod: (period: Period) => void;
    currentYear: number;
    handlePrint: () => void;
}

export const ReportsHeader: React.FC<ReportsHeaderProps> = ({
    selectedYear,
    setSelectedYear,
    selectedPeriod,
    setSelectedPeriod,
    currentYear,
    handlePrint
}) => {
    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h2 className="text-3xl font-black text-white tracking-tight print:text-black">Rapports & Analyses</h2>
                <p className="text-gray-400 mt-2 print:text-gray-600">
                    {selectedPeriod === 'Annual' ? `Rapport Annuel ${selectedYear}` : `Rapport Semestriel ${selectedPeriod} ${selectedYear}`}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 print:hidden">
                <Select
                    value={selectedYear.toString()}
                    onChange={(val) => setSelectedYear(parseInt(val))}
                    options={[0, 1, 2, 3].map(i => {
                        const y = currentYear - i;
                        return { id: y.toString(), name: y.toString() };
                    })}
                    className="w-32"
                />
                <Select
                    value={selectedPeriod}
                    onChange={(val) => setSelectedPeriod(val as Period)}
                    options={[
                        { id: 'Annual', name: 'Annuel' },
                        { id: 'S1', name: 'Semestre 1' },
                        { id: 'S2', name: 'Semestre 2' }
                    ]}
                    className="w-40"
                />
                <Button onClick={handlePrint} variant="secondary" className="border-white/10 bg-white/5">
                    <Printer className="w-4 h-4 mr-2" /> Imprimer
                </Button>
            </div>
        </header>
    );
};
