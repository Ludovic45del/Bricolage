
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Creating test rental for 2026...');
    try {
        // Find a user and a tool
        const user = await prisma.user.findFirst();
        const tool = await prisma.tool.findFirst();

        if (!user || !tool) {
            console.error('No user or tool found');
            return;
        }

        const rental = await prisma.rental.create({
            data: {
                userId: user.id,
                toolId: tool.id,
                startDate: new Date('2026-01-02'),
                endDate: new Date('2026-01-09'),
                actualReturnDate: new Date('2026-01-09'),
                status: 'completed',
                totalPrice: 42.00, // Explicit price
                returnComment: 'Test rental for 2026 report verification'
            }
        });

        // Also create a transaction for it
        await prisma.transaction.create({
            data: {
                userId: user.id,
                // toolId removed as not in schema
                amount: 42.00,
                type: 'Rental',
                status: 'paid',
                date: new Date('2026-01-09'),
                description: `Location test 2026: ${tool.title}`
            }
        });

        console.log('Created rental:', rental.id);

    } catch (e) {
        console.error('Error creating rental:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
