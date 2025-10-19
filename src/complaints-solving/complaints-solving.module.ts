import { Module } from '@nestjs/common';
import { ComplaintsSolvingService } from './complaints-solving.service';
import { ComplaintsSolvingController } from './complaints-solving.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintsSolvingEntity } from './entities/complaints-solving.entity';
import { ComplaintSolvingDBService } from './DB_Service/complaints-solving_db.service';
import { UsersModule } from 'src/users/users.module';
import { ComplaintsModule } from 'src/complaints/complaints.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ComplaintsSolvingEntity]),
    UsersModule,
    ComplaintsModule,
  ],
  controllers: [ComplaintsSolvingController],
  providers: [ComplaintsSolvingService, ComplaintSolvingDBService],
  exports: [ComplaintSolvingDBService],
})
export class ComplaintsSolvingModule {}
