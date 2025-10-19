import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateComplaintsAssignerDto } from './dto/create-complaints-assigner.dto';
import { UpdateComplaintsAssignerDto } from './dto/update-complaints-assigner.dto';
import { ComplaintDBService } from 'src/complaints/DB_Service/complaints_db.service';
import { UsersDBService } from 'src/users/DB_Service/users_db.service';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';
import { ComplaintAssignerDBService } from './DB_Service/complaint-assigner_db.service';
import { Translations } from 'src/utils/base';
import { ComplaintStatusEnum } from 'src/utils/types/enums/complaint-status.enum';
import { UserEntity } from 'src/users/entities/user.entity';
import { ComplaintSolvingDBService } from 'src/complaints-solving/DB_Service/complaints-solving_db.service';
import { SupporterReferAcceptEnum } from 'src/utils/types/enums/supporter-refer-accept.enum';

@Injectable()
export class ComplaintsAssignerService {
  constructor(
    private readonly complaintAssignerDBService: ComplaintAssignerDBService,
    private readonly complaintDBService: ComplaintDBService,
    private readonly complaintSolvingDBService: ComplaintSolvingDBService,
    private readonly usersDBService: UsersDBService,
  ) {}
  async assignSupporter(
    tenant_id: string,
    lang: LangsEnum,
    { manager_id, supporter_id, complaint_id, note, max_time_to_solve }: any,
  ) {
    const complaint = await this.complaintDBService.findOneComplaint({
      where: { id: complaint_id, tenant_id },
    });
    this.notFound(complaint, Translations.complaints.notFound[lang]);
    if (
      complaint?.status !== ComplaintStatusEnum.PENDING &&
      complaint?.status !== ComplaintStatusEnum.SUSPENDED
    ) {
      throw new BadRequestException();
    }
    const supporter = await this.usersDBService.findOneUser({
      where: {
        id: supporter_id,
        tenant_id,
      },
    });
    this.notFound(supporter, Translations.user.notFound[lang]);
    const manager = await this.usersDBService.findOneUser({
      where: {
        id: manager_id,
        tenant_id,
      },
    });
    this.notFound(manager, Translations.user.notFound[lang]);
    const assignation =
      await this.complaintAssignerDBService.saveComplaintsAssigner(
        lang,
        this.complaintAssignerDBService.createComplaintsAssignerInstance({
          tenant_id,
          index: await this.complaintAssignerDBService.getNextIndex(
            tenant_id,
            complaint_id,
          ),
          manager: manager as UserEntity,
          supporter: supporter as UserEntity,
          note,
        }),
      );
    const solving = await this.complaintSolvingDBService.saveComplaintsSolving(
      lang,
      this.complaintSolvingDBService.createComplaintsSolvingInstance({
        tenant_id,
        index: await this.complaintSolvingDBService.getNextIndex(
          tenant_id,
          complaint_id,
        ),
        user: supporter as UserEntity,
        complaint,
        accept_status: SupporterReferAcceptEnum.ACCEPTED,
        choice_taked_at: new Date(),
      }),
    );
    await this.complaintDBService.saveComplaint(lang, {
      ...complaint,
      status: ComplaintStatusEnum.IN_PROGRESS,
      start_solve_at: complaint.start_solve_at ?? new Date(),
      max_time_to_solve: Number(max_time_to_solve),
    });
    return {
      done: true,
      assignation_id: assignation.id,
      solving_id: solving.id,
    };
  }

  private notFound(thing: any, message?: string) {
    if (!thing) throw new NotFoundException(message);
  }
}
