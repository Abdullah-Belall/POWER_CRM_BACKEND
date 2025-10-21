import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import type { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';
import { User } from 'src/users/decorators/user.decorator';
import { CreateRoleGuard } from './guards/create.guard';
import { ReadRoleGuard } from './guards/read.guard';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}
  @Post()
  @UseGuards(CreateRoleGuard)
  async createRole(
    @User() user: UserTokenInterface,
    @Body() createRoleDto: CreateRoleDto,
  ) {
    return await this.rolesService.createRole(user, createRoleDto);
  }
  @Get()
  @UseGuards(ReadRoleGuard)
  async findAllRoles(@User() { tenant_id }: UserTokenInterface) {
    return await this.rolesService.findAllRoles(tenant_id);
  }
  @Get('select-list')
  @UseGuards(CreateRoleGuard)
  async rolesSelectList(@User() { tenant_id }: UserTokenInterface) {
    return await this.rolesService.rolesSelectList(tenant_id);
  }
}
