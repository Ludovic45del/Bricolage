import {
    IsOptional,
    IsString,
    IsNumber,
    IsEnum,
    IsUUID,
    IsDateString,
    Min,
    Max,
    MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ToolsQueryDto {
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
    @IsUUID()
    categoryId?: string;

    @IsOptional()
    @IsEnum(['available', 'rented', 'maintenance', 'unavailable'])
    status?: 'available' | 'rented' | 'maintenance' | 'unavailable';

    @IsOptional()
    @Type(() => Boolean)
    maintenanceAlert?: boolean;
}

export class CreateToolDto {
    @IsString()
    @MaxLength(255)
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsUUID()
    categoryId?: string;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    weeklyPrice: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    purchasePrice?: number;

    @IsOptional()
    @IsDateString()
    purchaseDate?: string;

    @IsOptional()
    @IsEnum(['low', 'medium', 'high'])
    maintenanceImportance?: 'low' | 'medium' | 'high';

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    maintenanceInterval?: number;
}

export class UpdateToolDto {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsUUID()
    categoryId?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    weeklyPrice?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    purchasePrice?: number;

    @IsOptional()
    @IsEnum(['available', 'rented', 'maintenance', 'unavailable'])
    status?: 'available' | 'rented' | 'maintenance' | 'unavailable';

    @IsOptional()
    @IsEnum(['low', 'medium', 'high'])
    maintenanceImportance?: 'low' | 'medium' | 'high';

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    maintenanceInterval?: number;

    @IsOptional()
    @IsDateString()
    lastMaintenanceDate?: string;

    @IsOptional()
    @IsDateString()
    purchaseDate?: string;
}

export class CreateConditionDto {
    @IsEnum(['available', 'rented', 'maintenance', 'unavailable'])
    statusAtTime: 'available' | 'rented' | 'maintenance' | 'unavailable';

    @IsOptional()
    @IsString()
    comment?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    cost?: number;
}
