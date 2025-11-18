import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DiscussionsService } from './discussions.service';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from 'src/users/decorators/user.decorator';
import type { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';

@Controller('discussions')
export class DiscussionsController {
  constructor(private readonly discussionsService: DiscussionsService) {}
  @Post()
  @UseGuards(AuthGuard)
  async newDiscussion(
    @User() user: UserTokenInterface,
    @Body() createDiscussionDto: CreateDiscussionDto,
  ) {
    return await this.discussionsService.newDiscussion(
      user,
      createDiscussionDto,
    );
  }
}
