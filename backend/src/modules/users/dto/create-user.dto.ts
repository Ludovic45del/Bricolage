import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength, IsEnum, IsDateString } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(255)
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(50)
    badgeNumber: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    phone?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    employer?: string;

    @IsOptional()
    @IsEnum(['member', 'staff', 'admin'])
    role?: string;

    @IsOptional()
    @IsEnum(['active', 'suspended', 'archived'])
    status?: string;

    @IsOptional()
    @IsDateString()
    membershipExpiry?: string;
}
