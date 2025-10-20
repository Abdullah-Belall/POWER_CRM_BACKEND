import {
  Controller,
  Body,
  Post,
  UseGuards,
  Get,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { User } from 'src/users/decorators/user.decorator';
import type { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';
import { AuthGuard } from 'src/guards/auth.guard';
import { FisishComplaintDto } from './dto/finsish-complaint.dto';

@Controller('complaints')
@UseGuards(AuthGuard)
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post('create')
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
  async getClientComplaints(@User() { tenant_id, id }: UserTokenInterface) {
    return await this.complaintsService.findComplaints(tenant_id, {
      client_id: id,
    });
  }

  @Get('managers')
  async getManagersComplaints(@User() { tenant_id }: UserTokenInterface) {
    return await this.complaintsService.findComplaints(tenant_id, {}, true);
  }
  @Get()
  async findSupporterComplaints(@User() { tenant_id, id }: UserTokenInterface) {
    return await this.complaintsService.findSupporterComplaints(tenant_id, id);
  }

  @Post(':id/finish')
  async finishComplaint(
    @User() user: UserTokenInterface,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() { status }: FisishComplaintDto,
  ) {
    return await this.complaintsService.finishComplaint(user, id, status);
  }
  @Get(':id')
  async getComplaint(
    @User() { tenant_id }: UserTokenInterface,
    @Param('id') id: string,
  ) {
    return await this.complaintsService.findOneComplaint(tenant_id, id);
  }
}
