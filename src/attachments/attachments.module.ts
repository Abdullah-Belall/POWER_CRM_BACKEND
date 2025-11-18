import { Module } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { AttachmentsController } from './attachments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttachmentEntity } from './entities/attachment.entity';
import { AttachmentsDBService } from './DB_Service/attachments_db.service';

@Module({
  imports: [TypeOrmModule.forFeature([AttachmentEntity])],
  controllers: [AttachmentsController],
  providers: [AttachmentsService, AttachmentsDBService],
  exports: [AttachmentsDBService],
})
export class AttachmentsModule {}
