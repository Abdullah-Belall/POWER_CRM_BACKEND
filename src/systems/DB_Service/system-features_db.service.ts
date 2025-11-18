import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsSelect,
  FindOptionsWhere,
  DeepPartial,
} from 'typeorm';
import { SystemFeaturesEntity } from '../entities/system-features.entity';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';
import { Translations } from 'src/utils/base';

@Injectable()
export class SystemFeaturesDBService {
  constructor(
    @InjectRepository(SystemFeaturesEntity)
    private readonly systemFeaturesRepo: Repository<SystemFeaturesEntity>,
  ) {}
  getSystemFeaturesRepo() {
    return this.systemFeaturesRepo;
  }
  systemFeaturesQB(alias: string) {
    return this.systemFeaturesRepo.createQueryBuilder(alias);
  }
  createSystemFeaturesInstance(obj: DeepPartial<SystemFeaturesEntity>) {
    return this.systemFeaturesRepo.create(obj);
  }
  async getNextIndex(tenant_id: string, system_id: string) {
    return (
      (await this.systemFeaturesRepo.count({
        where: { tenant_id, system: { id: system_id } },
      })) + 1
    );
  }
  async saveSystemFeature(lang: LangsEnum, feature: SystemFeaturesEntity) {
    let saved: SystemFeaturesEntity;
    try {
      saved = await this.systemFeaturesRepo.save(feature);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(Translations.errorMsg[lang]);
    }
    return saved;
  }
  async findOneSystemFeature({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<SystemFeaturesEntity>;
    select?: FindOptionsSelect<SystemFeaturesEntity>;
    relations?: string[];
  }) {
    const feature = await this.systemFeaturesRepo.findOne({
      where,
      select,
      relations,
    });
    return feature;
  }
  async findSystemFeature({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<SystemFeaturesEntity>;
    select?: FindOptionsSelect<SystemFeaturesEntity>;
    relations?: string[];
  }) {
    const [features, total] = await this.systemFeaturesRepo.findAndCount({
      where,
      select,
      relations,
    });
    return { features, total };
  }
}
