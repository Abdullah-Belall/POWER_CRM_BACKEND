import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEntity } from '../entities/role.entity';
import {
  Brackets,
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
  async searchEngine(
    tenant_id: string,
    search_with: string,
    column?: string,
    created_sort?: 'ASC' | 'DESC',
  ) {
    const queryB = this.rolesRepo
      .createQueryBuilder('role')
      .where('role.tenant_id = :tenant_id', { tenant_id })
      .loadRelationCountAndMap('role.users_count', 'role.users');

    const term = `%${search_with}%`;
    if (column) {
      queryB.andWhere(`CAST(${column} AS TEXT) ILIKE :term`, { term });
    } else {
      queryB.andWhere(
        new Brackets((subQb) =>
          subQb
            .where('CAST(role.code AS TEXT) ILIKE :term', { term })
            .orWhere('role.name ILIKE :term', { term }),
        ),
      );
    }
    queryB.orderBy('role.created_at', created_sort ?? 'DESC');
    const [data, total] = await queryB.getManyAndCount();
    return {
      data,
      total,
    };
  }
}
