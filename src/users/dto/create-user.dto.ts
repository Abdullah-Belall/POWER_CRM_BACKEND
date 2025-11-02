import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsUUID()
  role_id: string;
  @IsString()
  @MinLength(4)
  user_name: string;
  @IsOptional()
  @IsString()
  email: string;
  @IsString()
  @IsOptional()
  phone: string;
  @IsString()
  @MinLength(8)
  password: string;
}
