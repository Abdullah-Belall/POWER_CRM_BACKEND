import { IsEnum } from 'class-validator';
import { SupporterReferAcceptEnum } from 'src/utils/types/enums/supporter-refer-accept.enum';

export class ReferChoiceDto {
  @IsEnum(SupporterReferAcceptEnum)
  accept_status: SupporterReferAcceptEnum;
}
