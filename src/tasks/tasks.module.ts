import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from './entities/task.entity';
import { TasksDBService } from './DB_Service/task-db.service';
import { UsersModule } from 'src/users/users.module';
import { TelegramModule } from 'src/telegram/telegram.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskEntity]),
    UsersModule,
    TelegramModule,
  ],
  controllers: [TasksController],
  providers: [TasksService, TasksDBService],
  exports: [TasksDBService, TasksService],
})
export class TasksModule {}
