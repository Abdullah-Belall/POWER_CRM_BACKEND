import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import {
  Repository,
  FindOptionsSelect,
  FindOptionsWhere,
  FindOptionsRelations,
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
  }: {
    where: FindOptionsWhere<UserEntity>;
    select?: FindOptionsSelect<UserEntity>;
    relations?: string[];
  }) {
    const user = await this.usersRepo.findOne({
      where,
      select,
      relations,
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
}
