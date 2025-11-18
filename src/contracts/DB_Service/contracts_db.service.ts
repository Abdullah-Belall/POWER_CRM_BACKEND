import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsSelect,
  FindOptionsWhere,
  DeepPartial,
} from 'typeorm';
import { ContractEntity } from '../entities/contract.entity';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';
import { Translations } from 'src/utils/base';

@Injectable()
export class ContractsDBService {
  constructor(
    @InjectRepository(ContractEntity)
    private readonly contractsRepo: Repository<ContractEntity>,
  ) {}
  getContractRepo() {
    return this.contractsRepo;
  }
  contractQB(alias: string) {
    return this.contractsRepo.createQueryBuilder(alias);
  }
  createContractInstance(obj: DeepPartial<ContractEntity>) {
    return this.contractsRepo.create(obj);
  }
  async getNextIndex(tenant_id: string, customer_id: string) {
    return (
      (await this.contractsRepo.count({
        where: { tenant_id, customer: { id: customer_id } },
      })) + 1
    );
  }
  async saveContract(lang: LangsEnum, contract: ContractEntity) {
    let saved: ContractEntity;
    try {
      saved = await this.contractsRepo.save(contract);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(Translations.errorMsg[lang]);
    }
    return saved;
  }
  async findOneContract({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<ContractEntity>;
    select?: FindOptionsSelect<ContractEntity>;
    relations?: string[];
  }) {
    const contract = await this.contractsRepo.findOne({
      where,
      select,
      relations,
    });
    return contract;
  }
  async findContract({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<ContractEntity>;
    select?: FindOptionsSelect<ContractEntity>;
    relations?: string[];
  }) {
    const [contracts, total] = await this.contractsRepo.findAndCount({
      where,
      select,
      relations,
    });
    return { contracts, total };
  }
}
