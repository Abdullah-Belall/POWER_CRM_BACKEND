import {
  Controller,
  Body,
  Post,
  UseGuards,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
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
  async getManagersComplaints(@User() { tenant_id }: UserTokenInterface) {
    return await this.complaintsService.findComplaints(tenant_id, {}, true);
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
