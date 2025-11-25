import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UsersDBService } from './DB_Service/users_db.service';
import { RolesModule } from 'src/roles/roles.module';
import { TenantsModule } from 'src/tenants/tenants.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    RolesModule,
    forwardRef(() => TenantsModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersDBService],
  exports: [UsersDBService, UsersService],
})
export class UsersModule {}
