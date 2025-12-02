import { IsOptional, IsString } from 'class-validator';

export class UpdateTenantBranchDto {
  @IsString()
  @IsOptional()
  ar_name: string;
  @IsString()
  @IsOptional()
  en_name?: string;
  @IsString()
  @IsOptional()
  country: string;
  @IsString()
  @IsOptional()
  state: string;
  @IsString()
  @IsOptional()
  city: string;
  @IsString()
  @IsOptional()
  address_details: string;
  @IsString()
  @IsOptional()
  tax_id?: string;
  @IsString()
  @IsOptional()
  tax_registry?: string;
  @IsString()
  @IsOptional()
  logo?: string;
  @IsString()
  @IsOptional()
  tax_branch_code?: string;
  @IsString()
  @IsOptional()
  user_num?: number;
  @IsString()
  @IsOptional()
  password?: string;
  @IsString()
  @IsOptional()
  OS?: string;
  @IsString()
  @IsOptional()
  version?: string;
  @IsString()
  @IsOptional()
  serial?: string;
}
