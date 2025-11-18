import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsSelect,
  FindOptionsWhere,
  DeepPartial,
} from 'typeorm';
import { SystemsContractEntity } from '../entities/systems-contract.entity';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';
import { Translations } from 'src/utils/base';

@Injectable()
export class SystemsContractsDBService {
  constructor(
    @InjectRepository(SystemsContractEntity)
    private readonly systemsContractsRepo: Repository<SystemsContractEntity>,
  ) {}
  getSystemsContractsRepo() {
    return this.systemsContractsRepo;
  }
  systemsContractsQB(alias: string) {
    return this.systemsContractsRepo.createQueryBuilder(alias);
  }
  createSystemsContractInstance(obj: DeepPartial<SystemsContractEntity>) {
    return this.systemsContractsRepo.create(obj);
  }
  async getNextIndex(tenant_id: string) {
    return (
      (await this.systemsContractsRepo.count({ where: { tenant_id } })) + 1
    );
  }
  async saveSystemsContract(
    lang: LangsEnum,
    systemsContract: SystemsContractEntity,
  ) {
    let saved: SystemsContractEntity;
    try {
      saved = await this.systemsContractsRepo.save(systemsContract);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(Translations.errorMsg[lang]);
    }
    return saved;
  }
  async findOneSystemsContract({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<SystemsContractEntity>;
    select?: FindOptionsSelect<SystemsContractEntity>;
    relations?: string[];
  }) {
    const systemsContract = await this.systemsContractsRepo.findOne({
      where,
      select,
      relations,
    });
    return systemsContract;
  }
  async findSystemsContract({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<SystemsContractEntity>;
    select?: FindOptionsSelect<SystemsContractEntity>;
    relations?: string[];
  }) {
    const [systemsContracts, total] =
      await this.systemsContractsRepo.findAndCount({
        where,
        select,
        relations,
      });
    return { systemsContracts, total };
  }
}
