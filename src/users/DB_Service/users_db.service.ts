import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import {
  Repository,
  FindOptionsSelect,
  FindOptionsWhere,
  FindOptionsRelations,
  Brackets,
  FindOptionsOrder,
} from 'typeorm';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';
import { Translations } from 'src/utils/base';

@Injectable()
export class UsersDBService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
  ) {}
  getUsersRepo() {
    return this.usersRepo;
  }
  usersQB(alias: string) {
    return this.usersRepo.createQueryBuilder(alias);
  }
  createUserInstance(obj: object) {
    return this.usersRepo.create(obj);
  }
  async saveUser(lang: LangsEnum, user: UserEntity) {
    let saved: UserEntity;
    try {
      saved = await this.usersRepo.save(user);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(Translations.errorMsg[lang]);
    }
    return saved;
  }
  async findOneUser({
    where,
    select,
    relations,
    order,
  }: {
    where: FindOptionsWhere<UserEntity>;
    select?: FindOptionsSelect<UserEntity>;
    relations?: string[];
    order?: FindOptionsOrder<UserEntity>;
  }) {
    const user = await this.usersRepo.findOne({
      where,
      select,
      relations,
      order,
    });
    return user;
  }
  async findUsers({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<UserEntity>;
    select?: FindOptionsSelect<UserEntity>;
    relations?: string[];
  }) {
    const [users, total] = await this.usersRepo.findAndCount({
      where,
      select,
      relations,
    });
    return [users, total];
  }
  async searchEngine(
    tenant_id: string,
    search_with: string,
    column?: string,
    created_sort?: 'ASC' | 'DESC',
    role_id?: string,
  ) {
    const queryB = this.usersRepo
      .createQueryBuilder('user')
      .where('user.tenant_id = :tenant_id', { tenant_id })
      .loadRelationCountAndMap('user.complaints_count', 'user.complaints')
      .loadRelationCountAndMap('user.solving_count', 'user.complaints_solving');

    if (role_id) {
      queryB
        .leftJoin('user.role', 'role')
        .addSelect(['role.id', 'role.name', 'role.code', 'role.roles'])
        .andWhere('role.id = :role_id', { role_id });
    }

    const term = `%${search_with}%`;
    if (column) {
      queryB.andWhere(`user.${column} ILIKE :term`, { term: term });
    } else {
      queryB.andWhere(
        new Brackets((subQb) =>
          subQb
            .where('user.name ILIKE :term', { nameTerm: term })
            .orWhere('user.phone ILIKE :term', { term: term })
            .orWhere('user.email ILIKE :term', { term: term }),
        ),
      );
    }
    queryB.orderBy('user.created_at', created_sort ?? 'DESC');
    const [data, total] = await queryB.getManyAndCount();
    return {
      data,
      total,
    };
  }
}
