import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksDBService } from './DB_Service/task-db.service';
import { UsersDBService } from 'src/users/DB_Service/users_db.service';
import { UserTokenInterface } from 'src/users/types/interfaces/user-token.interface';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksDBService: TasksDBService,
    private readonly usersDBService: UsersDBService,
  ) {}

  async createTask(
    { tenant_id, lang, id }: UserTokenInterface,
    createTaskDto: CreateTaskDto,
  ) {
    const users = await this.usersDBService
      .usersQB('user')
      .where('user.id IN (:...users)', {
        users: JSON.parse(createTaskDto.users) as string[],
      })
      .getMany();
    await this.tasksDBService.saveTask(
      lang,
      this.tasksDBService.createTaskInstance({
        ...createTaskDto,
        tenant_id,
        creator_id: id,
        users,
      }),
    );
    return {
      done: true,
    };
  }

  async updateTask(
    { tenant_id, lang }: UserTokenInterface,
    id: string,
    updateTaskDto: UpdateTaskDto,
  ) {
    const task = await this.tasksDBService.findOneTask({
      where: {
        id,
        tenant_id,
      },
    });
    if (!task) throw new NotFoundException();
    Object.assign(task, updateTaskDto);
    await this.tasksDBService.saveTask(lang, task);
    return {
      done: true,
    };
  }

  async readTasks({ id, tenant_id }: UserTokenInterface) {
    const [tasks, total] = await this.tasksDBService
      .taskQB('task')
      .leftJoin('task.users', 'users')
      .where('task.tenant_id = :tenant_id', { tenant_id })
      .andWhere('users.id = :id', { id })
      .addSelect([
        'users.id',
        'users.index',
        'users.user_name',
        'users.phone',
        'users.email',
      ])
      .getManyAndCount();

    return {
      tasks,
      total,
    };
  }
}
