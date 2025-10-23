import {
  Controller,
  Post,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Body,
} from '@nestjs/common';
import { ComplaintsSolvingService } from './complaints-solving.service';
import { User } from 'src/users/decorators/user.decorator';
import type { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';
import { SolveComplaintGuard } from './guards/solve.guard';
import { ReferChoiceDto } from './dto/refer-choice.dto';

@Controller('complaints-solving')
export class ComplaintsSolvingController {
  constructor(
    private readonly complaintsSolvingService: ComplaintsSolvingService,
  ) {}
  @Post(':id/start-solving')
  @UseGuards(SolveComplaintGuard)
  async startSolve(
    @User() user: UserTokenInterface,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return await this.complaintsSolvingService.takeComplaint(user, id);
  }
  @Post(':complaintId/refer-to/:supporter_id')
  async referToAnotherSupporter(
    @User() user: UserTokenInterface,
    @Param('complaintId', new ParseUUIDPipe()) complaintId: string,
    @Param('supporter_id', new ParseUUIDPipe()) supporter_id: string,
  ) {
    return await this.complaintsSolvingService.referToAnotherSupporter(
      user,
      supporter_id,
      complaintId,
    );
  }
  @Post(':solvingId/refer-response')
  async referChoice(
    @User() user: UserTokenInterface,
    @Param('solvingId', new ParseUUIDPipe()) solvingId: string,
    @Body() { accept_status }: ReferChoiceDto,
  ) {
    return await this.complaintsSolvingService.referChoice(
      user,
      solvingId,
      accept_status as any,
    );
  }
}
