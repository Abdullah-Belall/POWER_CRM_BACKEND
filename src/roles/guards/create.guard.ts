import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { CustomRequest } from 'src/utils/types/interfaces/custom-req.interface';

@Injectable()
export class CreateRoleGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<CustomRequest>();
    if (!request.user) {
      throw new UnauthorizedException();
    }
    const roles: string[] = JSON.parse(request.user?.role?.roles);
    if (roles.includes('create-role')) return true;
    return false;
  }
}
