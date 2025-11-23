import { ComplaintEntity } from 'src/complaints/entities/complaint.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'complaints_assigner' })
export class ComplaintsAssignerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'uuid' })
  tenant_id: string;
  @Column({ type: 'int' })
  index: number;
  @ManyToOne(() => UserEntity, (user) => user.manager_assignments)
  manager: UserEntity;
  @ManyToOne(() => UserEntity, (user) => user.supporter_assignments)
  supporter: UserEntity;
  @ManyToOne(() => ComplaintEntity, (comp) => comp.assignations)
  complaint: ComplaintEntity;
  @Column({ nullable: true })
  note: string;
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
