import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersDBService } from './DB_Service/users_db.service';
import { RolesDBService } from 'src/roles/DB_Service/roles_db.service';
import { UserTokenInterface } from './types/interfaces/user-token.interface';
import { hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersDBService: UsersDBService,
    private readonly roleDBService: RolesDBService,
  ) {}

  async createUser(
    { tenant_id, lang }: UserTokenInterface,
    { user_name, email, password, role_id }: CreateUserDto,
  ) {
    const isDuplicateUser = await this.usersDBService.findOneUser({
      where: {
        user_name,
        tenant_id,
      },
    });
    if (isDuplicateUser) {
      throw new ConflictException();
    }
    const role: any = await this.roleDBService
      .rolesQB('role')
      .where('role.id = :id', { id: role_id })
      .andWhere('role.tenant_id = :tenant_id', { tenant_id })
      .loadRelationCountAndMap('role.users_count', 'role.users')
      .getOne();
    if (!role) {
      throw new NotFoundException();
    }
    const passwordHash = await hash(password, 12);

    const user = await this.usersDBService.saveUser(
      lang,
      this.usersDBService.createUserInstance({
        tenant_id,
        index: Number(role.code) + Number(role.users_count) + 1,
        user_name,
        role,
        email,
        password: passwordHash,
      }),
    );
    return {
      done: true,
      id: user.id,
    };
  }
  async findAllUsers(tenant_id: string, role?: string) {
    const qb = this.usersDBService
      .usersQB('user')
      .where('user.tenant_id = :tenant_id', { tenant_id })
      .leftJoin('user.role', 'role')
      .addSelect(['role.id', 'role.name', 'role.code'])
      .loadRelationCountAndMap('user.complaints_count', 'user.complaints')
      .loadRelationCountAndMap('user.solving_count', 'user.complaints_solving');
    if (role) {
      // qb.andWhere('role.id = :role_id', { role_id });
      qb.andWhere('role.name = :role', { role });
    }
    const [users, total] = await qb
      .orderBy('user.created_at', 'DESC')
      .getManyAndCount();
    return {
      users,
      total,
    };
  }
  async profile(id: string, tenant_id: string) {
    const user = await this.usersDBService.findOneUser({
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
      throw new NotFoundException();
    }
    return user;
  }
}
