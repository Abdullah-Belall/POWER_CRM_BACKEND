import {
  IsEmail,
  IsOptional,
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
  @IsEmail()
  @IsOptional()
  email: string;
  @IsString()
  @MinLength(8)
  password: string;
}
