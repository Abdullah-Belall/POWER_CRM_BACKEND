import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantBranchEntity } from '../entities/tenant-branch.entity';
import {
  FindOptionsWhere,
  FindOptionsRelations,
  FindOptionsSelect,
  Repository,
  DeepPartial,
  Brackets,
} from 'typeorm';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';
import { Translations } from 'src/utils/base';

@Injectable()
export class TenantBranchesDBService {
  constructor(
    @InjectRepository(TenantBranchEntity)
    private readonly tenantBranchRepo: Repository<TenantBranchEntity>,
  ) {}
  getTenantBranchRepo() {
    return this.tenantBranchRepo;
  }
  tenantBranchQB(alias: string) {
    return this.tenantBranchRepo.createQueryBuilder(alias);
  }
  createTenantBranchInstance(obj: DeepPartial<TenantBranchEntity>) {
    return this.tenantBranchRepo.create(obj);
  }
  async getNextIndex(tenant_id: string) {
    return (
      (await this.tenantBranchRepo.count({
        where: { tenant: { tenant_id } },
      })) + 1
    );
  }
  async saveTenantBranch(lang: LangsEnum, branch: TenantBranchEntity) {
    let saved: TenantBranchEntity;
    try {
      saved = await this.tenantBranchRepo.save(branch);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(Translations.errorMsg[lang]);
    }
    return saved;
  }
  async findOneTenantBranch({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<TenantBranchEntity>;
    select?: FindOptionsSelect<TenantBranchEntity>;
    relations?: string[];
  }) {
    const branch = await this.tenantBranchRepo.findOne({
      where,
      select,
      relations,
    });
    return branch;
  }
  async findTenantBranch({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<TenantBranchEntity>;
    select?: FindOptionsSelect<TenantBranchEntity>;
    relations?: FindOptionsRelations<TenantBranchEntity>;
  }) {
    const [branches, total] = await this.tenantBranchRepo.findAndCount({
      where,
      select,
      relations,
    });
    return { branches, total };
  }
  async searchEngine(
    tenant_id: string,
    search_with: string,
    column?: string,
    created_sort?: 'ASC' | 'DESC',
  ) {
    const queryB = this.tenantBranchRepo
      .createQueryBuilder('branch')
      .where('branch.tenant_id = :tenant_id', { tenant_id })
      .leftJoin('branch.tenant', 'tenant');

    queryB.addSelect(['tenant.id', 'tenant.ar_name', 'tenant.en_name']);

    const term = `%${search_with}%`;
    if (column) {
      queryB.andWhere(`CAST(branch.${column} AS TEXT) ILIKE :term`, { term });
    } else {
      queryB.andWhere(
        new Brackets((subQb) =>
          subQb
            .where(`CAST(branch.index AS TEXT) ILIKE :term`, { term })
            .orWhere('branch.ar_name ILIKE :term', { term })
            .orWhere('branch.en_name ILIKE :term', { term })
            .orWhere('branch.country ILIKE :term', { term })
            .orWhere('branch.state ILIKE :term', { term })
            .orWhere('branch.city ILIKE :term', { term })
            .orWhere('branch.address_details ILIKE :term', { term })
            .orWhere('branch.tax_id ILIKE :term', { term })
            .orWhere('branch.tax_registry ILIKE :term', { term })
            .orWhere('branch.tax_branch_code ILIKE :term', { term }),
        ),
      );
    }
    queryB.orderBy('branch.created_at', created_sort ?? 'DESC');
    const [data, total] = await queryB.getManyAndCount();
    return {
      data,
      total,
    };
  }
}
