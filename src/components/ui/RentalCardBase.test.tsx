import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RentalCardBase, UserChip, DateRangeChip, PriceChip } from './RentalCardBase';
import { Member } from '@/types';

// Mock formatDate util
vi.mock('@/utils', () => ({
    formatDate: (date: string) => date.split('-').reverse().join('/'),
}));

const mockUser: Member = {
    id: '1',
    name: 'Alice Dupont',
    email: 'alice@test.com',
    badgeNumber: 'A001',
    membershipExpiry: '2025-12-31',
    totalDebt: 0,
    role: 'member',
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
};

describe('RentalCardBase', () => {
    it('renders tool title', () => {
        render(
            <RentalCardBase
                toolTitle="Perceuse"
                user={mockUser}
                startDate="2025-01-01"
                endDate="2025-01-08"
                actions={<button>Action</button>}
            />
        );

        expect(screen.getByText('Perceuse')).toBeInTheDocument();
    });

    it('displays warning state when isWarning is true', () => {
        const { container } = render(
            <RentalCardBase
                toolTitle="Perceuse"
                user={mockUser}
                startDate="2025-01-01"
                endDate="2025-01-08"
                isWarning={true}
                actions={<button>Action</button>}
            />
        );

        const card = container.querySelector('.glass-card');
        expect(card?.className).toContain('border-rose-500');
    });

    it('renders actions slot', () => {
        render(
            <RentalCardBase
                toolTitle="Perceuse"
                user={mockUser}
                startDate="2025-01-01"
                endDate="2025-01-08"
                actions={<button>My Action</button>}
            />
        );

        expect(screen.getByText('My Action')).toBeInTheDocument();
    });

    it('renders warning content when provided', () => {
        render(
            <RentalCardBase
                toolTitle="Perceuse"
                user={mockUser}
                startDate="2025-01-01"
                endDate="2025-01-08"
                warningContent={<div>Warning!</div>}
                actions={<button>Action</button>}
            />
        );

        expect(screen.getByText('Warning!')).toBeInTheDocument();
    });
});

describe('UserChip', () => {
    it('displays user name and initial', () => {
        render(<UserChip user={mockUser} />);

        expect(screen.getByText('A')).toBeInTheDocument();
        expect(screen.getByText('Alice Dupont')).toBeInTheDocument();
    });

    it('shows status when showStatus is true', () => {
        render(<UserChip user={mockUser} showStatus={true} />);

        expect(screen.getByText('Actif')).toBeInTheDocument();
    });

    it('shows expired status when showStatus is false', () => {
        render(<UserChip user={mockUser} showStatus={false} />);

        expect(screen.getByText('Expiré')).toBeInTheDocument();
    });
});

describe('DateRangeChip', () => {
    it('displays formatted date range', () => {
        render(<DateRangeChip startDate="2025-01-01" endDate="2025-01-08" />);

        expect(screen.getByText(/01\/01\/2025/)).toBeInTheDocument();
        expect(screen.getByText(/08\/01\/2025/)).toBeInTheDocument();
    });
});

describe('PriceChip', () => {
    it('displays formatted price', () => {
        const formatter = (n: number) => `${n.toFixed(2)}€`;
        render(<PriceChip amount={25.50} formatter={formatter} />);

        expect(screen.getByText('25.50€')).toBeInTheDocument();
    });

    it('displays N/A when amount is undefined', () => {
        const formatter = (n: number) => `${n}€`;
        render(<PriceChip amount={undefined} formatter={formatter} />);

        expect(screen.getByText('N/A')).toBeInTheDocument();
    });
});
