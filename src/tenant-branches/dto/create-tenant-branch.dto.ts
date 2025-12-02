import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTenantBranchDto {
  @IsUUID()
  tenant_id: string;
  @IsString()
  ar_name: string;
  @IsString()
  @IsOptional()
  en_name?: string;
  @IsString()
  country: string;
  @IsString()
  state: string;
  @IsString()
  city: string;
  @IsString()
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
