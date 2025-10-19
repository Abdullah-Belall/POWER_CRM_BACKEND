import { Module } from '@nestjs/common';
import { DelayExcuseService } from './delay-excuse.service';
import { DelayExcuseController } from './delay-excuse.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DelayExcusesEntity } from './entities/delay-excuse.entity';
import { DelayExcuseDBService } from './DB_Services/delay-excuse_db.service';
import { ComplaintsModule } from 'src/complaints/complaints.module';

@Module({
  imports: [TypeOrmModule.forFeature([DelayExcusesEntity]), ComplaintsModule],
  controllers: [DelayExcuseController],
  providers: [DelayExcuseService, DelayExcuseDBService],
})
export class DelayExcuseModule {}
