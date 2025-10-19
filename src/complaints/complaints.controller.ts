import { Controller, Body, Post, UseGuards } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { User } from 'src/users/decorators/user.decorator';
import type { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';
import { AuthGuard } from 'src/guards/auth.guard';

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
}
