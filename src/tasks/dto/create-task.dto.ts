import {
  IsDateString,
  IsEnum,
  IsJSON,
  IsOptional,
  IsString,
} from 'class-validator';
import { PriorityStatusEnum } from 'src/utils/types/enums/complaint-status.enum';

export class CreateTaskDto {
  @IsString()
  title: string;
  @IsString()
  @IsOptional()
  details: string;
  @IsString()
  @IsOptional()
  location: string;
  @IsEnum(PriorityStatusEnum)
  @IsOptional()
  priority_status: PriorityStatusEnum;
  @IsDateString()
  task_date: string;
  @IsJSON()
  users: string;
}
