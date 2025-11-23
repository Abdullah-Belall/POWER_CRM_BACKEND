import { IsEnum } from 'class-validator';
import { PriorityStatusEnum } from 'src/utils/types/enums/complaint-status.enum';

export class ChangePrioritySatutsComplaintDto {
  @IsEnum(PriorityStatusEnum)
  priority_status: PriorityStatusEnum;
}
