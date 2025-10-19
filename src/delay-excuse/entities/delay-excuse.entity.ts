import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { ComplaintEntity } from 'src/complaints/entities/complaint.entity';

@Entity({ name: 'delay_excuse' })
export class DelayExcusesEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'uuid' })
  tenant_id: string;
  @Column({ type: 'int' })
  index: number;
  @ManyToOne(() => ComplaintEntity, (comp) => comp.delay_excuses)
  complaint: ComplaintEntity;
  //* SUPPORTER
  @ManyToOne(() => UserEntity, (user) => user.solve_delay_excuses)
  user: UserEntity;
  @Column()
  excuse: string;
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
