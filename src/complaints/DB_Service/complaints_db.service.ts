import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ComplaintEntity } from '../entities/complaint.entity';
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

@Injectable()
export class ComplaintDBService {
  constructor(
    @InjectRepository(ComplaintEntity)
    private readonly complaintRepo: Repository<ComplaintEntity>,
  ) {}
  getComplaintRepo() {
    return this.complaintRepo;
  }
  ComplaintQB(alias: string) {
    return this.complaintRepo.createQueryBuilder(alias);
  }
  createComplaintInstance(obj: DeepPartial<ComplaintEntity>) {
    return this.complaintRepo.create(obj);
  }
  async getNextIndex(tenant_id: string) {
    return (await this.complaintRepo.count({ where: { tenant_id } })) + 1;
  }
  async saveComplaint(lang: LangsEnum, complaint: ComplaintEntity) {
    let saved: ComplaintEntity;
    try {
      saved = await this.complaintRepo.save(complaint);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(Translations.errorMsg[lang]);
    }
    return saved;
  }
  async findOneComplaint({
    where,
    select,
    relations,
    order,
  }: {
    where: FindOptionsWhere<ComplaintEntity>;
    select?: FindOptionsSelect<ComplaintEntity>;
    relations?: string[];
    order?: FindOptionsOrder<ComplaintEntity>;
  }) {
    const complaint = await this.complaintRepo.findOne({
      where,
      select,
      relations,
      order,
    });
    return complaint;
  }
  async findComplaints({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<ComplaintEntity>;
    select?: FindOptionsSelect<ComplaintEntity>;
    relations?: FindOptionsRelations<ComplaintEntity>;
  }) {
    const [complaints, total] = await this.complaintRepo.findAndCount({
      where,
      select,
      relations,
    });
    return { complaints, total };
  }
}
