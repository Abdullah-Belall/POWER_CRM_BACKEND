import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsSelect,
  FindOptionsWhere,
  DeepPartial,
  Brackets,
} from 'typeorm';
import { ServiceEntity } from '../entities/service.entity';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';
import { Translations } from 'src/utils/base';

@Injectable()
export class ServicesDBService {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly servicesRepo: Repository<ServiceEntity>,
  ) {}
  getServiceRepo() {
    return this.servicesRepo;
  }
  serviceQB(alias: string) {
    return this.servicesRepo.createQueryBuilder(alias);
  }
  createServiceInstance(obj: DeepPartial<ServiceEntity>) {
    return this.servicesRepo.create(obj);
  }
  async getNextIndex(tenant_id: string) {
    return (await this.servicesRepo.count({ where: { tenant_id } })) + 1;
  }
  async saveService(lang: LangsEnum, service: ServiceEntity) {
    let saved: ServiceEntity;
    try {
      saved = await this.servicesRepo.save(service);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(Translations.errorMsg[lang]);
    }
    return saved;
  }
  async findOneService({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<ServiceEntity>;
    select?: FindOptionsSelect<ServiceEntity>;
    relations?: string[];
  }) {
    const service = await this.servicesRepo.findOne({
      where,
      select,
      relations,
    });
    return service;
  }
  async findService({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<ServiceEntity>;
    select?: FindOptionsSelect<ServiceEntity>;
    relations?: string[];
  }) {
    const [services, total] = await this.servicesRepo.findAndCount({
      where,
      select,
      relations,
    });
    return { services, total };
  }
  async searchEngine(
    tenant_id: string,
    search_with: string,
    column?: string,
    created_sort?: 'ASC' | 'DESC',
  ) {
    const queryB = this.servicesRepo
      .createQueryBuilder('serv')
      .where('serv.tenant_id = :tenant_id', { tenant_id });
    const term = `%${search_with}%`;
    if (column) {
      queryB.andWhere(`CAST(${column} AS TEXT) ILIKE :term`, { term });
    } else {
      queryB.andWhere(
        new Brackets((subQb) =>
          subQb
            .where('serv.title ILIKE :term', { term })
            .orWhere('serv.desc ILIKE :term', { term }),
        ),
      );
    }
    queryB.orderBy('serv.created_at', created_sort ?? 'DESC');
    const [data, total] = await queryB.getManyAndCount();
    return {
      data,
      total,
    };
  }
}
