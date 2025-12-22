import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Cleanup existing data to ensure we have exactly what was requested
    await prisma.tool.deleteMany();
    await prisma.user.deleteMany();
    await prisma.category.deleteMany();

    // Create categories
    const categories = await Promise.all([
        prisma.category.create({
            data: { name: 'Outillage', description: 'Outils manuels généraux' },
        }),
        prisma.category.create({
            data: { name: 'Électroportatif', description: 'Outils électriques portables' },
        }),
    ]);

    console.log(`✅ Created ${categories.length} categories`);

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const admin = await prisma.user.create({
        data: {
            name: 'Administrateur',
            email: 'admin@assomanager.fr',
            badgeNumber: 'ADMIN001',
            phone: '0600000001',
            employer: 'AssomanagerPro',
            membershipExpiry: new Date('2030-12-31'),
            totalDebt: 0,
            role: 'admin',
            status: 'active',
            passwordHash: adminPassword,
        },
    });

    console.log(`✅ Created admin user: ${admin.email} (password: Admin123!)`);

    // Create 3 test members
    const memberPassword = await bcrypt.hash('Member123!', 10);
    const members = await Promise.all([
        prisma.user.create({
            data: {
                name: 'Jean Dupont',
                email: 'membre1@test.fr',
                badgeNumber: 'M001',
                phone: '0600000002',
                employer: 'TechCorp',
                membershipExpiry: new Date('2025-12-31'),
                totalDebt: 0,
                role: 'member',
                status: 'active',
                passwordHash: memberPassword,
            },
        }),
        prisma.user.create({
            data: {
                name: 'Marie Martin',
                email: 'membre2@test.fr',
                badgeNumber: 'M002',
                phone: '0600000003',
                employer: 'DesignStudio',
                membershipExpiry: new Date('2025-11-30'),
                totalDebt: 0,
                role: 'member',
                status: 'active',
                passwordHash: memberPassword,
            },
        }),
        prisma.user.create({
            data: {
                name: 'Lucas Bernard',
                email: 'membre3@test.fr',
                badgeNumber: 'M003',
                phone: '0600000004',
                employer: 'GreenFuture',
                membershipExpiry: new Date('2026-01-15'),
                totalDebt: 0,
                role: 'member',
                status: 'active',
                passwordHash: memberPassword,
            },
        }),
    ]);

    console.log(`✅ Created ${members.length} test members`);

    // Create 3 sample tools
    const tools = await Promise.all([
        prisma.tool.create({
            data: {
                title: 'Perceuse Bosch PSB 650',
                description: 'Perceuse à percussion 650W',
                categoryId: categories[1].id, // Électroportatif
                weeklyPrice: 15.00,
                status: 'available',
                maintenanceImportance: 'medium',
            },
        }),
        prisma.tool.create({
            data: {
                title: 'Scie sauteuse Makita',
                description: 'Scie sauteuse professionnelle 720W',
                categoryId: categories[1].id,
                weeklyPrice: 20.00,
                status: 'available',
                maintenanceImportance: 'high',
            },
        }),
        prisma.tool.create({
            data: {
                title: 'Jeu de clés à molette',
                description: 'Set complet de clés à molette 6-32mm',
                categoryId: categories[0].id, // Outillage
                weeklyPrice: 5.00,
                status: 'available',
                maintenanceImportance: 'low',
            },
        }),
    ]);

    console.log(`✅ Created ${tools.length} sample tools`);

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📋 Test credentials:');
    console.log('   Admin: admin@assomanager.fr / Admin123!');
    console.log('   Members: membre1@test.fr, membre2@test.fr, membre3@test.fr / Member123!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
