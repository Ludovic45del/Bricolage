
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Connecting to database...');
    try {
        const rentals = await prisma.rental.findMany({
            orderBy: { createdAt: 'desc' }
        });

        console.log(`Found ${rentals.length} rentals:`);
        console.table(rentals.map(r => ({
            id: r.id.substring(0, 8),
            status: r.status,
            totalPrice: r.totalPrice ? r.totalPrice.toString() : 'null',
            startDate: r.startDate.toISOString().split('T')[0],
            endDate: r.endDate.toISOString().split('T')[0],
            actualReturnDate: r.actualReturnDate ? r.actualReturnDate.toISOString().split('T')[0] : 'null'
        })));

        // Check specific "completed" ones closely
        const completed = rentals.filter(r => r.status === 'completed');
        console.log('\nDetailed Completed Rentals:');
        completed.forEach(r => {
            console.log({
                id: r.id,
                status: r.status,
                totalPrice: r.totalPrice,
                totalPriceType: typeof r.totalPrice,
                isDecimal: r.totalPrice && typeof r.totalPrice === 'object' && 'd' in r.totalPrice
            });
        });

    } catch (e) {
        console.error('Error fetching rentals:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
