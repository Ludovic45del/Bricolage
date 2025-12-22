import { IsOptional, IsString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UsersQueryDto {
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
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(['active', 'suspended', 'archived'])
    status?: 'active' | 'suspended' | 'archived';

    @IsOptional()
    @IsEnum(['all', 'active', 'expired', 'expiring_soon'])
    membershipFilter?: 'all' | 'active' | 'expired' | 'expiring_soon';
}
