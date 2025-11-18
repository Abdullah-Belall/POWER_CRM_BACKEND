import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsSelect,
  FindOptionsWhere,
  DeepPartial,
} from 'typeorm';
import { AttachmentEntity } from '../entities/attachment.entity';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';
import { Translations } from 'src/utils/base';

@Injectable()
export class AttachmentsDBService {
  constructor(
    @InjectRepository(AttachmentEntity)
    private readonly attachmentsRepo: Repository<AttachmentEntity>,
  ) {}
  getAttachmentRepo() {
    return this.attachmentsRepo;
  }
  attachmentQB(alias: string) {
    return this.attachmentsRepo.createQueryBuilder(alias);
  }
  createAttachmentInstance(obj: DeepPartial<AttachmentEntity>) {
    return this.attachmentsRepo.create(obj);
  }
  async getNextIndex(tenant_id: string) {
    return (await this.attachmentsRepo.count({ where: { tenant_id } })) + 1;
  }
  async saveAttachment(lang: LangsEnum, attachment: AttachmentEntity) {
    let saved: AttachmentEntity;
    try {
      saved = await this.attachmentsRepo.save(attachment);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(Translations.errorMsg[lang]);
    }
    return saved;
  }
  async findOneAttachment({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<AttachmentEntity>;
    select?: FindOptionsSelect<AttachmentEntity>;
    relations?: string[];
  }) {
    const attachment = await this.attachmentsRepo.findOne({
      where,
      select,
      relations,
    });
    return attachment;
  }
  async findAttachment({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<AttachmentEntity>;
    select?: FindOptionsSelect<AttachmentEntity>;
    relations?: string[];
  }) {
    const [attachments, total] = await this.attachmentsRepo.findAndCount({
      where,
      select,
      relations,
    });
    return { attachments, total };
  }
}
