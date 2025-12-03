import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TenantBranchesService } from './tenant-branches.service';
import { CreateTenantBranchDto } from './dto/create-tenant-branch.dto';
import { UpdateTenantBranchDto } from './dto/update-tenant-branch.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from 'src/users/decorators/user.decorator';
import type { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';

@Controller('tenant-branches')
export class TenantBranchesController {
  constructor(private readonly tenantBranchesService: TenantBranchesService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createTenantBranch(
    @User() user: UserTokenInterface,
    @Body() createTenantBranchDto: CreateTenantBranchDto,
  ) {
    return await this.tenantBranchesService.createTenantBranch(
      user,
      createTenantBranchDto,
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async updateTenantBranch(
    @User() user: UserTokenInterface,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateTenantBranchDto: UpdateTenantBranchDto,
  ) {
    return await this.tenantBranchesService.updateTenantBranch(
      user,
      id,
      updateTenantBranchDto,
    );
  }

  @Get(':id/get-one/:tenant_id')
  async getOneTenantBranche(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('tenant_id', new ParseUUIDPipe()) tenant_id: string,
  ) {
    return await this.tenantBranchesService.getOneTenantBranche(id, tenant_id);
  }

  @Get()
  @UseGuards(AuthGuard)
  async getClientBranches(@User() { tenant_id }: UserTokenInterface) {
    return await this.tenantBranchesService.getTenantBranches(tenant_id);
  }

  @Get(':tenant_id')
  @UseGuards(AuthGuard)
  async getTenantBranches(
    @Param('tenant_id', new ParseUUIDPipe()) tenant_id: string,
  ) {
    return await this.tenantBranchesService.getTenantBranches(tenant_id);
  }
}
