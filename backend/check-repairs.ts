
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking repair costs for 2026...');
    try {
        const startDate = new Date('2026-01-01');
        const endDate = new Date('2026-12-31');

        const repairs = await prisma.transaction.findMany({
            where: {
                // type: 'RepairCost', // Or try checking all types first
                date: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });

        console.log(`Found ${repairs.length} transactions in 2026:`);
        console.table(repairs.map(r => ({
            id: r.id.substring(0, 8),
            type: r.type,
            amount: r.amount.toString(),
            date: r.date.toISOString().split('T')[0],
            status: r.status
        })));

        const totalRepairs = repairs
            .filter(r => r.type === 'RepairCost')
            .reduce((sum, r) => sum + Number(r.amount), 0);

        console.log(`\nTotal RepairCost for 2026: ${totalRepairs.toFixed(2)} €`);

    } catch (e) {
        console.error('Error fetching transactions:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
