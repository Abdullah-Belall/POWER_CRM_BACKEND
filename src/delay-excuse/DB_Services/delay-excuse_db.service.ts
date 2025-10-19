import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DeepPartial,
  FindOptionsRelations,
  FindOptionsWhere,
  FindOptionsSelect,
  FindOptionsOrder,
} from 'typeorm';
import { Translations } from 'src/utils/base';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';
import { DelayExcusesEntity } from '../entities/delay-excuse.entity';

@Injectable()
export class DelayExcuseDBService {
  constructor(
    @InjectRepository(DelayExcusesEntity)
    private readonly delayExcusesRepo: Repository<DelayExcusesEntity>,
  ) {}
  getDelayExcusesRepo() {
    return this.delayExcusesRepo;
  }
  createDelayExcusesInstance(obj: DeepPartial<DelayExcusesEntity>) {
    return this.delayExcusesRepo.create(obj);
  }
  async getNextIndex(tenant_id: string, complaint_id: string) {
    return (
      (await this.delayExcusesRepo.count({
        where: { tenant_id, complaint: { id: complaint_id } },
      })) + 1
    );
  }
  async saveDelayExcuses(lang: LangsEnum, DelayExcuses: DelayExcusesEntity) {
    let saved: DelayExcusesEntity;
    try {
      saved = await this.delayExcusesRepo.save(DelayExcuses);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(Translations.errorMsg[lang]);
    }
    return saved;
  }
  async findOneDelayExcuses({
    where,
    select,
    relations,
    order,
  }: {
    where: FindOptionsWhere<DelayExcusesEntity>;
    select?: FindOptionsSelect<DelayExcusesEntity>;
    relations?: string[];
    order?: FindOptionsOrder<DelayExcusesEntity>;
  }) {
    const DelayExcuses = await this.delayExcusesRepo.findOne({
      where,
      select,
      relations,
      order,
    });
    return DelayExcuses;
  }
  async findDelayExcuses({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<DelayExcusesEntity>;
    select?: FindOptionsSelect<DelayExcusesEntity>;
    relations?: FindOptionsRelations<DelayExcusesEntity>;
  }) {
    const [DelayExcuses, total] = await this.delayExcusesRepo.findAndCount({
      where,
      select,
      relations,
    });
    return { DelayExcuses, total };
  }
}
