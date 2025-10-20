import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ComplaintsSolvingService } from './complaints-solving.service';
import { CreateComplaintsSolvingDto } from './dto/create-complaints-solving.dto';
import { UpdateComplaintsSolvingDto } from './dto/update-complaints-solving.dto';
import { User } from 'src/users/decorators/user.decorator';
import type { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';

@Controller('complaints-solving')
export class ComplaintsSolvingController {
  constructor(
    private readonly complaintsSolvingService: ComplaintsSolvingService,
  ) {}
  @Post(':id/start-solving')
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
