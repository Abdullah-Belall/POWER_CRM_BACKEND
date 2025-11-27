import {
  Controller,
  Body,
  Post,
  UseGuards,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { User } from 'src/users/decorators/user.decorator';
import type { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';
import { AuthGuard } from 'src/guards/auth.guard';
import { FisishComplaintDto } from './dto/finsish-complaint.dto';
import { CreateComplaintGuard } from './guards/create.guard';
import { ReadComplaintGuard } from './guards/read.guard';
import { UpdateComplaintGuard } from './guards/update.guard';
import { ChangePrioritySatutsComplaintDto } from './dto/change-priority-status.dto';
import { ComplaintStatusEnum } from 'src/utils/types/enums/complaint-status.enum';

@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post('create')
  @UseGuards(CreateComplaintGuard)
  async createComplaint(
    @User() { tenant_id, id, lang }: UserTokenInterface,
    @Body() createComplaintDto: CreateComplaintDto,
  ) {
    return await this.complaintsService.createComplaint(
      tenant_id,
      id,
      lang,
      createComplaintDto,
    );
  }

  @Get('clients')
  @UseGuards(AuthGuard)
  async getClientComplaints(@User() { tenant_id, id }: UserTokenInterface) {
    return await this.complaintsService.findComplaints(tenant_id, {
      client_id: id,
    });
  }

  @Get('client-overview-page')
  @UseGuards(AuthGuard)
  async clientOverviewPage(@User() { tenant_id, id }: UserTokenInterface) {
    return await this.complaintsService.clientOverviewPage(tenant_id, id);
  }

  @Get('analytics')
  @UseGuards(AuthGuard)
  async getUserAnalytics(@User() { tenant_id, id, role }: UserTokenInterface) {
    return await this.complaintsService.getUserAnalytics(
      id,
      tenant_id,
      role.roles,
    );
  }

  @Get('managers')
  @UseGuards(ReadComplaintGuard)
  async getManagersComplaints(
    @User() { tenant_id }: UserTokenInterface,
    @Query('client_id') client_id: string,
    @Query('status') status: ComplaintStatusEnum,
    @Query('created_from') created_from: Date,
    @Query('created_to') created_to: Date,
    @Query('ordered_by') ordered_by: 'DESC' | 'ASC',
  ) {
    return await this.complaintsService.findComplaints(
      tenant_id,
      {
        client_id:
          client_id && client_id !== 'undefined' ? client_id : undefined,
        status: status && (status as any) !== 'undefined' ? status : undefined,
        created_from:
          created_from && (created_from as any) !== 'undefined'
            ? created_from
            : undefined,
        created_to:
          created_to && (created_to as any) !== 'undefined'
            ? created_to
            : undefined,
        ordered_by:
          ordered_by && (ordered_by as any) !== 'undefined'
            ? ordered_by
            : undefined,
      },
      true,
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  async findSupporterComplaints(@User() { tenant_id, id }: UserTokenInterface) {
    return await this.complaintsService.findSupporterComplaints(tenant_id, id);
  }
  @Get('supporter-notifi')
  @UseGuards(AuthGuard)
  async findSupporterComplaintsRefrence(
    @User() { tenant_id, id }: UserTokenInterface,
  ) {
    return await this.complaintsService.findSupporterComplaintsRefrence(
      tenant_id,
      id,
    );
  }

  @Post(':id/finish')
  @UseGuards(UpdateComplaintGuard)
  async finishComplaint(
    @User() user: UserTokenInterface,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() { status }: FisishComplaintDto,
  ) {
    return await this.complaintsService.finishComplaint(user, id, status);
  }

  @Patch(':id/change-priority-status')
  @UseGuards(UpdateComplaintGuard)
  async changePriorityStatus(
    @User() user: UserTokenInterface,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() { priority_status }: ChangePrioritySatutsComplaintDto,
  ) {
    return await this.complaintsService.changeComplaintPriorityStatus(
      user,
      id,
      priority_status,
    );
  }

  @Get('test')
  async test() {
    return await this.complaintsService.test();
  }
  @Get(':complaintId/supporter')
  async getSupporterComplaint(
    @User() { tenant_id, id }: UserTokenInterface,
    @Param('complaintId', new ParseUUIDPipe()) complaintId: string,
  ) {
    return await this.complaintsService.findOneComplaint(
      tenant_id,
      complaintId,
      id,
    );
  }
  @Get(':id')
  @UseGuards(ReadComplaintGuard)
  async getComplaint(
    @User() { tenant_id }: UserTokenInterface,
    @Param('id') id: string,
  ) {
    return await this.complaintsService.findOneComplaint(tenant_id, id);
  }
}
