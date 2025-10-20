import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { CustomRequest } from 'src/utils/types/interfaces/custom-req.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: CustomRequest, _: Response, next: () => void) {
    const accessToken = req.headers.authorization?.split(' ')[1];
    console.log('accessToken => ', accessToken);
    if (!accessToken) {
      req.user = null;
      next();
      return;
    }
    try {
      const verfiy: any = jwt.verify(
        accessToken,
        process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
      );
      delete verfiy.iat;
      delete verfiy.exp;
      req.user = verfiy;
    } catch {
      req.user = null;
    }
    next();
  }
}
