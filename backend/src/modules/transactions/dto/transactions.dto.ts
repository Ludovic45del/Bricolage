import {
    IsOptional,
    IsString,
    IsNumber,
    IsEnum,
    IsUUID,
    IsDateString,
    Min,
    Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TransactionsQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 50;

    @IsOptional()
    @IsUUID()
    userId?: string;

    @IsOptional()
    @IsEnum(['Rental', 'MembershipFee', 'RepairCost', 'Payment'])
    type?: 'Rental' | 'MembershipFee' | 'RepairCost' | 'Payment';

    @IsOptional()
    @IsEnum(['pending', 'paid'])
    status?: 'pending' | 'paid';

    @IsOptional()
    @IsDateString()
    dateFrom?: string;

    @IsOptional()
    @IsDateString()
    dateTo?: string;
}

export class CreateTransactionDto {
    @IsUUID()
    userId: string;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    amount: number;

    @IsEnum(['Rental', 'MembershipFee', 'RepairCost', 'Payment'])
    type: 'Rental' | 'MembershipFee' | 'RepairCost' | 'Payment';

    @IsOptional()
    @IsEnum(['card', 'check', 'cash'])
    method?: 'card' | 'check' | 'cash';

    @IsOptional()
    @IsString()
    description?: string;
}

export class UpdateTransactionDto {
    @IsOptional()
    @IsEnum(['pending', 'paid'])
    status?: 'pending' | 'paid';

    @IsOptional()
    @IsEnum(['requested', 'in_progress', 'tool_returned', 'completed'])
    workflowStep?: 'requested' | 'in_progress' | 'tool_returned' | 'completed';

    @IsOptional()
    @IsEnum(['card', 'check', 'cash'])
    method?: 'card' | 'check' | 'cash';
}
