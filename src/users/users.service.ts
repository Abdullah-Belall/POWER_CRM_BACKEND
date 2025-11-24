import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersDBService } from './DB_Service/users_db.service';
import { RolesDBService } from 'src/roles/DB_Service/roles_db.service';
import { UserTokenInterface } from './types/interfaces/user-token.interface';
import * as XLSX from 'xlsx';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { compare, hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersDBService: UsersDBService,
    private readonly roleDBService: RolesDBService,
  ) {}

  async createUser(
    { tenant_id, lang }: UserTokenInterface,
    { user_name, email, password, phone, role_id }: CreateUserDto,
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
        phone,
      }),
    );
    return {
      done: true,
      id: user.id,
    };
  }
  async editUser(
    { tenant_id, lang }: UserTokenInterface,
    user_id: string,
    updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersDBService.findOneUser({
      where: {
        id: user_id,
        tenant_id,
      },
      relations: ['role'],
      select: {
        role: {
          id: true,
        },
      },
    });
    if (!user) throw new NotFoundException();
    if (updateUserDto.role_id && updateUserDto.role_id !== user.role?.id) {
      const newRole = await this.roleDBService.findOneRole({
        where: {
          id: updateUserDto.role_id,
          tenant_id,
        },
      });
      if (!newRole) {
        throw new BadRequestException();
      }
      user.role = newRole;
      user.index =
        (await this.usersDBService
          .usersQB('user')
          .leftJoin('user.role', 'role')
          .where('role.id = :role_id', { role_id: newRole.id })
          .andWhere('user.tenant_id = :tenant_id', { tenant_id })
          .getCount()) +
        Number(newRole.code) +
        1;
    }
    if (updateUserDto.password) {
      const isPasswordValid = await compare(
        updateUserDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        const hashedPass = await hash(updateUserDto.password, 12);
        updateUserDto.password = hashedPass;
      }
    }
    await this.usersDBService.saveUser(
      lang,
      this.usersDBService.createUserInstance({
        ...user,
        ...updateUserDto,
      }),
    );
    return {
      done: true,
    };
  }
  async findAllUsers(tenant_id: string, roles?: string[]) {
    const qb = this.usersDBService
      .usersQB('user')
      .where('user.tenant_id = :tenant_id', { tenant_id })
      .leftJoin('user.chat_id', 'chat_id')
      .leftJoin('user.role', 'role')
      .addSelect([
        'role.id',
        'role.name',
        'role.code',
        'role.roles',
        'chat_id.id',
        'chat_id.chat_id',
        'chat_id.active',
      ])
      .loadRelationCountAndMap('user.complaints_count', 'user.complaints')
      .loadRelationCountAndMap('user.solving_count', 'user.complaints_solving');
    if (roles && roles.length > 0) {
      qb.andWhere(`role.roles ?& :roles`, { roles });
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
  async importExcel(tenant_id: string, role_id: string, path: string) {
    const workbook = XLSX.readFile(path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data: any[] = XLSX.utils.sheet_to_json(sheet);
    let readUsers: UserEntity[] = [];
    const role = await this.roleDBService.findOneRole({
      where: { id: role_id, tenant_id },
    });
    if (!role) throw new BadRequestException();
    const lastUser = await this.usersDBService.findOneUser({
      where: {
        role: { id: role.id },
        tenant_id,
      },
      order: { index: 'DESC' },
    });
    let nextIndex = lastUser ? lastUser.index + 1 : role.code + 1;
    for (const row of data) {
      const user = this.usersDBService.createUserInstance({
        tenant_id,
        index: nextIndex,
        user_name: row['user_name'] ? row['user_name']?.trim() : undefined,
        email: row['email'] ? row['email']?.trim() : undefined,
        password: `$2a$12$4OevOM9gwRFzl443nKJuX.bGcUmqRkTNQlz2mUKDauXKfiZZTn/h.`,
        phone: row['phone'] ? `+20` + row['phone'] : null,
        role,
      });
      readUsers.push(user);
      nextIndex++;
    }
    await this.usersDBService.saveUser(LangsEnum.AR, readUsers as any);
    return { done: true };
  }
  async tempoDelete() {
    for (let i = 3002; i <= 3015; i++) {
      const user = await this.usersDBService.findOneUser({
        where: { index: i },
      });
      await this.usersDBService.getUsersRepo().delete(user?.id as string);
    }
  }
}
