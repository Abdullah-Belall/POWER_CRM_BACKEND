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
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { User } from 'src/users/decorators/user.decorator';
import type { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}
  @Get()
  async getTenants() {
    return await this.tenantsService.getTenants();
  }
  @Post()
  async createTenant(
    @User() { lang }: UserTokenInterface,
    @Body() createTenantDto: CreateTenantDto,
  ) {
    return await this.tenantsService.createTenant(lang, createTenantDto);
  }
  @Patch(':id')
  async updateTenant(
    @User() { lang }: UserTokenInterface,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    return await this.tenantsService.updateTenant(lang, id, updateTenantDto);
  }
}
