import { IsString } from 'class-validator';

export class ChangeRoleAttribute {
  @IsString()
  roles: string;
}
