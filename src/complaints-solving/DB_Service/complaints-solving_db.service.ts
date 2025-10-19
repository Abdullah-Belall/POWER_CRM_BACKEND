import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DeepPartial,
  FindOptionsRelations,
  FindOptionsWhere,
  FindOptionsSelect,
} from 'typeorm';
import { Translations } from 'src/utils/base';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';
import { ComplaintsSolvingEntity } from '../entities/complaints-solving.entity';

@Injectable()
export class ComplaintSolvingDBService {
  constructor(
    @InjectRepository(ComplaintsSolvingEntity)
    private readonly ComplaintsSolvingRepo: Repository<ComplaintsSolvingEntity>,
  ) {}
  getComplaintsSolvingRepo() {
    return this.ComplaintsSolvingRepo;
  }
  complaintsSolvingQB(alias: string) {
    return this.ComplaintsSolvingRepo.createQueryBuilder(alias);
  }
  createComplaintsSolvingInstance(obj: DeepPartial<ComplaintsSolvingEntity>) {
    return this.ComplaintsSolvingRepo.create(obj);
  }
  async getNextIndex(tenant_id: string, complaint_id: string) {
    return (
      (await this.ComplaintsSolvingRepo.count({
        where: { complaint: { id: complaint_id }, tenant_id },
      })) + 1
    );
  }
  async saveComplaintsSolving(
    lang: LangsEnum,
    complaint: ComplaintsSolvingEntity,
  ) {
    let saved: ComplaintsSolvingEntity;
    try {
      saved = await this.ComplaintsSolvingRepo.save(complaint);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(Translations.errorMsg[lang]);
    }
    return saved;
  }
  async findOneComplaintSolving({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<ComplaintsSolvingEntity>;
    select?: FindOptionsSelect<ComplaintsSolvingEntity>;
    relations?: string[];
  }) {
    const solving = await this.ComplaintsSolvingRepo.findOne({
      where,
      select,
      relations,
    });
    return solving;
  }
  async findComplaintsSolving({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<ComplaintsSolvingEntity>;
    select?: FindOptionsSelect<ComplaintsSolvingEntity>;
    relations?: FindOptionsRelations<ComplaintsSolvingEntity>;
  }) {
    const [complaints_solving, total] =
      await this.ComplaintsSolvingRepo.findAndCount({
        where,
        select,
        relations,
      });
    return { complaints_solving, total };
  }
}
