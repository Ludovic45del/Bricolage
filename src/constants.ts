import { Tool } from './api/types';
import { Member as User } from './api/memberTypes';
import { Rental as Reservation } from './api/rentalTypes';

// Frontend only transaction type for now
export enum TransactionType {
  RENTAL = 'Rental',
  MEMBERSHIP_FEE = 'MembershipFee',
  REPAIR_COST = 'RepairCost',
  PAYMENT = 'Payment'
}

export interface Transaction {
  id: string;
  userId: string;
  toolId?: string;
  amount: number;
  type: TransactionType;
  method: 'Card' | 'Check' | 'Cash' | 'System';
  date: string;
  description?: string;
  status?: 'pending' | 'paid';
}

const TODAY = new Date();
const ONE_YEAR_FROM_NOW = new Date(new Date().setFullYear(TODAY.getFullYear() + 1));
const ONE_DAY_AGO = new Date(new Date().setDate(TODAY.getDate() - 1));

// Mock Data
export const INITIAL_USERS: User[] = [
  {
    id: 'admin1',
    name: 'Administrateur',
    badgeNumber: 'ADMIN',
    email: 'admin@aaccea.com',
    phone: '-',
    employer: 'AACCEA',
    membershipExpiry: ONE_YEAR_FROM_NOW.toISOString().split('T')[0],
    totalDebt: 0,
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
    passwordHash: 'admin' // Mock password for prototype
  },
  {
    id: 'u1',
    name: 'Alice Dupont',
    badgeNumber: 'A001',
    email: 'alice.dupont@example.com',
    phone: '06 01 02 03 04',
    employer: 'TechCorp',
    membershipExpiry: ONE_YEAR_FROM_NOW.toISOString().split('T')[0],
    totalDebt: 0,
    role: 'member',
    status: 'active',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
    passwordHash: 'alice'
  },
  {
    id: 'u2',
    name: 'Bob Martin',
    badgeNumber: 'B002',
    email: 'bob.martin@example.com',
    phone: '06 99 88 77 66',
    employer: 'BatiPro',
    membershipExpiry: ONE_DAY_AGO.toISOString().split('T')[0],
    totalDebt: 15.50,
    role: 'member',
    status: 'active',
    createdAt: '2024-02-15T09:30:00Z',
    updatedAt: '2024-02-15T09:30:00Z',
    passwordHash: 'bob'
  },
];

export const INITIAL_TOOLS: Tool[] = [
  {
    id: 't1',
    title: 'Perceuse à Percussion',
    description: 'Perceuse sans fil professionnelle avec fonction marteau.',
    categoryId: 'Outillage', // Mapping category string to ID for mock
    weeklyPrice: 15,
    status: 'available',
    images: [],
    conditions: [],
    purchasePrice: 120,
    purchaseDate: '2024-01-15',
    lastMaintenanceDate: '2024-06-15',
    maintenanceImportance: 'medium',
    maintenanceInterval: 6,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 't2',
    title: 'Nettoyeur Haute Pression',
    description: 'Karcher électrique 2000 PSI.',
    categoryId: 'Nettoyage',
    weeklyPrice: 25,
    status: 'available',
    images: [],
    conditions: [
      {
        id: 'c1',
        toolId: 't2',
        adminId: 'admin1',
        createdAt: TODAY.toISOString(),
        comment: 'État neuf, prêt pour la saison.',
        statusAtTime: 'available'
      }
    ],
    purchasePrice: 350,
    purchaseDate: '2023-05-20',
    lastMaintenanceDate: '2024-10-10',
    maintenanceImportance: 'low',
    maintenanceInterval: 12,
    createdAt: '2023-05-20T10:00:00Z',
    updatedAt: '2023-05-20T10:00:00Z'
  },
  {
    id: 't3',
    title: 'Scie Circulaire',
    description: 'Scie 7-1/4 pouces avec guide laser.',
    categoryId: 'Scies',
    weeklyPrice: 20,
    status: 'maintenance',
    images: [],
    conditions: [
      {
        id: 'c2',
        toolId: 't3',
        adminId: 'admin1',
        createdAt: ONE_DAY_AGO.toISOString(),
        comment: 'Lame à affûter impérativement.',
        statusAtTime: 'maintenance'
      }
    ],
    purchasePrice: 180,
    purchaseDate: '2022-11-10',
    lastMaintenanceDate: '2025-01-05',
    maintenanceImportance: 'high',
    maintenanceInterval: 6,
    createdAt: '2022-11-10T10:00:00Z',
    updatedAt: '2025-01-05T10:00:00Z'
  },
];

export const INITIAL_RENTALS: Reservation[] = [
  {
    id: 'r1',
    userId: 'u1',
    toolId: 't1',
    startDate: '2024-11-01',
    endDate: '2024-11-03',
    status: 'completed',
    totalPrice: 30,
    createdAt: '2024-11-01T10:00:00Z',
    updatedAt: '2024-11-03T10:00:00Z'
  },
  {
    id: 'r2',
    userId: 'u2',
    toolId: 't2',
    startDate: '2024-12-01',
    endDate: '2024-12-05',
    status: 'completed',
    totalPrice: 100,
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-05T10:00:00Z'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx1',
    userId: 'u2',
    amount: 15.50,
    type: TransactionType.RENTAL,
    method: 'System',
    date: ONE_DAY_AGO.toISOString(),
    description: 'Frais de location précédents',
    status: 'pending'
  },
  {
    id: 'tx2',
    userId: 'u1',
    toolId: 't3',
    amount: 45.00,
    type: TransactionType.REPAIR_COST,
    method: 'Card',
    date: '2025-01-10',
    description: 'Remplacement de la lame',
    status: 'pending'
  }
];

export const MEMBERSHIP_COST = 50.00;
