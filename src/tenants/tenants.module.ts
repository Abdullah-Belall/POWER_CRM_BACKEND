import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsEntity } from './entities/tenant.entity';
import { TenantDBService } from './DB_Services/tenant_db.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([TenantsEntity]), UsersModule],
  controllers: [TenantsController],
  providers: [TenantsService, TenantDBService],
  exports: [TenantDBService],
})
export class TenantsModule {}
