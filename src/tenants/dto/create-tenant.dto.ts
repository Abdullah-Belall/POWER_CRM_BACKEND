import {
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { IsRolesArray } from 'src/users/validators/is-roles-array.validator';

export class CreateTenantDto {
  @IsString()
  @Matches(/^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/, {
    message: 'القيمة يجب أن تكون دومين صالح مثل example.com أو example.co.uk',
  })
  domain: string;
  @IsString()
  company_title: string;
  @IsString()
  company_logo: string;
  @IsPhoneNumber()
  @IsOptional()
  phone: string;
  @IsString()
  @MinLength(2)
  user_name: string;
  @IsString()
  @MinLength(9, { message: 'Invalid password.' })
  @MaxLength(24, { message: 'Invalid password.' })
  password: string;
  @Validate(IsRolesArray)
  roles: string;
}
