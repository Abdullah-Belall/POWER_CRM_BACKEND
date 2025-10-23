import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { RolesDBService } from './DB_Service/roles_db.service';
import { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';

@Injectable()
export class RolesService {
  constructor(private readonly roleDBService: RolesDBService) {}
  async createRole(
    { lang, tenant_id }: UserTokenInterface,
    { name, code, roles }: CreateRoleDto,
  ) {
    const isDublicateName = await this.roleDBService.findOneRole({
      where: {
        name,
        tenant_id,
      },
    });
    if (isDublicateName) {
      throw new ConflictException();
    }
    const isDublicateCode = await this.roleDBService.findOneRole({
      where: {
        code,
        tenant_id,
      },
    });
    if (isDublicateCode) {
      throw new ConflictException();
    }
    const role = await this.roleDBService.saveRoles(
      lang,
      this.roleDBService.createRolesInstance({
        tenant_id,
        name,
        code,
        roles,
      }),
    );
    return {
      done: true,
      id: role.id,
    };
  }
  async changeRoleArributes(
    { tenant_id, lang }: UserTokenInterface,
    role_id: string,
    roles: string,
  ) {
    const role = await this.roleDBService.findOneRole({
      where: {
        id: role_id,
        tenant_id,
      },
    });
    if (!role) throw new BadRequestException();
    role.roles = roles;
    await this.roleDBService.saveRoles(lang, role);
    return {
      done: true,
    };
  }
  async findAllRoles(tenant_id: string) {
    const [roles, total] = await this.roleDBService
      .rolesQB('role')
      .loadRelationCountAndMap('role.usersCount', 'role.users')
      .where('role.tenant_id = :tenant_id', { tenant_id })
      .getManyAndCount();

    return {
      roles,
      total,
    };
  }
  async rolesSelectList(tenant_id: string) {
    return await this.roleDBService
      .rolesQB('role')
      .where('role.tenant_id = :tenant_id', { tenant_id })
      .select(['role.id', 'role.name'])
      .getMany();
  }
}
