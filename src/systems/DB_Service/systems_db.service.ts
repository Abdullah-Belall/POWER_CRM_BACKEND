import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsSelect,
  FindOptionsWhere,
  DeepPartial,
  Brackets,
} from 'typeorm';
import { SystemEntity } from '../entities/system.entity';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';
import { Translations } from 'src/utils/base';

@Injectable()
export class SystemsDBService {
  constructor(
    @InjectRepository(SystemEntity)
    private readonly systemsRepo: Repository<SystemEntity>,
  ) {}
  getSystemRepo() {
    return this.systemsRepo;
  }
  systemQB(alias: string) {
    return this.systemsRepo.createQueryBuilder(alias);
  }
  createSystemInstance(obj: DeepPartial<SystemEntity>) {
    return this.systemsRepo.create(obj);
  }
  async getNextIndex(tenant_id: string) {
    return (await this.systemsRepo.count({ where: { tenant_id } })) + 1;
  }
  async saveSystem(lang: LangsEnum, system: SystemEntity) {
    let saved: SystemEntity;
    try {
      saved = await this.systemsRepo.save(system);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(Translations.errorMsg[lang]);
    }
    return saved;
  }
  async findOneSystem({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<SystemEntity>;
    select?: FindOptionsSelect<SystemEntity>;
    relations?: string[];
  }) {
    const system = await this.systemsRepo.findOne({
      where,
      select,
      relations,
    });
    return system;
  }
  async findSystem({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<SystemEntity>;
    select?: FindOptionsSelect<SystemEntity>;
    relations?: string[];
  }) {
    const [systems, total] = await this.systemsRepo.findAndCount({
      where,
      select,
      relations,
    });
    return { systems, total };
  }
  async searchEngine(
    tenant_id: string,
    search_with: string,
    column?: string,
    created_sort?: 'ASC' | 'DESC',
  ) {
    const queryB = this.systemsRepo
      .createQueryBuilder('system')
      .where('system.tenant_id = :tenant_id', { tenant_id })
      .loadRelationCountAndMap('system.contracts_count', 'system.contracts');
    const term = `%${search_with}%`;
    if (column) {
      queryB.andWhere(`CAST(${column} AS TEXT) ILIKE :term`, { term });
    } else {
      queryB.andWhere(
        new Brackets((subQb) =>
          subQb
            .where('system.name ILIKE :term', { term })
            .orWhere('system.desc ILIKE :term', { term }),
        ),
      );
    }
    queryB.orderBy('system.created_at', created_sort ?? 'DESC');
    const [data, total] = await queryB.getManyAndCount();
    return {
      data,
      total,
    };
  }
}
