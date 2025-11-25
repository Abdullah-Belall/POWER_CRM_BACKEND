import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ContractConnectWayEnum } from 'src/utils/types/enums/contract-connect-way';

export class SignedContractDto {
  @IsUUID()
  @IsString()
  @IsOptional()
  client_id: string;
  @IsString()
  @IsOptional()
  client_user_name: string;
  @IsString()
  @IsOptional()
  client_password: string;
  @IsString()
  @IsUUID()
  @IsOptional()
  client_role_id: string;
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
  tax_id: string;
  @IsOptional()
  @IsString()
  tax_registry: string;
  @IsNumber()
  main_servers_count: number;
  @IsNumber()
  sub_devices_count: number;
  @IsEnum(ContractConnectWayEnum)
  connect_way: ContractConnectWayEnum;
  @IsString()
  contacter: string;
  @IsString()
  contacter_phone: string;
  @IsString()
  contacter_job: string;
  @IsOptional()
  @IsString()
  web_site: string;
  @IsOptional()
  @IsString()
  mail: string;
}
