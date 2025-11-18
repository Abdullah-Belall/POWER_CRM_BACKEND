import { Injectable, NotFoundException } from '@nestjs/common';
import { DiscussionDBService } from './DB_Service/discussions_db.service';
import { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { PotentialCustomersDBService } from 'src/potential-customers/DB_Service/potential-customer-db.dervice';
import { UsersDBService } from 'src/users/DB_Service/users_db.service';
import { PotentialCustomerStatus } from 'src/utils/types/enums/potential-customer.enum';

@Injectable()
export class DiscussionsService {
  constructor(
    private readonly discussionDBService: DiscussionDBService,
    private readonly customersDBService: PotentialCustomersDBService,
    private readonly usersDBService: UsersDBService,
  ) {}
  async newDiscussion(
    { tenant_id, id, lang }: UserTokenInterface,
    { customer_id, status, details }: CreateDiscussionDto,
  ) {
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
