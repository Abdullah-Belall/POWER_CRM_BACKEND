import {
  IsDateString,
  IsEnum,
  IsJSON,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MinLength,
} from 'class-validator';
import { DiscussionStatusEnum } from 'src/utils/types/enums/discussion-status.enum';
import { MeetingEnum } from 'src/utils/types/enums/meeting-enum';

export class CreateDiscussionDto {
  @IsUUID()
  customer_id: string;
  @IsString()
  @MinLength(5)
  details: string;
  @IsEnum(DiscussionStatusEnum)
  @IsOptional()
  status: DiscussionStatusEnum;
  @IsEnum(MeetingEnum)
  @IsOptional()
  meeting: MeetingEnum;
  @IsOptional()
  @IsString()
  meeting_url: string;
  @IsJSON()
  @IsOptional()
  meeting_employees: string;
  @IsDateString()
  @IsOptional()
  meeting_date: string;
}
