import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ComplaintsAssignerService } from './complaints-assigner.service';
import { User } from 'src/users/decorators/user.decorator';
import type { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';
import { AssignSupporterDto } from './dto/assign-supporter.dto';
import { AssignComplaintGuard } from './guards/assign.guard';

@Controller('complaints-assigner')
export class ComplaintsAssignerController {
  constructor(
    private readonly complaintsAssignerService: ComplaintsAssignerService,
  ) {}
  @Post('assign')
  @UseGuards(AssignComplaintGuard)
  async assignSupporter(
    @User() { tenant_id, lang, id }: UserTokenInterface,
    @Body() assignSupporterDto: AssignSupporterDto,
  ) {
    return await this.complaintsAssignerService.assignSupporter(
      tenant_id,
      lang,
      id,
      assignSupporterDto,
    );
  }
}
