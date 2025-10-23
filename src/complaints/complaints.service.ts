import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { ComplaintDBService } from './DB_Service/complaints_db.service';
import { UsersDBService } from 'src/users/DB_Service/users_db.service';
import { Translations } from 'src/utils/base';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';
import { ComplaintsFilterInterface } from 'src/users/types/interfaces/complaints-filter.interface';
import { Brackets } from 'typeorm';
import { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';
import { ComplaintStatusEnum } from 'src/utils/types/enums/complaint-status.enum';
import { SupporterReferAcceptEnum } from 'src/utils/types/enums/supporter-refer-accept.enum';

@Injectable()
export class ComplaintsService {
  constructor(
    private readonly complaintDBService: ComplaintDBService,
    private readonly usersDBService: UsersDBService,
  ) {}
  async createComplaint(
    tenant_id: string,
    client_id: string,
    lang: LangsEnum,
    createComplaintDto: CreateComplaintDto,
  ) {
    const client = await this.usersDBService.findOneUser({
      where: {
        id: client_id,
      },
    });
    if (!client) throw new NotFoundException(Translations.user.notFound[lang]);
    const complaintInstance = this.complaintDBService.createComplaintInstance({
      tenant_id,
      index: await this.complaintDBService.getNextIndex(tenant_id),
      user: client,
      ...createComplaintDto,
    });
    const complaint = await this.complaintDBService.saveComplaint(
      lang,
      complaintInstance,
    );
    return {
      done: true,
      id: complaint.id,
    };
  }
  async findComplaints(
    tenant_id: string,
    {
      client_id,
      have_max_time_to_solve,
      status,
      accept_excuse,
      created_from,
      created_to,
    }: ComplaintsFilterInterface,
    managers: boolean = false,
  ) {
    const qb = this.complaintDBService
      .getComplaintRepo()
      ?.createQueryBuilder('complaint')
      .leftJoin('complaint.user', 'user')
      .where('complaint.tenant_id = :tenant_id', { tenant_id });
    if (client_id) {
      qb.andWhere('user.id = :client_id', { client_id });
    }
    if (managers) {
      qb.addSelect(['user.id', 'user.user_name']);
    }
    const have_max_time_to_solve_fixed =
      typeof have_max_time_to_solve === 'boolean'
        ? have_max_time_to_solve
        : have_max_time_to_solve === 'true'
          ? true
          : have_max_time_to_solve === 'false'
            ? false
            : undefined;
    if (have_max_time_to_solve_fixed !== undefined) {
      qb.andWhere('complaint.have_max_time_to_solve = :value', {
        value: have_max_time_to_solve_fixed,
      });
    }
    if (status) {
      const status_arr = JSON.parse(status);
      qb.andWhere(
        new Brackets((qb2) => {
          qb2.where('complaint.status = :status', { status: status_arr[0] });
          status_arr.splice(0, 1);
          for (const status of status_arr) {
            qb2.orWhere('complaint.status = :status', { status });
          }
        }),
      );
    }
    const accept_excuse_fixed =
      typeof accept_excuse === 'boolean'
        ? accept_excuse
        : accept_excuse === 'true'
          ? true
          : accept_excuse === 'false'
            ? false
            : accept_excuse === 'null'
              ? null
              : undefined;
    if (accept_excuse_fixed === null) {
      qb.andWhere('complaint.accept_excuse IS NULL');
    } else if (accept_excuse_fixed !== undefined) {
      qb.andWhere('complaint.accept_excuse = :value', {
        value: accept_excuse_fixed,
      });
    }
    if (created_from) {
      qb.andWhere('complaint.created_at >= :created_from', {
        created_from: new Date(created_from),
      });
    }
    if (created_to) {
      qb.andWhere('complaint.created_at <= :created_to', {
        created_to: new Date(created_to),
      });
    }
    qb.orderBy('complaint.created_at', 'ASC');
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
      .leftJoinAndSelect('complaint.user', 'client')
      .leftJoinAndSelect('complaint.solving', 'solving')
      .leftJoinAndSelect('solving.user', 'supporter')
      .where('complaint.tenant_id = :tenant_id', { tenant_id })
      .andWhere('complaint.status = :status', {
        status: ComplaintStatusEnum.IN_PROGRESS,
      })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('MAX(s2.index)')
          .from('complaint_solving', 's2')
          .where('s2.complaintId = complaint.id')
          .getQuery();
        return `
          solving.index = ${subQuery}
          AND supporter.id = :supporterId
          AND solving.accept_status = :accepted
        `;
      })
      .setParameter('supporterId', supporterId)
      .setParameter('accepted', SupporterReferAcceptEnum.ACCEPTED)
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
      .leftJoinAndSelect('complaint.user', 'client')
      .leftJoinAndSelect('complaint.solving', 'solving')
      .leftJoinAndSelect('solving.user', 'supporter')
      .where('supporter.id = :supporterId', { supporterId })
      .andWhere('complaint.tenant_id = :tenant_id', { tenant_id })
      .andWhere('complaint.status = :status', {
        status: ComplaintStatusEnum.IN_PROGRESS,
      })
      .andWhere('solving.accept_status = :accept_status', {
        accept_status: SupporterReferAcceptEnum.PENDING,
      })
      .orderBy('complaint.created_at', 'DESC');

    const [complaints, total] = await qb.getManyAndCount();

    complaints.forEach((complaint) => {
      if (complaint.solving && complaint.solving.length > 0) {
        complaint.solving.sort((a, b) => b.index - a.index);
      }
    });

    const filteredComplaints = complaints.filter(
      (complaint) => complaint.solving[0]?.user?.id === supporterId,
    );

    return { complaints: filteredComplaints, total };
  }
  async findOneComplaint(tenant_id: string, complaint_id: string) {
    const complaint = await this.complaintDBService
      .ComplaintQB('complaint')
      .where('complaint.id = :complaint_id', { complaint_id })
      .andWhere('complaint.tenant_id = :tenant_id', { tenant_id })
      .leftJoinAndSelect('complaint.user', 'user')
      .leftJoinAndSelect('complaint.solving', 'solving')
      .leftJoinAndSelect('complaint.assignations', 'assignations')
      .leftJoinAndSelect('solving.user', 'supporter')
      .getOne();

    if (!complaint) throw new NotFoundException();

    // ترتيب solving records حسب index
    if (complaint.solving && complaint.solving.length > 0) {
      complaint.solving.sort((a, b) => b.index - a.index);
    }

    return complaint;
  }
  // async setMaxTimeForComplaint(
  //   tenant_id: string,
  //   lang: LangsEnum,
  //   complaint_id: string,
  //   max_time_to_solve: number,
  // ) {
  //   const complaint = await this.complaintDBService.findOneComplaint({
  //     where: { id: complaint_id, tenant_id },
  //   });
  //   if (!complaint)
  //     throw new NotFoundException(Translations.complaints.notFound[lang]);
  //   await this.complaintDBService.saveComplaint(lang, {
  //     ...complaint,
  //     max_time_to_solve: Number(max_time_to_solve),
  //   });
  //   return { done: true };
  // }
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
        user: {
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
  async finishComplaint(
    { tenant_id, id, lang }: UserTokenInterface,
    complaint_id: string,
    status: ComplaintStatusEnum.COMPLETED | ComplaintStatusEnum.CANCELLED,
  ) {
    const complaint = await this.complaintDBService
      .ComplaintQB('complaint')
      .leftJoinAndSelect('complaint.solving', 'solving')
      .leftJoinAndSelect('solving.user', 'supporter')
      .where('complaint.id = :id', { id: complaint_id })
      .andWhere('complaint.tenant_id = :tenant_id', { tenant_id })
      .getOne();

    this.notFound(complaint, Translations.complaints.notFound[lang]);

    // ترتيب solving records حسب index
    if (complaint && complaint.solving && complaint.solving.length > 0) {
      complaint.solving.sort((a, b) => b.index - a.index);
    }

    if (complaint?.solving[0]?.user?.id !== id)
      throw new BadRequestException('fixid 3dn');
    if (
      complaint?.solving[0].accept_status !== SupporterReferAcceptEnum.ACCEPTED
    )
      throw new BadRequestException('2');
    if (complaint?.status !== ComplaintStatusEnum.IN_PROGRESS)
      throw new BadRequestException('3');
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

  async test() {
    return await this.complaintDBService
      .ComplaintQB('complaint')
      .leftJoinAndSelect('complaint.delay_excuses', 'delay_excuses')
      .leftJoinAndSelect('complaint.user', 'user')
      .leftJoinAndSelect('complaint.solving', 'solving')
      .leftJoinAndSelect('solving.user', 'solving_user')
      .leftJoinAndSelect('complaint.assignations', 'assignations')
      .leftJoinAndSelect('assignations.supporter', 'supporter')
      .leftJoinAndSelect('assignations.manager', 'manager')
      .getMany();
  }
}
