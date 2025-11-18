import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PotentialCustomerEntity } from '../entities/potential-customer.entity';
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
export class PotentialCustomersDBService {
  constructor(
    @InjectRepository(PotentialCustomerEntity)
    private readonly potentialCustomerRepo: Repository<PotentialCustomerEntity>,
  ) {}
  getPotentialCustomerRepo() {
    return this.potentialCustomerRepo;
  }
  potentialCustomerQB(alias: string) {
    return this.potentialCustomerRepo.createQueryBuilder(alias);
  }
  createPotentialCustomerInstance(obj: DeepPartial<PotentialCustomerEntity>) {
    return this.potentialCustomerRepo.create(obj);
  }
  async getNextIndex(tenant_id: string) {
    return (
      (await this.potentialCustomerRepo.count({
        where: { tenant_id },
      })) + 1
    );
  }
  async savePotentialCustomer(
    lang: LangsEnum,
    customer: PotentialCustomerEntity,
  ) {
    let saved: PotentialCustomerEntity;
    try {
      saved = await this.potentialCustomerRepo.save(customer);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(Translations.errorMsg[lang]);
    }
    return saved;
  }
  async findOnePotentialCustomer({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<PotentialCustomerEntity>;
    select?: FindOptionsSelect<PotentialCustomerEntity>;
    relations?: string[];
  }) {
    const solving = await this.potentialCustomerRepo.findOne({
      where,
      select,
      relations,
    });
    return solving;
  }
  async findPotentialCustomer({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<PotentialCustomerEntity>;
    select?: FindOptionsSelect<PotentialCustomerEntity>;
    relations?: FindOptionsRelations<PotentialCustomerEntity>;
  }) {
    const [customers_solving, total] =
      await this.potentialCustomerRepo.findAndCount({
        where,
        select,
        relations,
      });
    return { customers_solving, total };
  }
  async searchEngine(
    tenant_id: string,
    search_with: string,
    column?: string,
    created_sort?: 'ASC' | 'DESC',
    saler_id?: string,
  ) {
    const queryB = this.potentialCustomerRepo
      .createQueryBuilder('cust')
      .where('cust.tenant_id = :tenant_id', { tenant_id })
      .leftJoin('cust.saler', 'saler');
    if (saler_id) {
      queryB.andWhere('saler.id = :saler_id', { saler_id });
    } else {
      queryB.addSelect(['saler.id', 'saler.user_name']);
    }
    const term = `%${search_with}%`;
    if (column) {
      queryB.andWhere(`CAST(${column} AS TEXT) ILIKE :term`, { term });
    } else {
      queryB.andWhere(
        new Brackets((subQb) =>
          subQb
            .where('saler.user_name ILIKE :term', { term })
            .orWhere(`CAST(cust.index AS TEXT) ILIKE :term`, { term })
            .orWhere('cust._name ILIKE :term', { term })
            .orWhere('cust.company ILIKE :term', { term })
            .orWhere('cust.note ILIKE :term', { term }),
        ),
      );
    }
    queryB.orderBy('cust.created_at', created_sort ?? 'DESC');
    const [data, total] = await queryB.getManyAndCount();
    return {
      data,
      total,
    };
  }
}
