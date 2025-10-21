import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEntity } from '../entities/role.entity';
import {
  DeepPartial,
  FindOptionsOrder,
  FindOptionsSelect,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';
import { Translations } from 'src/utils/base';

@Injectable()
export class RolesDBService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly rolesRepo: Repository<RoleEntity>,
  ) {}
  getRolesRepo() {
    return this.rolesRepo;
  }
  rolesQB(alias: string) {
    return this.rolesRepo.createQueryBuilder(alias);
  }
  createRolesInstance(obj: DeepPartial<RoleEntity>) {
    return this.rolesRepo.create(obj);
  }
  async findOneRole({
    where,
    select,
    relations,
    order,
  }: {
    where: FindOptionsWhere<RoleEntity>;
    select?: FindOptionsSelect<RoleEntity>;
    relations?: string[];
    order?: FindOptionsOrder<RoleEntity>;
  }) {
    const role = await this.rolesRepo.findOne({
      where,
      select,
      relations,
      order,
    });
    return role;
  }
  async getNextIndex(tenant_id: string) {
    return (await this.rolesRepo.count({ where: { tenant_id } })) + 1;
  }
  async saveRoles(lang: LangsEnum, complaint: RoleEntity) {
    let saved: RoleEntity;
    try {
      saved = await this.rolesRepo.save(complaint);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(Translations.errorMsg[lang]);
    }
    return saved;
  }
}
