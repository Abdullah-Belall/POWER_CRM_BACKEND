import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantsEntity } from '../entities/tenant.entity';
import {
  Brackets,
  FindOptionsSelect,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';
import { Translations } from 'src/utils/base';

@Injectable()
export class TenantDBService {
  constructor(
    @InjectRepository(TenantsEntity)
    private readonly tenantsRepo: Repository<TenantsEntity>,
  ) {}
  getTenantsRepo() {
    return this.tenantsRepo;
  }
  createTenantInstance(obj: object) {
    return this.tenantsRepo.create(obj);
  }
  async saveTenant(lang: LangsEnum, tenant: TenantsEntity) {
    let saved: TenantsEntity;
    try {
      saved = await this.tenantsRepo.save(tenant);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(Translations.errorMsg[lang]);
    }
    return saved;
  }
  async findOneTenant({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<TenantsEntity>;
    select?: FindOptionsSelect<TenantsEntity>;
    relations?: string[];
  }) {
    const tenant = await this.tenantsRepo.findOne({
      where,
      select,
      relations,
    });
    return tenant;
  }
  async getNextIndex() {
    return (await this.tenantsRepo.count()) + 1;
  }
  async searchEngine(
    search_with: string,
    column?: keyof TenantsEntity,
    created_sort?: 'ASC' | 'DESC',
  ) {
    const searchableColumns: Record<string, string> = {
      domain: 'tenant.domain',
      company_title: 'tenant.company_title',
      company_logo: 'tenant.company_logo',
      phone: 'tenant.phone',
      index: 'tenant.index',
      created_at: 'tenant.created_at',
      updated_at: 'tenant.updated_at',
    };
    const queryB = this.tenantsRepo.createQueryBuilder('tenant');
    const term = `%${search_with}%`;
    const selectedColumn = column ? searchableColumns[column] : undefined;
    if (selectedColumn) {
      queryB.andWhere(`CAST(${selectedColumn} AS TEXT) ILIKE :term`, { term });
    } else {
      queryB.andWhere(
        new Brackets((subQb) =>
          subQb
            .where('tenant.domain ILIKE :term', { term })
            .orWhere('tenant.company_title ILIKE :term', { term })
            .orWhere('tenant.phone ILIKE :term', { term })
            .orWhere('CAST(tenant.index AS TEXT) ILIKE :term', { term }),
        ),
      );
    }
    queryB.orderBy('tenant.created_at', created_sort ?? 'DESC');
    const [data, total] = await queryB.getManyAndCount();
    return {
      data,
      total,
    };
  }
}
