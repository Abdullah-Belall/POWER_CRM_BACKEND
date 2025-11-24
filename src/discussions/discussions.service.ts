import { Injectable, NotFoundException } from '@nestjs/common';
import { DiscussionDBService } from './DB_Service/discussions_db.service';
import { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { PotentialCustomersDBService } from 'src/potential-customers/DB_Service/potential-customer-db.dervice';
import { UsersDBService } from 'src/users/DB_Service/users_db.service';
import { PotentialCustomerStatus } from 'src/utils/types/enums/potential-customer.enum';
import { UserEntity } from 'src/users/entities/user.entity';
import { TasksService } from 'src/tasks/tasks.service';
import { PriorityStatusEnum } from 'src/utils/types/enums/complaint-status.enum';
// import { MeetingDBService } from 'src/meeting/DB_Service/meeting-db.service';

@Injectable()
export class DiscussionsService {
  constructor(
    private readonly discussionDBService: DiscussionDBService,
    private readonly customersDBService: PotentialCustomersDBService,
    private readonly usersDBService: UsersDBService,
    private readonly tasksService: TasksService,
  ) {}
  async newDiscussion(
    user: UserTokenInterface,
    {
      customer_id,
      status,
      details,
      meeting,
      meeting_url,
      meeting_employees,
      meeting_date,
    }: CreateDiscussionDto,
  ) {
    const { tenant_id, id, lang } = user;
    const customer = await this.customersDBService.findOnePotentialCustomer({
      where: {
        id: customer_id,
        tenant_id,
      },
    });
    if (!customer) throw new NotFoundException();
    const discussant = await this.usersDBService.findOneUser({
      where: {
        id: id,
        tenant_id,
      },
    });
    if (!discussant) throw new NotFoundException();
    await this.discussionDBService.saveDiscussion(
      lang,
      this.discussionDBService.createDiscussionInstance({
        customer,
        discussant,
        tenant_id,
        details,
        status,
        index: await this.discussionDBService.getNextIndex(
          tenant_id,
          customer_id,
        ),
      }),
    );
    if (meeting) {
      await this.tasksService.createTask(user, {
        title: `${meeting} with ${customer.name}`,
        users: meeting_employees,
        location: meeting_url,
        task_date: meeting_date,
        details: `This task was automatically created when a quote was created ${customer.name}.`,
        priority_status: PriorityStatusEnum.NORMAL,
      });
    }
    if (customer.status === PotentialCustomerStatus.PENDING)
      await this.customersDBService.savePotentialCustomer(lang, {
        ...customer,
        status: PotentialCustomerStatus.DISCUSSION,
      });
    return {
      done: true,
    };
  }
}
