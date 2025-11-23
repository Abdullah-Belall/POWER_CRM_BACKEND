import { UserEntity } from 'src/users/entities/user.entity';
import { PriorityStatusEnum } from 'src/utils/types/enums/complaint-status.enum';
import { TaskStatusEnum } from 'src/utils/types/enums/task-status.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'tasks' })
export class TaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'uuid' })
  tenant_id: string;
  @Column({ type: 'uuid' })
  creator_id: string;
  @ManyToMany(() => UserEntity, (user) => user.tasks)
  users: UserEntity[];
  @Column()
  title: string;
  @Column({ nullable: true })
  details: string;
  @Column()
  location: string;
  @Column({
    type: 'enum',
    enum: PriorityStatusEnum,
    default: PriorityStatusEnum.NORMAL,
  })
  priority_status: PriorityStatusEnum;
  @Column({
    type: 'enum',
    enum: TaskStatusEnum,
    default: TaskStatusEnum.PENDING,
  })
  status: TaskStatusEnum;
  @Column({ type: 'timestamptz' })
  task_date: Date;
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
