import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class AssignSupporterDto {
  @IsUUID()
  supporter_id: string;
  @IsUUID()
  complaint_id: string;
  @IsOptional()
  @IsString()
  note: string;
  @IsNumber()
  @IsOptional()
  max_time_to_solve: number;
}
