import { IsEnum } from 'class-validator';
import { ComplaintStatusEnum } from 'src/utils/types/enums/complaint-status.enum';

export class FisishComplaintDto {
  @IsEnum(ComplaintStatusEnum)
  status: ComplaintStatusEnum.COMPLETED | ComplaintStatusEnum.CANCELLED;
}
