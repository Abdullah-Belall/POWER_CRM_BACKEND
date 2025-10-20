import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './decorators/user.decorator';
import type { UserTokenInterface } from './types/interfaces/user-token.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async profile(@User() { id, tenant_id }: UserTokenInterface) {
    return await this.usersService.profile(id, tenant_id);
  }

  @Get('supporters')
  async findSupporter(@User() { tenant_id }: UserTokenInterface) {
    return await this.usersService.findSupporter(tenant_id);
  }
}
