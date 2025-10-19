import { IsEnum, IsString, Matches, MinLength } from 'class-validator';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';

export class SignInDto {
  @IsString()
  @MinLength(4)
  user_name: string;
  @IsString()
  @MinLength(8)
  password: string;
  @IsString()
  @Matches(/^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/, {
    message: 'القيمة يجب أن تكون دومين صالح مثل example.com أو example.co.uk',
  })
  tenant_domain: string;
  @IsEnum(LangsEnum)
  lang: LangsEnum;
}
