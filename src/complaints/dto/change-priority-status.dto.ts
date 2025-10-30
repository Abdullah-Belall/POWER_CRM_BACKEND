import { IsEnum } from 'class-validator';
import { ComplaintPriorityStatusEnum } from 'src/utils/types/enums/complaint-status.enum';

export class ChangePrioritySatutsComplaintDto {
  @IsEnum(ComplaintPriorityStatusEnum)
  priority_status: ComplaintPriorityStatusEnum;
}
