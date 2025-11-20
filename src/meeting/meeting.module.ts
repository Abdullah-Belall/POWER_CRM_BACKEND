import { Module } from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { MeetingController } from './meeting.controller';
import { MeetingDBService } from './DB_Service/meeting-db.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeetingEntity } from './entities/meeting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MeetingEntity])],
  controllers: [MeetingController],
  providers: [MeetingService, MeetingDBService],
  exports: [MeetingDBService],
})
export class MeetingModule {}
