import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SignInDto } from './dto/create-auth.dto';
import { UsersService } from 'src/users/users.service';
import { compare } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Response } from 'express';
import { UsersDBService } from 'src/users/DB_Service/users_db.service';
import { TenantDBService } from 'src/tenants/DB_Services/tenant_db.service';
import { Translations } from 'src/utils/base';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersDBService: UsersDBService,
    private readonly tenantDBService: TenantDBService,
  ) {}
  async SignIn(
    { user_name, password, tenant_domain, lang }: SignInDto,
    response: Response,
  ) {
    const tenant_id = (
      await this.tenantDBService
        .getTenantsRepo()
        ?.findOne({ where: { domain: tenant_domain } })
    )?.tenant_id;
    if (!tenant_id)
      throw new NotFoundException(Translations.tenant.notFound[lang]);
    const user = await this.usersDBService.getUsersRepo()?.findOne({
      where: {
        user_name,
        tenant_id,
      },
    });
    if (!user) {
      throw new NotFoundException(Translations.user.notFound[lang]);
    }
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      throw new ConflictException(Translations.user.wrongPass[lang]);
    }
    const dataObj = {
      id: user.id,
      index: user.index,
      user_name: user.user_name,
      roles: user.roles,
      lang: user.lang,
      tenant_id: user.tenant_id,
    };
    const access_token = this.generateAccessToken(dataObj);
    const refresh_token = this.generateRefreshToken(dataObj);
    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priority: 'high',
    });
    return {
      done: true,
      access_token,
      user: { ...user, password: undefined, tenant_id: undefined },
    };
  }
  async refreshToken(id: string, tenant_id: string, lang: LangsEnum) {
    const user = await this.usersDBService.getUsersRepo()?.findOne({
      where: {
        id,
        tenant_id,
      },
    });
    if (!user) {
      throw new ForbiddenException(Translations.user.notFound[lang]);
    }
    const dataObj = {
      id: user.id,
      index: user.index,
      user_name: user.user_name,
      roles: user.roles,
      lang: user.lang,
      tenant_id: user.tenant_id,
    };
    const access_token = this.generateAccessToken(dataObj);
    return {
      done: true,
      access_token,
    };
  }
  async SignOut(response: Response) {
    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    response.clearCookie('access_token', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return {
      done: true,
    };
  }
  private generateAccessToken(payload: object): string {
    return jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET_KEY, {
      expiresIn: '15m',
    });
  }
  private generateRefreshToken(payload: object): string {
    return jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET_KEY, {
      expiresIn: '7d',
    });
  }
}
