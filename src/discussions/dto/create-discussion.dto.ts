import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { DiscussionStatusEnum } from 'src/utils/types/enums/discussion-status.enum';

export class CreateDiscussionDto {
  @IsUUID()
  customer_id: string;
  @IsString()
  @MinLength(5)
  details: string;
  @IsEnum(DiscussionStatusEnum)
  @IsOptional()
  status: DiscussionStatusEnum;
}
