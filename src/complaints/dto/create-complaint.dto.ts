import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { ScreenViewerEnum } from 'src/utils/types/enums/screen-viewer.enum';

export class CreateComplaintDto {
  @IsUUID()
  client_id: string;
  @IsString()
  full_name: string;
  @IsPhoneNumber('EG')
  phone: string;
  @IsString()
  @MinLength(4)
  title: string;
  @IsString()
  @MinLength(15)
  details: string;
  @IsEnum(ScreenViewerEnum)
  screen_viewer: ScreenViewerEnum;
  @IsString()
  screen_viewer_id: string;
  @IsString()
  @IsOptional()
  screen_viewer_password: string;
  @IsEnum(ScreenViewerEnum)
  @IsOptional()
  server_viewer: ScreenViewerEnum;
  @IsString()
  @IsOptional()
  server_viewer_id: string;
  @IsString()
  @IsOptional()
  server_viewer_password: string;
  @IsString()
  @IsOptional()
  image1: string;
  @IsString()
  @IsOptional()
  image2: string;
  @IsDateString()
  @IsOptional()
  intervention_date: string;
}
