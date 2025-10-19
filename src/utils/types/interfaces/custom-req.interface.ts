import { Request } from 'express';
import { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';

export interface CustomRequest extends Request {
  user: UserTokenInterface | null;
}
