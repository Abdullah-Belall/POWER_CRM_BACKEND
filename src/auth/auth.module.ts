import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { TenantsModule } from 'src/tenants/tenants.module';
import { RolesModule } from 'src/roles/roles.module';

@Module({
  imports: [UsersModule, TenantsModule, RolesModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
