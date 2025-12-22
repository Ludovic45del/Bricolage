import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    identifier: string; // email OR badgeNumber

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;
}
