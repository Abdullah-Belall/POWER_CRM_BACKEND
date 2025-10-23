import { ComplaintEntity } from 'src/complaints/entities/complaint.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { SupporterReferAcceptEnum } from 'src/utils/types/enums/supporter-refer-accept.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'complaint_solving' })
export class ComplaintsSolvingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'uuid' })
  tenant_id: string;
  @Column({ type: 'int' })
  index: number;
  //* SUPPORTER
  @ManyToOne(() => UserEntity, (user) => user.complaints_solving)
  user: UserEntity;
  @ManyToOne(() => ComplaintEntity, (comp) => comp.solving)
  complaint: ComplaintEntity;
  @Column({
    type: 'enum',
    enum: SupporterReferAcceptEnum,
    default: SupporterReferAcceptEnum.PENDING,
  })
  accept_status: SupporterReferAcceptEnum;
  @Column({ type: 'timestamptz', nullable: true })
  choice_taked_at: Date;
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
