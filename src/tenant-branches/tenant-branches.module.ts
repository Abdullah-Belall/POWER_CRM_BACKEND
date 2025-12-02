import { Module } from '@nestjs/common';
import { TenantBranchesService } from './tenant-branches.service';
import { TenantBranchesController } from './tenant-branches.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantBranchEntity } from './entities/tenant-branch.entity';
import { TenantBranchesDBService } from './DB_Service/tenant-branches-db.dervice';
import { TenantsModule } from 'src/tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([TenantBranchEntity]), TenantsModule],
  controllers: [TenantBranchesController],
  providers: [TenantBranchesService, TenantBranchesDBService],
  exports: [TenantBranchesDBService],
})
export class TenantBranchesModule {}
