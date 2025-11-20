import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MeetingEntity } from '../entities/meeting.entity';
import {
  Brackets,
  DeepPartial,
  FindOptionsSelect,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';
import { Translations } from 'src/utils/base';
import { MeetingEnum } from 'src/utils/types/enums/meeting-enum';

@Injectable()
export class MeetingDBService {
  constructor(
    @InjectRepository(MeetingEntity)
    private readonly meetingRepo: Repository<MeetingEntity>,
  ) {}
  getMeetingRepo() {
    return this.meetingRepo;
  }
  meetingQB(alias: string) {
    return this.meetingRepo.createQueryBuilder(alias);
  }
  createMeetingInstance(obj: DeepPartial<MeetingEntity>) {
    return this.meetingRepo.create(obj);
  }
  async getNextIndex(tenant_id: string, discussion_id: string) {
    return (
      (await this.meetingRepo.count({
        where: { discussion: { id: discussion_id }, tenant_id },
      })) + 1
    );
  }
  async saveMeeting(lang: LangsEnum, meeting: MeetingEntity) {
    let saved: MeetingEntity;
    try {
      saved = await this.meetingRepo.save(meeting);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(Translations.errorMsg[lang]);
    }
    return saved;
  }
  async findOneMeeting({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<MeetingEntity>;
    select?: FindOptionsSelect<MeetingEntity>;
    relations?: string[];
  }) {
    const meeting = await this.meetingRepo.findOne({
      where,
      select,
      relations,
    });
    return meeting;
  }
  async findMeeting({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<MeetingEntity>;
    select?: FindOptionsSelect<MeetingEntity>;
    relations?: string[];
  }) {
    const [meetings, total] = await this.meetingRepo.findAndCount({
      where,
      select,
      relations,
    });
    return { meetings, total };
  }
  async searchEngine(
    tenant_id: string,
    search_with: string,
    column?: string,
    created_sort?: 'ASC' | 'DESC',
    customer_id?: string,
    status?: MeetingEnum,
  ) {
    const queryB = this.meetingRepo
      .createQueryBuilder('disc')
      .where('disc.tenant_id = :tenant_id', { tenant_id })
      .leftJoin('disc.customer', 'customer');
    if (customer_id) {
      queryB.andWhere('customer.id = :customer_id', { customer_id });
    }
    if (status) {
      queryB.andWhere('disc.status = :status', { status });
    }
    const term = `%${search_with}%`;
    if (column) {
      queryB.andWhere(`CAST(${column} AS TEXT) ILIKE :term`, { term });
    } else {
      queryB.andWhere(
        new Brackets((subQb) =>
          subQb
            .where('disc.ar_customer_name ILIKE :term', { term })
            .orWhere('disc.details ILIKE :term', { term }),
        ),
      );
    }
    queryB.orderBy('customer.created_at', created_sort ?? 'DESC');
    const [data, total] = await queryB.getManyAndCount();
    return {
      data,
      total,
    };
  }
}
