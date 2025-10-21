import {
  Controller,
  Post,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ComplaintsSolvingService } from './complaints-solving.service';
import { User } from 'src/users/decorators/user.decorator';
import type { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';
import { SolveComplaintGuard } from './guards/solve.guard';

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
  // @Post(':complaintId/refer-to/supporter_id')
  // async referToAnotherSupporter(
  //   @User() user: UserTokenInterface
  // ) {
  //   return await this.complaintsSolvingService.referToAnotherSupporter(user,)
  // }
}
