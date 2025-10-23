import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './decorators/user.decorator';
import type { UserTokenInterface } from './types/interfaces/user-token.interface';
import { AuthGuard } from 'src/guards/auth.guard';
import { ReadUserGuard } from './guards/read.guard';
import { CreateUserGuard } from './guards/create.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(AuthGuard)
  async profile(@User() { id, tenant_id }: UserTokenInterface) {
    return await this.usersService.profile(id, tenant_id);
  }

  @Get()
  @UseGuards(AuthGuard)
  async findUsers(
    @User() { tenant_id }: UserTokenInterface,
    @Query('role') role_id: string,
  ) {
    return await this.usersService.findAllUsers(tenant_id, role_id);
  }
  @Post('create')
  @UseGuards(CreateUserGuard)
  async createUser(
    @User() user: UserTokenInterface,
    @Body() createUserDto: CreateUserDto,
  ) {
    return await this.usersService.createUser(user, createUserDto);
  }
}
