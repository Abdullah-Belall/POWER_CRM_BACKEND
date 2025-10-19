import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CustomRequest } from 'src/utils/types/interfaces/custom-req.interface';

export const User = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<CustomRequest>();
    return request.user;
  },
);
