import { IsEnum } from 'class-validator';
import { ContractStatusEnum } from 'src/utils/types/enums/contract-status.enum';

export class CreateContractStatusDto {
  @IsEnum(ContractStatusEnum)
  status: ContractStatusEnum;
}
