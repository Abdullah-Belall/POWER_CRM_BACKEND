import { ComplaintStatusEnum } from 'src/utils/types/enums/complaint-status.enum';
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
  //* CLIENT
  @ManyToOne(() => UserEntity, (user) => user.complaints)
  user: UserEntity;
  @OneToMany(() => ComplaintsSolvingEntity, (solve) => solve.complaint, {
    cascade: true,
  })
  solving: ComplaintsSolvingEntity[];
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
  @Column({ type: 'enum', enum: ScreenViewerEnum })
  screen_viewer: ScreenViewerEnum;
  @Column()
  screen_viewer_id: string;
  @Column()
  screen_viewer_password: string;
  @Column({ type: 'int' })
  max_time_to_solve: number;
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
  @Column({ type: 'boolean', nullable: true })
  accept_excuse: boolean | null;
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
