import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { UsersModule } from 'src/users/users.module';
import { RolesModule } from 'src/roles/roles.module';
import { ComplaintsModule } from 'src/complaints/complaints.module';

@Module({
  imports: [UsersModule, RolesModule, ComplaintsModule],
  controllers: [CommonController],
  providers: [CommonService],
})
export class CommonModule {}
