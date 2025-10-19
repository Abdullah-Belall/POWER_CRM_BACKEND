import { Module } from '@nestjs/common';
import { ComplaintsAssignerService } from './complaints-assigner.service';
import { ComplaintsAssignerController } from './complaints-assigner.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintsAssignerEntity } from './entities/complaints-assigner.entity';
import { ComplaintAssignerDBService } from './DB_Service/complaint-assigner_db.service';
import { ComplaintsModule } from 'src/complaints/complaints.module';
import { UsersModule } from 'src/users/users.module';
import { ComplaintsSolvingModule } from 'src/complaints-solving/complaints-solving.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ComplaintsAssignerEntity]),
    ComplaintsModule,
    UsersModule,
    ComplaintsSolvingModule,
  ],
  controllers: [ComplaintsAssignerController],
  providers: [ComplaintsAssignerService, ComplaintAssignerDBService],
})
export class ComplaintsAssignerModule {}
