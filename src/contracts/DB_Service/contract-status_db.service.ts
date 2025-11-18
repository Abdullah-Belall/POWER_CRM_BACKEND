import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsSelect,
  FindOptionsWhere,
  DeepPartial,
} from 'typeorm';
import { ContractStatusEntity } from '../entities/contract-status.entity';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';
import { Translations } from 'src/utils/base';

@Injectable()
export class ContractStatusDBService {
  constructor(
    @InjectRepository(ContractStatusEntity)
    private readonly contractStatusRepo: Repository<ContractStatusEntity>,
  ) {}
  getContractStatusRepo() {
    return this.contractStatusRepo;
  }
  contractStatusQB(alias: string) {
    return this.contractStatusRepo.createQueryBuilder(alias);
  }
  createContractStatusInstance(obj: DeepPartial<ContractStatusEntity>) {
    return this.contractStatusRepo.create(obj);
  }
  async getNextIndex(tenant_id: string, contract_id: string) {
    return (
      (await this.contractStatusRepo.count({
        where: { tenant_id, contract: { id: contract_id } },
      })) + 1
    );
  }
  async saveContractStatus(lang: LangsEnum, status: ContractStatusEntity) {
    let saved: ContractStatusEntity;
    try {
      saved = await this.contractStatusRepo.save(status);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(Translations.errorMsg[lang]);
    }
    return saved;
  }
  async findOneContractStatus({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<ContractStatusEntity>;
    select?: FindOptionsSelect<ContractStatusEntity>;
    relations?: string[];
  }) {
    const status = await this.contractStatusRepo.findOne({
      where,
      select,
      relations,
    });
    return status;
  }
  async findContractStatus({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<ContractStatusEntity>;
    select?: FindOptionsSelect<ContractStatusEntity>;
    relations?: string[];
  }) {
    const [statuses, total] = await this.contractStatusRepo.findAndCount({
      where,
      select,
      relations,
    });
    return { statuses, total };
  }
}
