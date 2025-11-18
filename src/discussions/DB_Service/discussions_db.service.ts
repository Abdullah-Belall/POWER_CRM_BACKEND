import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  DeepPartial,
  FindOptionsSelect,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { DiscussionEntity } from '../entities/discussion.entity';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';
import { Translations } from 'src/utils/base';
import { DiscussionStatusEnum } from 'src/utils/types/enums/discussion-status.enum';

@Injectable()
export class DiscussionDBService {
  constructor(
    @InjectRepository(DiscussionEntity)
    private readonly discussionRepo: Repository<DiscussionEntity>,
  ) {}
  getDiscussionRepo() {
    return this.discussionRepo;
  }
  discussionQB(alias: string) {
    return this.discussionRepo.createQueryBuilder(alias);
  }
  createDiscussionInstance(obj: DeepPartial<DiscussionEntity>) {
    return this.discussionRepo.create(obj);
  }
  async getNextIndex(tenant_id: string, customer_id: string) {
    return (
      (await this.discussionRepo.count({
        where: { customer: { id: customer_id }, tenant_id },
      })) + 1
    );
  }
  async saveDiscussion(lang: LangsEnum, discussion: DiscussionEntity) {
    let saved: DiscussionEntity;
    try {
      saved = await this.discussionRepo.save(discussion);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(Translations.errorMsg[lang]);
    }
    return saved;
  }
  async findOneDiscussion({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<DiscussionEntity>;
    select?: FindOptionsSelect<DiscussionEntity>;
    relations?: string[];
  }) {
    const solving = await this.discussionRepo.findOne({
      where,
      select,
      relations,
    });
    return solving;
  }
  async findDiscussion({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<DiscussionEntity>;
    select?: FindOptionsSelect<DiscussionEntity>;
    relations?: string[];
  }) {
    const [discussions, total] = await this.discussionRepo.findAndCount({
      where,
      select,
      relations,
    });
    return { discussions, total };
  }
  async searchEngine(
    tenant_id: string,
    search_with: string,
    column?: string,
    created_sort?: 'ASC' | 'DESC',
    customer_id?: string,
    status?: DiscussionStatusEnum,
  ) {
    const queryB = this.discussionRepo
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
