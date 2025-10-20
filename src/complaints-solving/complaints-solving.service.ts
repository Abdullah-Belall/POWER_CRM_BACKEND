import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateComplaintsSolvingDto } from './dto/create-complaints-solving.dto';
import { UpdateComplaintsSolvingDto } from './dto/update-complaints-solving.dto';
import { ComplaintSolvingDBService } from './DB_Service/complaints-solving_db.service';
import { UsersDBService } from 'src/users/DB_Service/users_db.service';
import { ComplaintDBService } from 'src/complaints/DB_Service/complaints_db.service';
import { Translations } from 'src/utils/base';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';
import { ComplaintStatusEnum } from 'src/utils/types/enums/complaint-status.enum';
import { SupporterReferAcceptEnum } from 'src/utils/types/enums/supporter-refer-accept.enum';
import { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';
import { UserEntity } from 'src/users/entities/user.entity';
import { ComplaintEntity } from 'src/complaints/entities/complaint.entity';
import { ComplaintsSolvingEntity } from './entities/complaints-solving.entity';

@Injectable()
export class ComplaintsSolvingService {
  constructor(
    private readonly solvingDBService: ComplaintSolvingDBService,
    private readonly complaintDBService: ComplaintDBService,
    private readonly userDBService: UsersDBService,
  ) {}
  async takeComplaint(
    { tenant_id, lang, id }: UserTokenInterface,
    complaint_id: string,
  ) {
    const complaint = await this.complaintDBService.findOneComplaint({
      where: { id: complaint_id },
    });
    if (!complaint)
      throw new NotFoundException(Translations.complaints.notFound[lang]);
    if (
      complaint.status !== ComplaintStatusEnum.PENDING &&
      complaint.status !== ComplaintStatusEnum.SUSPENDED
    )
      throw new BadRequestException();
    const manager = await this.userDBService.findOneUser({
      where: {
        id,
        tenant_id,
      },
    });
    if (!manager) {
      throw new NotFoundException(Translations.user.notFound[lang]);
    }
    const solvingInstance =
      this.solvingDBService.createComplaintsSolvingInstance({
        tenant_id,
        index: await this.solvingDBService.getNextIndex(
          tenant_id,
          complaint_id,
        ),
        user: manager,
        complaint,
        accept_status: SupporterReferAcceptEnum.ACCEPTED,
        choice_taked_at: new Date(),
      });
    const solvingSaved = await this.solvingDBService.saveComplaintsSolving(
      lang,
      solvingInstance,
    );
    await this.complaintDBService.saveComplaint(lang, {
      ...complaint,
      start_solve_at: new Date(),
      status: ComplaintStatusEnum.IN_PROGRESS,
    });
    return {
      done: true,
      solving: {
        id: solvingSaved.id,
        index: solvingSaved.index,
      },
    };
  }
  async referToAnotherSupporter(
    { tenant_id, id, lang }: UserTokenInterface,
    { refer_to_id, complaint_id }: any,
  ) {
    const complaint = await this.complaintDBService
      .ComplaintQB('complaint')
      .leftJoin('complaint.solving', 'solving')
      .addSelect(['solving.id', 'solving.index'])
      .where('complaint.id = :id', { id: complaint_id })
      .andWhere('complaint.tenant_id = :tenant_id', { tenant_id })
      .orderBy('solving.created_at', 'DESC')
      .getOne();
    this.notFound(complaint, Translations.complaints.notFound[lang]);
    if (complaint?.status !== ComplaintStatusEnum.IN_PROGRESS)
      throw new BadRequestException();
    if (complaint?.solving[0].user.id !== id) throw new BadRequestException();
    if (
      complaint?.solving[0].accept_status !== SupporterReferAcceptEnum.ACCEPTED
    )
      throw new BadRequestException();
    const newSupporter = await this.userDBService.findOneUser({
      where: {
        id: refer_to_id,
      },
    });
    await this.solvingDBService.saveComplaintsSolving(
      lang,
      this.solvingDBService.createComplaintsSolvingInstance({
        tenant_id,
        index: await this.solvingDBService.getNextIndex(
          tenant_id,
          complaint_id,
        ),
        user: newSupporter as UserEntity,
        complaint,
      }),
    );
    return {
      done: true,
    };
  }
  async referChoice(
    { tenant_id, lang, id }: UserTokenInterface,
    solving_id: string,
    accept_status:
      | SupporterReferAcceptEnum.ACCEPTED
      | SupporterReferAcceptEnum.DECLINED,
  ) {
    const solving = await this.solvingDBService.findOneComplaintSolving({
      where: {
        id: solving_id,
        tenant_id,
        user: { id },
      },
      relations: ['complaint'],
    });
    this.notFound(solving, Translations.referance.notFound[lang]);
    if (solving?.accept_status !== SupporterReferAcceptEnum.PENDING)
      throw new BadRequestException();
    solving!.accept_status = accept_status;
    solving!.choice_taked_at = new Date();
    if (accept_status === SupporterReferAcceptEnum.DECLINED) {
      await this.complaintDBService.saveComplaint(lang, {
        ...solving?.complaint,
        status: ComplaintStatusEnum.SUSPENDED,
      } as ComplaintEntity);
    }
    return {
      done: true,
    };
  }
  // Make it after 4 min
  async autoDecline() {
    const solving: any = await this.solvingDBService
      .complaintsSolvingQB('solve')
      .leftJoin('solve.complaint', 'complaint')
      .addSelect(['complaint.id', 'complaint.status'])
      .where('solve.accept_status = :status', {
        status: SupporterReferAcceptEnum.PENDING,
      })
      .andWhere('solve.created_at < :deadline', {
        deadline: new Date(Date.now() - 5 * 60 * 1000),
      })
      .getMany();
    const updatedSolving: any = [];
    const updatedComplaints: any = [];
    for (const solve of solving) {
      updatedComplaints.push({
        ...solve.complaint,
        status: ComplaintStatusEnum.SUSPENDED,
      });
      delete solve.complaint;
      updatedSolving.push({
        ...solve,
        accept_status: SupporterReferAcceptEnum.AUTO_DECLINED,
        choice_taked_at: new Date(),
      });
    }
    await this.complaintDBService.saveComplaint(
      LangsEnum.EN,
      updatedComplaints,
    );
    await this.solvingDBService.saveComplaintsSolving(
      LangsEnum.EN,
      updatedSolving,
    );
  }
  private notFound(thing: any, message?: string) {
    if (!thing) throw new NotFoundException(message);
  }
}
