import { IsJSON, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateContractDto {
  @IsJSON()
  systems: string;
  @IsJSON()
  services: string;
  @IsUUID()
  customer_id: string;
  @IsOptional()
  @IsNumber()
  discount: number;
  @IsOptional()
  @IsNumber()
  vat: number;
  @IsOptional()
  @IsNumber()
  w_tax: number;
}
