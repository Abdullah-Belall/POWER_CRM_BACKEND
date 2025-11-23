import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsSelect,
  FindOptionsWhere,
  DeepPartial,
  Brackets,
} from 'typeorm';
import { TaskEntity } from '../entities/task.entity';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';
import { Translations } from 'src/utils/base';

@Injectable()
export class TasksDBService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly tasksRepo: Repository<TaskEntity>,
  ) {}
  getTaskRepo() {
    return this.tasksRepo;
  }
  taskQB(alias: string) {
    return this.tasksRepo.createQueryBuilder(alias);
  }
  createTaskInstance(obj: DeepPartial<TaskEntity>) {
    return this.tasksRepo.create(obj);
  }
  async getNextIndex(tenant_id: string) {
    return (await this.tasksRepo.count({ where: { tenant_id } })) + 1;
  }
  async saveTask(lang: LangsEnum, task: TaskEntity) {
    let saved: TaskEntity;
    try {
      saved = await this.tasksRepo.save(task);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(Translations.errorMsg[lang]);
    }
    return saved;
  }
  async findOneTask({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<TaskEntity>;
    select?: FindOptionsSelect<TaskEntity>;
    relations?: string[];
  }) {
    const task = await this.tasksRepo.findOne({
      where,
      select,
      relations,
    });
    return task;
  }
  async findTask({
    where,
    select,
    relations,
  }: {
    where: FindOptionsWhere<TaskEntity>;
    select?: FindOptionsSelect<TaskEntity>;
    relations?: string[];
  }) {
    const [tasks, total] = await this.tasksRepo.findAndCount({
      where,
      select,
      relations,
    });
    return { tasks, total };
  }
  async searchEngine(
    tenant_id: string,
    search_with: string,
    column?: string,
    created_sort?: 'ASC' | 'DESC',
  ) {
    const queryB = this.tasksRepo
      .createQueryBuilder('task')
      .where('task.tenant_id = :tenant_id', { tenant_id });
    const term = `%${search_with}%`;
    if (column) {
      queryB.andWhere(`CAST(${column} AS TEXT) ILIKE :term`, { term });
    } else {
      queryB.andWhere(
        new Brackets((subQb) =>
          subQb
            .where('task.title ILIKE :term', { term })
            .orWhere('task.details ILIKE :term', { term })
            .orWhere('task.location ILIKE :term', { term }),
        ),
      );
    }
    queryB.orderBy('task.created_at', created_sort ?? 'DESC');
    const [data, total] = await queryB.getManyAndCount();
    return {
      data,
      total,
    };
  }
}
