import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { CustomRequest } from 'src/utils/types/interfaces/custom-req.interface';

@Injectable()
export class ReadRoleGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<CustomRequest>();
    if (!request.user) {
      throw new UnauthorizedException();
    }
    const roles = request.user?.role?.roles;
    console.log(roles);
    if (roles.includes('read-role')) return true;
    return false;
  }
}
