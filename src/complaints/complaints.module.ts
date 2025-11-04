import { Module } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { ComplaintsController } from './complaints.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintEntity } from './entities/complaint.entity';
import { ComplaintDBService } from './DB_Service/complaints_db.service';
import { UsersModule } from 'src/users/users.module';
import { TelegramModule } from 'src/telegram/telegram.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ComplaintEntity]),
    UsersModule,
    TelegramModule,
  ],
  controllers: [ComplaintsController],
  providers: [ComplaintsService, ComplaintDBService],
  exports: [ComplaintDBService],
})
export class ComplaintsModule {}
