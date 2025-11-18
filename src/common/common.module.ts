import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { UsersModule } from 'src/users/users.module';
import { RolesModule } from 'src/roles/roles.module';
import { ComplaintsModule } from 'src/complaints/complaints.module';
import { PotentialCustomersModule } from 'src/potential-customers/potential-customers.module';
import { DiscussionsModule } from 'src/discussions/discussions.module';
import { SystemsModule } from 'src/systems/systems.module';
import { ServicesModule } from 'src/services/services.module';

@Module({
  imports: [
    UsersModule,
    RolesModule,
    ComplaintsModule,
    PotentialCustomersModule,
    DiscussionsModule,
    SystemsModule,
    ServicesModule,
  ],
  controllers: [CommonController],
  providers: [CommonService],
})
export class CommonModule {}
