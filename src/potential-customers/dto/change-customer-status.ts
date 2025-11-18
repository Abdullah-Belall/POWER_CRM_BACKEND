import { IsEnum } from 'class-validator';
import { PotentialCustomerStatus } from 'src/utils/types/enums/potential-customer.enum';

export class ChangePotentialCustomerStatus {
  @IsEnum(PotentialCustomerStatus)
  status: PotentialCustomerStatus;
}
