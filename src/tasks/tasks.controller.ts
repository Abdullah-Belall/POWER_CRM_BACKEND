import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Get,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from 'src/users/decorators/user.decorator';
import type { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('create')
  async createTask(
    @User() user: UserTokenInterface,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return await this.tasksService.createTask(user, createTaskDto);
  }

  @Patch(':id')
  async updateTask(
    @User() user: UserTokenInterface,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return await this.tasksService.updateTask(user, id, updateTaskDto);
  }

  @Get()
  async readTasks(@User() user: UserTokenInterface) {
    return await this.tasksService.readTasks(user);
  }
}
