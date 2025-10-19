import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DeepPartial,
  FindOptionsWhere,
  FindOptionsSelect,
} from 'typeorm';
import { Translations } from 'src/utils/base';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';
import { ComplaintsAssignerEntity } from '../entities/complaints-assigner.entity';

@Injectable()
export class ComplaintAssignerDBService {
  constructor(
    @InjectRepository(ComplaintsAssignerEntity)
    private readonly complaintsAssignerRepo: Repository<ComplaintsAssignerEntity>,
  ) {}
  getComplaintsAssignerRepo() {
    return this.complaintsAssignerRepo;
  }
  createComplaintsAssignerInstance(obj: DeepPartial<ComplaintsAssignerEntity>) {
    return this.complaintsAssignerRepo.create(obj);
  }
  async getNextIndex(tenant_id: string, complaint_id: string) {
    return (
      (await this.complaintsAssignerRepo.count({
        where: { tenant_id, complaint: { id: complaint_id } },
      })) + 1
    );
  }
  async saveComplaintsAssigner(
    lang: LangsEnum,
    complaintAssigner: ComplaintsAssignerEntity,
  ) {
    let saved: ComplaintsAssignerEntity;
    try {
      saved = await this.complaintsAssignerRepo.save(complaintAssigner);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(Translations.errorMsg[lang]);
    }
    return saved;
  }
  async findOneComplaintsAssigner({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<ComplaintsAssignerEntity>;
    select?: FindOptionsSelect<ComplaintsAssignerEntity>;
    relations?: string[];
  }) {
    const complaint = await this.complaintsAssignerRepo.findOne({
      where,
      select,
      relations,
    });
    return complaint;
  }
}
