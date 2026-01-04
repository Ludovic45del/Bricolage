
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking user debts...');
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                totalDebt: true
            }
        });

        console.log(`Found ${users.length} users:`);
        console.table(users.map(u => ({
            name: u.name,
            totalDebt: u.totalDebt.toString(),
            totalDebtNum: Number(u.totalDebt)
        })));

        const totalDebt = users.reduce((sum, u) => sum + Number(u.totalDebt), 0);

        console.log(`\nTotal Debt Sum: ${totalDebt.toFixed(2)} €`);
        console.log(`(If negative, it means users have credit/positive balance, or negative debt values are stored)`);

    } catch (e) {
        console.error('Error fetching users:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
