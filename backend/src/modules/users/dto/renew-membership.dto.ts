import { IsNotEmpty, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';

export class RenewMembershipDto {
    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    amount: number;

    @IsEnum(['card', 'check', 'cash'])
    @IsNotEmpty()
    paymentMethod: 'card' | 'check' | 'cash';

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(24)
    durationMonths?: number = 12;
}
