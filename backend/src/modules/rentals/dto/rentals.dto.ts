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

export class RentalsQueryDto {
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
    @IsEnum(['pending', 'active', 'completed', 'late', 'rejected'])
    status?: 'pending' | 'active' | 'completed' | 'late' | 'rejected';

    @IsOptional()
    @IsUUID()
    userId?: string;

    @IsOptional()
    @IsUUID()
    toolId?: string;

    @IsOptional()
    @IsDateString()
    startDateFrom?: string;

    @IsOptional()
    @IsDateString()
    startDateTo?: string;
}

export class CreateRentalDto {
    @IsUUID()
    userId: string;

    @IsUUID()
    toolId: string;

    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    totalPrice?: number;
}

export class UpdateRentalDto {
    @IsOptional()
    @IsEnum(['active', 'completed', 'rejected'])
    status?: 'active' | 'completed' | 'rejected';

    @IsOptional()
    @IsDateString()
    actualReturnDate?: string;

    @IsOptional()
    @IsString()
    returnComment?: string;
}
