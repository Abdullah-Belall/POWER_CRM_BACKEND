import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePotentialCustomerDto {
  @IsString()
  name: string;
  @IsString()
  @IsOptional()
  company: string;
  @IsString()
  @IsOptional()
  note: string;
  @IsString()
  @IsOptional()
  phone: string;
}
