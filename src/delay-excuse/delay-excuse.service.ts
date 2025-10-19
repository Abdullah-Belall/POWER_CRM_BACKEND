import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDelayExcuseDto } from './dto/create-delay-excuse.dto';
import { UpdateDelayExcuseDto } from './dto/update-delay-excuse.dto';
import { DelayExcuseDBService } from './DB_Services/delay-excuse_db.service';
import { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';
import { ComplaintDBService } from 'src/complaints/DB_Service/complaints_db.service';
import { Translations } from 'src/utils/base';
import { ComplaintStatusEnum } from 'src/utils/types/enums/complaint-status.enum';
import { SupporterReferAcceptEnum } from 'src/utils/types/enums/supporter-refer-accept.enum';
import { ComplaintEntity } from 'src/complaints/entities/complaint.entity';

@Injectable()
export class DelayExcuseService {
  constructor(
    private readonly delayExcuseDBService: DelayExcuseDBService,
    private readonly complaintDBService: ComplaintDBService,
  ) {}
  async addExcuse(
    { tenant_id, id, lang }: UserTokenInterface,
    complaint_id: string,
    excuse: string,
  ) {
    const complaint = await this.complaintDBService.findOneComplaint({
      where: {
        id: complaint_id,
      },
      relations: ['solving', 'solving.user'],
      select: {
        solving: {
          id: true,
          accept_status: true,
          user: {
            id: true,
          },
        },
      },
    });
    this.notFound(complaint, Translations.complaints.notFound[lang]);
    const supporterSolving = complaint?.solving.filter((e) => e.user.id === id);
    const isCanAdd = supporterSolving?.some(
      (e) => e.accept_status === SupporterReferAcceptEnum.ACCEPTED,
    );
    if (!isCanAdd) throw new BadRequestException();
    const savedExcuse = await this.delayExcuseDBService.saveDelayExcuses(
      lang,
      this.delayExcuseDBService.createDelayExcusesInstance({
        tenant_id,
        index: await this.delayExcuseDBService.getNextIndex(
          tenant_id,
          complaint_id,
        ),
        complaint: complaint as ComplaintEntity,
        user: supporterSolving![0]?.user,
        excuse,
      }),
    );
    return {
      done: true,
      id: savedExcuse.id,
    };
  }
  private notFound(thing: any, message?: string) {
    if (!thing) throw new NotFoundException(message);
  }
}
