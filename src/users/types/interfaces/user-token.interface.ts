import { LangsEnum } from 'src/utils/types/enums/langs.enum';

export interface UserTokenInterface {
  id: string;
  tenant_id: string;
  index: number;
  user_name: string;
  roles: string;
  lang: LangsEnum;
}
