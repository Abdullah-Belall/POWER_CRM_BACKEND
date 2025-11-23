import {
  PriorityStatusEnum,
  ComplaintStatusEnum,
} from 'src/utils/types/enums/complaint-status.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { ComplaintsSolvingEntity } from 'src/complaints-solving/entities/complaints-solving.entity';
import { ComplaintsAssignerEntity } from 'src/complaints-assigner/entities/complaints-assigner.entity';
import { DelayExcusesEntity } from 'src/delay-excuse/entities/delay-excuse.entity';
import { ScreenViewerEnum } from 'src/utils/types/enums/screen-viewer.enum';

@Entity({ name: 'complaints' })
export class ComplaintEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'uuid' })
  tenant_id: string;
  @Column({ type: 'int' })
  index: number;
  @OneToMany(() => DelayExcusesEntity, (delay) => delay.complaint, {
    cascade: true,
  })
  delay_excuses: DelayExcusesEntity[];
  @ManyToOne(() => UserEntity, (user) => user.presenter_complaints)
  presenter: UserEntity;
  @ManyToOne(() => UserEntity, (user) => user.complaints)
  client: UserEntity;
  @OneToMany(() => ComplaintsSolvingEntity, (solve) => solve.complaint, {
    cascade: true,
  })
  solving: ComplaintsSolvingEntity[];
  @Column({ type: 'uuid', nullable: true })
  curr_supporter_id: string;
  @Column({ type: 'boolean', default: false })
  refere_pause: boolean;
  @OneToMany(() => ComplaintsAssignerEntity, (assign) => assign.complaint, {
    cascade: true,
  })
  assignations: ComplaintsAssignerEntity[];
  @Column()
  full_name: string;
  @Column()
  phone: string;
  @Column()
  title: string;
  @Column()
  details: string;
  @Column({ nullable: true })
  image1: string;
  @Column({ nullable: true })
  image2: string;
  @Column({ type: 'enum', enum: ScreenViewerEnum })
  screen_viewer: ScreenViewerEnum;
  @Column()
  screen_viewer_id: string;
  @Column({ nullable: true })
  screen_viewer_password: string;
  @Column({ type: 'enum', enum: ScreenViewerEnum, nullable: true })
  server_viewer: ScreenViewerEnum;
  @Column({ nullable: true })
  server_viewer_id: string;
  @Column({ nullable: true })
  server_viewer_password: string;
  @Column({ type: 'timestamptz', nullable: true })
  intervention_date: Date | null;
  @Column({ type: 'int', nullable: true })
  max_time_to_solve: number | null;
  @Column({ type: 'timestamptz', nullable: true })
  start_solve_at: Date | null;
  @Column({ type: 'timestamptz', nullable: true })
  end_solve_at: Date | null;
  @Column({
    type: 'enum',
    enum: ComplaintStatusEnum,
    default: ComplaintStatusEnum.PENDING,
  })
  status: ComplaintStatusEnum;
  @Column({
    type: 'enum',
    enum: PriorityStatusEnum,
    default: PriorityStatusEnum.NORMAL,
  })
  priority_status: PriorityStatusEnum;
  @Column({ type: 'boolean', nullable: true })
  accept_excuse: boolean | null;
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
