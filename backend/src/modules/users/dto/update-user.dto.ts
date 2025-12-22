import { IsOptional, IsString, IsEnum, IsEmail, MaxLength } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    phone?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    employer?: string;

    @IsOptional()
    @IsEnum(['active', 'suspended', 'archived'])
    status?: 'active' | 'suspended' | 'archived';
}
