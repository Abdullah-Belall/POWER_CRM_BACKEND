import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SignInDto } from './dto/create-auth.dto';
import { compare, hash } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Response } from 'express';
import { UsersDBService } from 'src/users/DB_Service/users_db.service';
import { TenantDBService } from 'src/tenants/DB_Services/tenant_db.service';
import { Translations } from 'src/utils/base';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';
import { RolesDBService } from 'src/roles/DB_Service/roles_db.service';
import { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersDBService: UsersDBService,
    private readonly tenantDBService: TenantDBService,
    private readonly rolesDBService: RolesDBService,
  ) {}

  async signFirstUser() {
    const roles = [
      'create-tenant',
      'read-tenant',
      'update-tenant',

      'create-user',
      'read-user',
      'update-user',

      'create-role',
      'read-role',
      'update-role',

      'sub-complaint-f-client',
      'self-solve-complaint',
      'create-complaint',
      'read-complaint',
      'assign-complaint',
      'assignable',
      'update-complaint',
    ];
    const tenant = await this.tenantDBService.saveTenant(
      LangsEnum.EN,
      this.tenantDBService.createTenantInstance({
        index: 1,
        domain:
          process.env.NODE_ENV === 'production'
            ? 'power-soft-crm.vercel.app'
            : 'localhost.com',
        company_title: 'POWER SOFT',
        company_logo: 'no-logo',
        phone: '+201009517926',
        is_active: true,
      }),
    );
    const role = await this.rolesDBService.saveRoles(
      LangsEnum.EN,
      this.rolesDBService.createRolesInstance({
        tenant_id: tenant.tenant_id,
        name: 'Big_Boss',
        code: 1,
        roles,
      }),
    );
    await this.usersDBService.saveUser(
      LangsEnum.EN,
      this.usersDBService.createUserInstance({
        tenant_id: tenant.tenant_id,
        index: 1,
        user_name: 'boss',
        role,
        password:
          '$2a$12$8Q6T07uoQMV1cQJ3a9HGiOLfng9HcRDgaNXmCFzgXCXXpydb668SK',
      }),
    );
    return { done: true };
  }

  async signNormalFUser() {
    const roles = [
      'create-user',
      'read-user',
      'update-user',

      'create-role',
      'read-role',
      'update-role',

      'sub-complaint-f-client',
      'self-solve-complaint',

      'read-complaint',
      'assign-complaint',
      'update-complaint',
    ];
    const tenant = await this.tenantDBService.saveTenant(
      LangsEnum.EN,
      this.tenantDBService.createTenantInstance({
        index: 1,
        domain: 'power-soft-crm.nabdtech.store',
        company_title: 'POWER SOFT',
        company_logo: '',
        phone: '+201009517926',
        is_active: true,
      }),
    );
    const role = await this.rolesDBService.saveRoles(
      LangsEnum.EN,
      this.rolesDBService.createRolesInstance({
        tenant_id: tenant.tenant_id,
        name: 'Manager',
        code: 2,
        roles,
      }),
    );
    await this.usersDBService.saveUser(
      LangsEnum.EN,
      this.usersDBService.createUserInstance({
        tenant_id: tenant.tenant_id,
        index: 1,
        user_name: 'manager11',
        role,
        password:
          '$2a$12$8Q6T07uoQMV1cQJ3a9HGiOLfng9HcRDgaNXmCFzgXCXXpydb668SK',
      }),
    );
    return { done: true };
  }

  async signNormalxFUser() {
    const roles = [
      'sub-complaint-f-client',
      'self-solve-complaint',

      'read-complaint',
      'assign-complaint',
      'update-complaint',
    ];
    const tenant = await this.tenantDBService.saveTenant(
      LangsEnum.EN,
      this.tenantDBService.createTenantInstance({
        index: (await this.tenantDBService.getNextIndex()) + 1,
        domain: 'power-soft-crm-v2.nabdtech.store',
        company_title: 'POWER SOFT V2',
        company_logo: '',
        phone: '+201009517926',
        is_active: true,
      }),
    );

    const complaintsManagerRole = await this.rolesDBService.saveRoles(
      LangsEnum.EN,
      this.rolesDBService.createRolesInstance({
        tenant_id: tenant.tenant_id,
        name: 'Complaints Manager',
        code: 1000,
        roles: roles,
      }),
    );
    await this.usersDBService.saveUser(
      LangsEnum.EN,
      this.usersDBService.createUserInstance({
        tenant_id: tenant.tenant_id,
        index: 1001,
        user_name: 'Raniaa',
        role: complaintsManagerRole,
        password:
          '$2a$12$8Q6T07uoQMV1cQJ3a9HGiOLfng9HcRDgaNXmCFzgXCXXpydb668SK',
      }),
    );
    await this.usersDBService.saveUser(
      LangsEnum.EN,
      this.usersDBService.createUserInstance({
        tenant_id: tenant.tenant_id,
        index: 1002,
        user_name: 'Shimaa',
        role: complaintsManagerRole,
        password:
          '$2a$12$8Q6T07uoQMV1cQJ3a9HGiOLfng9HcRDgaNXmCFzgXCXXpydb668SK',
      }),
    );
    await this.usersDBService.saveUser(
      LangsEnum.EN,
      this.usersDBService.createUserInstance({
        tenant_id: tenant.tenant_id,
        index: 1003,
        user_name: 'Ahmed',
        role: complaintsManagerRole,
        password:
          '$2a$12$8Q6T07uoQMV1cQJ3a9HGiOLfng9HcRDgaNXmCFzgXCXXpydb668SK',
      }),
    );

    const salesManagerRole = await this.rolesDBService.saveRoles(
      LangsEnum.EN,
      this.rolesDBService.createRolesInstance({
        tenant_id: tenant.tenant_id,
        name: 'Sales Manager',
        code: 2000,
        roles: ['potential-customers-assign'],
      }),
    );
    await this.usersDBService.saveUser(
      LangsEnum.EN,
      this.usersDBService.createUserInstance({
        tenant_id: tenant.tenant_id,
        index: 2001,
        user_name: 'Mohamed',
        role: salesManagerRole,
        password:
          '$2a$12$8Q6T07uoQMV1cQJ3a9HGiOLfng9HcRDgaNXmCFzgXCXXpydb668SK',
      }),
    );

    const salesSalerRole = await this.rolesDBService.saveRoles(
      LangsEnum.EN,
      this.rolesDBService.createRolesInstance({
        tenant_id: tenant.tenant_id,
        name: 'Saler',
        code: 3000,
        roles: ['potential-customers-assignable'],
      }),
    );
    await this.usersDBService.saveUser(
      LangsEnum.EN,
      this.usersDBService.createUserInstance({
        tenant_id: tenant.tenant_id,
        index: 3001,
        user_name: 'Yomna',
        role: salesSalerRole,
        password:
          '$2a$12$8Q6T07uoQMV1cQJ3a9HGiOLfng9HcRDgaNXmCFzgXCXXpydb668SK',
      }),
    );
    await this.usersDBService.saveUser(
      LangsEnum.EN,
      this.usersDBService.createUserInstance({
        tenant_id: tenant.tenant_id,
        index: 3002,
        user_name: 'Rahma',
        role: salesSalerRole,
        password:
          '$2a$12$8Q6T07uoQMV1cQJ3a9HGiOLfng9HcRDgaNXmCFzgXCXXpydb668SK',
      }),
    );
    await this.usersDBService.saveUser(
      LangsEnum.EN,
      this.usersDBService.createUserInstance({
        tenant_id: tenant.tenant_id,
        index: 3003,
        user_name: 'Mostafa',
        role: salesSalerRole,
        password:
          '$2a$12$8Q6T07uoQMV1cQJ3a9HGiOLfng9HcRDgaNXmCFzgXCXXpydb668SK',
      }),
    );
    return { done: true };
  }

  async generalManager() {
    const tenant = await this.tenantDBService.findOneTenant({
      where: {
        domain: 'power-soft-crm-v2.nabdtech.store',
      },
    });
    const generalManagerRole = await this.rolesDBService.saveRoles(
      LangsEnum.EN,
      this.rolesDBService.createRolesInstance({
        tenant_id: tenant?.tenant_id as string,
        name: 'General Manager',
        code: 4000,
        roles: [
          'create-tenant',
          'read-tenant',
          'update-tenant',

          'create-user',
          'read-user',
          'update-user',
          'read-system',
          'create-system',
          'update-system',
          'read-service',
          'create-service',
          'update-service',
          'create-role',
          'read-role',
          'update-role',

          'sub-complaint-f-client',
          'self-solve-complaint',

          'read-complaint',
          'assign-complaint',
          'update-complaint',

          'potential-customers-assign',
          'suitable_for_meeting',
        ],
      }),
    );
    await this.usersDBService.saveUser(
      LangsEnum.EN,
      this.usersDBService.createUserInstance({
        tenant_id: tenant?.tenant_id,
        index: 3003,
        user_name: 'Islam',
        role: generalManagerRole,
        password:
          '$2a$12$8Q6T07uoQMV1cQJ3a9HGiOLfng9HcRDgaNXmCFzgXCXXpydb668SK',
      }),
    );
    return {
      done: true,
    };
  }
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
      relations: ['role'],
      select: {
        role: {
          id: true,
          name: true,
          roles: true,
        },
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
      role: user.role,
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
      relations: ['role'],
      select: {
        role: {
          id: true,
          name: true,
          roles: true,
        },
      },
    });
    if (!user) {
      throw new ForbiddenException(Translations.user.notFound[lang]);
    }
    // const isDefaultPass = await compare('123456789', user.password);
    // if (isDefaultPass) throw new ForbiddenException();
    const dataObj = {
      id: user.id,
      index: user.index,
      user_name: user.user_name,
      role: user.role,
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
  async changePassword(
    { tenant_id, id, lang }: UserTokenInterface,
    { old_password, new_password }: ChangePasswordDto,
  ) {
    const user = await this.usersDBService.findOneUser({
      where: {
        id,
        tenant_id,
      },
    });
    if (!user) throw new NotFoundException();
    const isPasswordValid = await compare(old_password, user?.password);
    if (!isPasswordValid) {
      throw new ConflictException(Translations.user.wrongPass[lang]);
    }
    user.password = await hash(new_password, 12);
    await this.usersDBService.saveUser(lang, user);
    return {
      done: true,
    };
  }
  private generateAccessToken(payload: object): string {
    return jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET_KEY, {
      expiresIn: '5m',
    });
  }
  private generateRefreshToken(payload: object): string {
    return jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET_KEY, {
      expiresIn: '7d',
    });
  }
}
