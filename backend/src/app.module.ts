import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ToolsModule } from './modules/tools/tools.module';
import { RentalsModule } from './modules/rentals/rentals.module';
import { TransactionsModule } from './modules/transactions/transactions.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ToolsModule,
    RentalsModule,
    TransactionsModule,
  ],
})
export class AppModule { }
