import {
  IsBoolean,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
} from 'class-validator';

export class UpdateTenantDto {
  @IsOptional()
  @IsBoolean()
  is_active: boolean;
  @IsString()
  @Matches(/^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/, {
    message: 'القيمة يجب أن تكون دومين صالح مثل example.com أو example.co.uk',
  })
  @IsOptional()
  domain: string;
  @IsString()
  @IsOptional()
  company_title: string;
  @IsString()
  @IsOptional()
  company_logo: string;
  @IsPhoneNumber()
  @IsOptional()
  phone: string;
}
