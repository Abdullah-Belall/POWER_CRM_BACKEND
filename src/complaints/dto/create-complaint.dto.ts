import { IsEnum, IsPhoneNumber, IsString, MinLength } from 'class-validator';
import { ScreenViewerEnum } from 'src/utils/types/enums/screen-viewer.enum';

export class CreateComplaintDto {
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
  screen_viewer_password: string;
}
