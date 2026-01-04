
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking displayed Pending Revenue (En Attente)...');
    try {
        const pendingTransactions = await prisma.transaction.findMany({
            where: {
                status: 'pending'
            }
        });

        console.log(`Found ${pendingTransactions.length} pending transactions:`);
        console.table(pendingTransactions.map(t => ({
            id: t.id.substring(0, 8),
            amount: Number(t.amount),
            date: t.date.toISOString().split('T')[0],
            type: t.type
        })));

        const totalPending = pendingTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

        console.log(`\nTotal Pending Sum: ${totalPending.toFixed(2)} €`);

    } catch (e) {
        console.error('Error fetching transactions:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
