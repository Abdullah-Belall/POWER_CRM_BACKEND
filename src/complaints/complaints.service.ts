import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { ComplaintDBService } from './DB_Service/complaints_db.service';
import { UsersDBService } from 'src/users/DB_Service/users_db.service';
import { Translations } from 'src/utils/base';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';
import { ComplaintsFilterInterface } from 'src/users/types/interfaces/complaints-filter.interface';
import { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';
import {
  PriorityStatusEnum,
  ComplaintStatusEnum,
} from 'src/utils/types/enums/complaint-status.enum';
import { SupporterReferAcceptEnum } from 'src/utils/types/enums/supporter-refer-accept.enum';
import { TelegramService } from 'src/telegram/telegram.service';

@Injectable()
export class ComplaintsService {
  constructor(
    private readonly complaintDBService: ComplaintDBService,
    private readonly usersDBService: UsersDBService,
    private readonly telegramService: TelegramService,
  ) {}
  async createComplaint(
    tenant_id: string,
    presenter_id: string,
    lang: LangsEnum,
    createComplaintDto: CreateComplaintDto,
  ) {
    const presenter = await this.usersDBService.findOneUser({
      where: {
        id: presenter_id,
      },
      relations: ['role'],
    });
    if (!presenter)
      throw new NotFoundException(Translations.user.notFound[lang]);
    if (presenter?.role?.roles?.includes('create-complaint-forbidden'))
      throw new ForbiddenException(
        'يرجي العلم انه قد تم حظركم من تسجيل شكاوي في الوقت الحالي. يرجي التواصل مع ادارة الدعم الفني علي الرقم 201033008808',
      );
    const client = await this.usersDBService.findOneUser({
      where: {
        id: createComplaintDto.client_id,
      },
    });
    if (!client) throw new NotFoundException(Translations.user.notFound[lang]);
    const complaintInstance = this.complaintDBService.createComplaintInstance({
      tenant_id,
      index: await this.complaintDBService.getNextIndex(tenant_id),
      client,
      presenter,
      ...createComplaintDto,
    });
    const complaint = await this.complaintDBService.saveComplaint(
      lang,
      complaintInstance,
    );
    // const [users] = await this.usersDBService.findUsers({
    //   where: {
    //     tenant_id,
    //   },
    //   select: {
    //     id: true,
    //     chat_id: {
    //       id: true,
    //       chat_id: true,
    //     },
    //   },
    // });
    await this.telegramService.sendComplaint(
      complaint,
      ['8260659694', '7186823447', '5726273594'],
      // (users as UserEntity[]).map((e) => e.chat_id?.chat_id),
    );
    return {
      done: true,
      id: complaint.id,
    };
  }
  async findComplaints(
    tenant_id: string,
    filter?: ComplaintsFilterInterface,
    managers: boolean = false,
  ) {
    const qb = this.complaintDBService
      .getComplaintRepo()
      ?.createQueryBuilder('complaint')
      .leftJoin('complaint.client', 'client')
      .leftJoin('complaint.solving', 'solving')
      .leftJoin('solving.supporter', 'supporter')
      .addSelect([
        'solving.id',
        'solving.index',
        'solving.created_at',
        'supporter.id',
        'supporter.user_name',
        'supporter.index',
      ])
      .where('complaint.tenant_id = :tenant_id', { tenant_id });
    if (filter?.client_id) {
      qb.andWhere('client.id = :client_id', { client_id: filter.client_id });
    }
    if (managers) {
      qb.addSelect(['client.id', 'client.user_name', 'client.index']);
    }
    const have_max_time_to_solve_fixed =
      typeof filter?.have_max_time_to_solve === 'boolean'
        ? filter.have_max_time_to_solve
        : filter?.have_max_time_to_solve === 'true'
          ? true
          : filter?.have_max_time_to_solve === 'false'
            ? false
            : undefined;
    if (have_max_time_to_solve_fixed !== undefined) {
      qb.andWhere('complaint.have_max_time_to_solve = :value', {
        value: have_max_time_to_solve_fixed,
      });
    }
    if (filter?.status) {
      qb.where('complaint.status = :status', { status });
    }
    const accept_excuse_fixed =
      typeof filter?.accept_excuse === 'boolean'
        ? filter.accept_excuse
        : filter?.accept_excuse === 'true'
          ? true
          : filter?.accept_excuse === 'false'
            ? false
            : filter?.accept_excuse === 'null'
              ? null
              : undefined;
    if (accept_excuse_fixed === null) {
      qb.andWhere('complaint.accept_excuse IS NULL');
    } else if (accept_excuse_fixed !== undefined) {
      qb.andWhere('complaint.accept_excuse = :value', {
        value: accept_excuse_fixed,
      });
    }
    if (filter?.created_from) {
      qb.andWhere('complaint.created_at >= :created_from', {
        created_from: new Date(filter.created_from),
      });
    }
    if (filter?.created_to) {
      qb.andWhere('complaint.created_at <= :created_to', {
        created_to: new Date(filter.created_to),
      });
    }
    qb.orderBy('complaint.created_at', filter?.ordered_by || 'DESC').addOrderBy(
      'solving.created_at',
      filter?.ordered_by || 'DESC',
    );
    const [complaints, total] = await qb.getManyAndCount();
    return {
      complaints,
      total,
    };
  }
  async findSupporterComplaints(tenant_id: string, supporterId: string) {
    const qb = this.complaintDBService
      .getComplaintRepo()
      .createQueryBuilder('complaint')
      .leftJoinAndSelect('complaint.client', 'client')
      .where('complaint.tenant_id = :tenant_id', { tenant_id })
      .andWhere('complaint.status = :status', {
        status: ComplaintStatusEnum.IN_PROGRESS,
      })
      .andWhere('complaint.curr_supporter_id = :supporter_id', {
        supporter_id: supporterId,
      })
      .andWhere('complaint.refere_pause = :val', {
        val: false,
      })
      .orderBy('complaint.created_at', 'DESC');

    const [complaints, total] = await qb.getManyAndCount();
    return { complaints, total };
  }
  async findSupporterComplaintsRefrence(
    tenant_id: string,
    supporterId: string,
  ) {
    const qb = this.complaintDBService
      .getComplaintRepo()
      .createQueryBuilder('complaint')
      .leftJoinAndSelect('complaint.client', 'client')
      .leftJoinAndSelect('complaint.solving', 'solving')
      .leftJoinAndSelect('solving.supporter', 'supporter')
      .where('complaint.tenant_id = :tenant_id', { tenant_id })
      .andWhere('complaint.status = :status', {
        status: ComplaintStatusEnum.IN_PROGRESS,
      })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('DISTINCT solving2.complaintId')
          .from('complaint_solving', 'solving2')
          .leftJoin('solving2.supporter', 'supporter2')
          .where('supporter2.id = :supporterId', { supporterId })
          .andWhere('solving2.accept_status = :accept_status', {
            accept_status: SupporterReferAcceptEnum.PENDING,
          })
          .getQuery();
        return `complaint.id IN ${subQuery}`;
      })
      .orderBy('complaint.created_at', 'DESC');

    const [complaints, total] = await qb.getManyAndCount();

    complaints.forEach((complaint) => {
      if (complaint.solving && complaint.solving.length > 0) {
        complaint.solving.sort((a, b) => b.index - a.index);
      }
    });

    return { complaints, total };
  }
  async findOneComplaint(
    tenant_id: string,
    complaint_id: string,
    supporter_id?: string,
  ) {
    const qb = this.complaintDBService
      .ComplaintQB('complaint')
      .where('complaint.id = :complaint_id', { complaint_id })
      .andWhere('complaint.tenant_id = :tenant_id', { tenant_id })
      .leftJoinAndSelect('complaint.client', 'user')
      .leftJoinAndSelect('complaint.solving', 'solving')
      .orderBy('solving.index', 'DESC')
      .leftJoinAndSelect('complaint.assignations', 'assignations')
      .leftJoinAndSelect('solving.supporter', 'supporter');

    const complaint = await qb.getOne();
    if (!complaint) throw new NotFoundException();
    if (supporter_id && complaint.solving[0].supporter.id !== supporter_id) {
      throw new ForbiddenException();
    }

    if (complaint.solving && complaint.solving.length > 0) {
      complaint.solving.sort((a, b) => b.index - a.index);
    }

    return complaint;
  }
  async clientCancelComplaints(
    tenant_id: string,
    client_id: string,
    lang: LangsEnum,
    complaint_id: string,
  ) {
    const complaint = await this.complaintDBService.findOneComplaint({
      where: {
        id: complaint_id,
        tenant_id,
        client: {
          id: client_id,
        },
      },
    });
    if (!complaint)
      throw new NotFoundException(Translations.complaints.notFound[lang]);
    if (complaint.status !== ComplaintStatusEnum.PENDING)
      throw new BadRequestException();
    complaint.status = ComplaintStatusEnum.CLIENT_CANCELLED;
    await this.complaintDBService.saveComplaint(lang, complaint);
    return {
      done: true,
    };
  }
  async changeComplaintPriorityStatus(
    { tenant_id, lang }: UserTokenInterface,
    id: string,
    priority_status: PriorityStatusEnum,
  ) {
    const complaint = await this.complaintDBService.findOneComplaint({
      where: {
        tenant_id,
        id,
      },
    });
    if (!complaint) {
      throw new NotFoundException();
    }
    if (
      complaint.status === ComplaintStatusEnum.CANCELLED ||
      complaint.status === ComplaintStatusEnum.COMPLETED
    ) {
      throw new BadRequestException();
    }
    complaint.priority_status = priority_status;
    await this.complaintDBService.saveComplaint(lang, complaint);
    return {
      done: true,
    };
  }
  async finishComplaint(
    { tenant_id, id, lang }: UserTokenInterface,
    complaint_id: string,
    status: ComplaintStatusEnum.COMPLETED | ComplaintStatusEnum.CANCELLED,
  ) {
    const complaint = await this.complaintDBService
      .ComplaintQB('complaint')
      .leftJoinAndSelect('complaint.solving', 'solving')
      .where('complaint.id = :id', { id: complaint_id })
      .andWhere('complaint.tenant_id = :tenant_id', { tenant_id })
      .andWhere('complaint.curr_supporter_id = :supporter_id', {
        supporter_id: id,
      })
      .getOne();
    if (!complaint) {
      throw new NotFoundException(Translations.complaints.notFound[lang]);
    }
    complaint.end_solve_at = new Date();
    complaint.status = status;
    await this.complaintDBService.saveComplaint(lang, complaint);
    return {
      done: true,
    };
  }
  async managerExcuseResponse(
    { tenant_id, lang }: UserTokenInterface,
    complaint_id: string,
    response: Boolean,
  ) {
    const complaint = await this.complaintDBService.findOneComplaint({
      where: {
        id: complaint_id,
        tenant_id,
      },
    });
    this.notFound(complaint, Translations.complaints.notFound[lang]);
    await this.complaintDBService.saveComplaint(
      lang,
      this.complaintDBService.createComplaintInstance({
        ...complaint,
        accept_excuse: response as boolean,
      }),
    );
  }
  private notFound(thing: any, message?: string) {
    if (!thing) throw new NotFoundException(message);
  }

  async getUserAnalytics(id: string, tenant_id: string, roles: string[]) {
    let totalClientComplaints: number = 0;
    let totalClientDoneComplaints: number = 0;
    let totalClientPendingComplaints: number = 0;
    let totalClientInProgressComplaints: number = 0;
    if (roles.includes('create-complaint')) {
      totalClientComplaints = await this.complaintDBService
        .ComplaintQB('complaint')
        .leftJoin('complaint.client', 'client')
        .where('complaint.tenant_id = :tenant_id', { tenant_id })
        .andWhere('client.id = :id', { id })
        .getCount();
      totalClientPendingComplaints = await this.complaintDBService
        .ComplaintQB('complaint')
        .leftJoin('complaint.client', 'client')
        .where('complaint.tenant_id = :tenant_id', { tenant_id })
        .andWhere('client.id = :id', { id })
        .andWhere('complaint.status = :status', {
          status: ComplaintStatusEnum.PENDING,
        })
        .getCount();
      totalClientDoneComplaints = await this.complaintDBService
        .ComplaintQB('complaint')
        .leftJoin('complaint.client', 'client')
        .where('complaint.tenant_id = :tenant_id', { tenant_id })
        .andWhere('client.id = :id', { id })
        .andWhere('complaint.status IN (:...statuses)', {
          statuses: [
            ComplaintStatusEnum.COMPLETED,
            ComplaintStatusEnum.CANCELLED,
            ComplaintStatusEnum.CLIENT_CANCELLED,
          ],
        })
        .getCount();
      totalClientInProgressComplaints = await this.complaintDBService
        .ComplaintQB('complaint')
        .leftJoin('complaint.client', 'client')
        .where('complaint.tenant_id = :tenant_id', { tenant_id })
        .andWhere('client.id = :id', { id })
        .andWhere('complaint.status IN (:...statuses)', {
          statuses: [
            ComplaintStatusEnum.IN_PROGRESS,
            ComplaintStatusEnum.SUSPENDED,
          ],
        })
        .getCount();
    }
    let totalSupporterComplaints: number = 0;
    let totalSupporterDoneComplaints: number = 0;
    let totalSupporterOpenedComplaints: number = 0;
    let totalSupporterHighPriorityComplaints: number = 0;
    if (roles.includes('complaint-assignable')) {
      totalSupporterComplaints = await this.complaintDBService
        .ComplaintQB('complaint')
        .leftJoin('complaint.solving', 'solving')
        .leftJoin('solving.supporter', 'supporter')
        .where('complaint.tenant_id = :tenant_id', { tenant_id })
        .andWhere('supporter.id = :id', { id })
        .getCount();
      totalSupporterDoneComplaints = await this.complaintDBService
        .ComplaintQB('complaint')
        .leftJoin('complaint.solving', 'solving')
        .leftJoin('solving.supporter', 'supporter')
        .where('complaint.tenant_id = :tenant_id', { tenant_id })
        .andWhere('complaint.status IN (:...statuses)', {
          statuses: [
            ComplaintStatusEnum.COMPLETED,
            ComplaintStatusEnum.CANCELLED,
          ],
        })
        .andWhere((qb) => {
          const subQuery = qb
            .subQuery()
            .select('MAX(bigtable.index)')
            .from('complaint_solving', 'bigtable')
            .where('bigtable.complaintId = complaint.id')
            .getQuery();
          return `solving.index = ${subQuery}`;
        })
        .andWhere('supporter.id = :supporterId', { supporterId: id })
        .getCount();
      totalSupporterOpenedComplaints = await this.complaintDBService
        .ComplaintQB('complaint')
        .leftJoin('complaint.solving', 'solving')
        .leftJoin('solving.supporter', 'supporter')
        .where('complaint.tenant_id = :tenant_id', { tenant_id })
        .andWhere('complaint.status IN (:...statuses)', {
          statuses: [ComplaintStatusEnum.IN_PROGRESS],
        })
        .andWhere((qb) => {
          const subQuery = qb
            .subQuery()
            .select('MAX(bigtable.index)')
            .from('complaint_solving', 'bigtable')
            .where('bigtable.complaintId = complaint.id')
            .getQuery();
          return `solving.index = ${subQuery}`;
        })
        .andWhere('supporter.id = :supporterId', { supporterId: id })
        .getCount();
      totalSupporterHighPriorityComplaints = await this.complaintDBService
        .ComplaintQB('complaint')
        .leftJoin('complaint.solving', 'solving')
        .leftJoin('solving.supporter', 'supporter')
        .where('complaint.tenant_id = :tenant_id', { tenant_id })
        .andWhere('complaint.priority_status = :priority_status', {
          priority_status: PriorityStatusEnum.HIGH,
        })
        .andWhere('complaint.status IN (:...statuses)', {
          statuses: [ComplaintStatusEnum.IN_PROGRESS],
        })
        .andWhere((qb) => {
          const subQuery = qb
            .subQuery()
            .select('MAX(bigtable.index)')
            .from('complaint_solving', 'bigtable')
            .where('bigtable.complaintId = complaint.id')
            .getQuery();
          return `solving.index = ${subQuery}`;
        })
        .andWhere('supporter.id = :supporterId', { supporterId: id })
        .getCount();
    }
    let totalManagerComplaints: number = 0;
    let totalManagerDoneComplaints: number = 0;
    let totalManagerOpenedComplaints: number = 0;
    let totalManagerHighPriorityComplaints: number = 0;
    if (roles.includes('read-complaint')) {
      totalManagerComplaints = await this.complaintDBService
        .ComplaintQB('complaint')
        .where('complaint.tenant_id = :tenant_id', { tenant_id })
        .getCount();
      totalManagerDoneComplaints = await this.complaintDBService
        .ComplaintQB('complaint')
        .where('complaint.tenant_id = :tenant_id', { tenant_id })
        .andWhere('complaint.status IN (:...statuses)', {
          statuses: [
            ComplaintStatusEnum.COMPLETED,
            ComplaintStatusEnum.CANCELLED,
            ComplaintStatusEnum.CLIENT_CANCELLED,
          ],
        })
        .getCount();
      totalManagerOpenedComplaints = await this.complaintDBService
        .ComplaintQB('complaint')
        .where('complaint.tenant_id = :tenant_id', { tenant_id })
        .andWhere('complaint.status IN (:...statuses)', {
          statuses: [
            ComplaintStatusEnum.IN_PROGRESS,
            ComplaintStatusEnum.PENDING,
            ComplaintStatusEnum.SUSPENDED,
          ],
        })
        .getCount();
      totalManagerHighPriorityComplaints = await this.complaintDBService
        .ComplaintQB('complaint')
        .where('complaint.tenant_id = :tenant_id', { tenant_id })
        .andWhere('complaint.priority_status = :priority_status', {
          priority_status: PriorityStatusEnum.HIGH,
        })
        .getCount();
    }

    return {
      done: true,
      totalClientComplaints,
      totalClientDoneComplaints,
      totalClientPendingComplaints,
      totalClientInProgressComplaints,
      totalSupporterComplaints,
      totalSupporterDoneComplaints,
      totalSupporterOpenedComplaints,
      totalSupporterHighPriorityComplaints,
      totalManagerComplaints,
      totalManagerDoneComplaints,
      totalManagerOpenedComplaints,
      totalManagerHighPriorityComplaints,
    };
  }

  async test() {
    return await this.complaintDBService
      .ComplaintQB('complaint')
      .leftJoinAndSelect('complaint.solving', 'solving')
      .leftJoinAndSelect('solving.supporter', 'supporter')
      .where('complaint.tenant_id = :tenant_id', {
        tenant_id: '9d036356-cfde-46be-a2df-efe921119caf',
      })
      .andWhere('complaint.status IN (:...statuses)', {
        statuses: [
          ComplaintStatusEnum.COMPLETED,
          ComplaintStatusEnum.CANCELLED,
        ],
      })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('MAX(s2.index)')
          .from('complaint_solving', 's2')
          .where('s2.complaintId = complaint.id')
          .getQuery();
        return `solving.index = ${subQuery}`;
      })
      .andWhere('supporter.id = :id', {
        id: '72c0967d-a1c1-4056-95a8-f928a5309a60',
      })
      .getMany();
  }

  async getMonthlyComplaints(tenant_id: string, id: string, month: number) {
    const start_date = new Date(new Date().getFullYear(), month, 1);
    const end_date = new Date(new Date().getFullYear(), month + 1, 0);
    const complaints_count = await this.complaintDBService
      .ComplaintQB('complaint')
      .where('complaint.tenant_id = :tenant_id', { tenant_id })
      .leftJoin('complaint.client', 'client')
      .andWhere('client.id = :id', { id })
      .andWhere('complaint.created_at >= :start_date', { start_date })
      .andWhere('complaint.created_at <= :end_date', { end_date })
      .getCount();
    return { complaints_count, month };
  }

  async clientOverviewPage(tenant_id: string, id: string) {
    const total_complaints = await this.complaintDBService
      .ComplaintQB('complaint')
      .where('complaint.tenant_id = :tenant_id', { tenant_id })
      .leftJoin('complaint.client', 'client')
      .andWhere('client.id = :id', { id })
      .getCount();
    const total_completed_complaints = await this.complaintDBService
      .ComplaintQB('complaint')
      .where('complaint.tenant_id = :tenant_id', { tenant_id })
      .leftJoin('complaint.client', 'client')
      .andWhere('client.id = :id', { id })
      .andWhere('complaint.status IN (:...statuses)', {
        statuses: [
          ComplaintStatusEnum.COMPLETED,
          ComplaintStatusEnum.CANCELLED,
          ComplaintStatusEnum.CLIENT_CANCELLED,
        ],
      })
      .getCount();
    const monthly_complaints_graph = await Promise.all(
      Array.from({ length: 12 }, (_, month) =>
        this.getMonthlyComplaints(tenant_id, id, month),
      ),
    );
    const complaints =
      (
        await this.findComplaints(tenant_id, { client_id: id })
      )?.complaints?.slice(0, 6) || [];
    return {
      done: true,
      total_complaints,
      total_completed_complaints,
      monthly_complaints_graph,
      complaints,
    };
  }
}
