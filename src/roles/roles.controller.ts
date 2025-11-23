import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Patch,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import type { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';
import { User } from 'src/users/decorators/user.decorator';
import { CreateRoleGuard } from './guards/create.guard';
import { ReadRoleGuard } from './guards/read.guard';
import { ChangeRoleAttribute } from './dto/change-role-attributes.dto';

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
  @Patch(':user_id/add-attribute')
  @UseGuards(CreateRoleGuard)
  async toggleRoleAttribute(
    @User() user: UserTokenInterface,
    @Param('user_id', new ParseUUIDPipe()) user_id: string,
    @Body() { roles }: ChangeRoleAttribute,
  ) {
    return await this.rolesService.toggleRoleAttribute(user, user_id, roles);
  }
  @Patch(':id')
  @UseGuards(CreateRoleGuard)
  async changeRoleAttributes(
    @User() user: UserTokenInterface,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() { roles }: ChangeRoleAttribute,
  ) {
    return await this.rolesService.changeRoleArributes(user, id, roles);
  }
  @Get()
  @UseGuards(ReadRoleGuard)
  async findAllRoles(@User() { tenant_id }: UserTokenInterface) {
    return await this.rolesService.findAllRoles(tenant_id);
  }
  @Get('select-list')
  async rolesSelectList(@User() { tenant_id }: UserTokenInterface) {
    return await this.rolesService.rolesSelectList(tenant_id);
  }
}
