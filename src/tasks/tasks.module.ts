import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from './entities/task.entity';
import { TasksDBService } from './DB_Service/task-db.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity]), UsersModule],
  controllers: [TasksController],
  providers: [TasksService, TasksDBService],
  exports: [TasksDBService],
})
export class TasksModule {}
