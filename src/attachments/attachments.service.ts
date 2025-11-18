import { Injectable } from '@nestjs/common';
import { AttachmentsDBService } from './DB_Service/attachments_db.service';

@Injectable()
export class AttachmentsService {
  constructor(private readonly attachmentsDBService: AttachmentsDBService) {}
}
