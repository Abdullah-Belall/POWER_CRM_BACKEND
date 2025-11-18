import { PotentialCustomerEntity } from 'src/potential-customers/entities/potential-customer.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { DiscussionStatusEnum } from 'src/utils/types/enums/discussion-status.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'discussions' })
export class DiscussionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'uuid' })
  tenant_id: string;
  @Column({ type: 'int' })
  index: number;
  @ManyToOne(() => UserEntity, (user) => user.discussions)
  discussant: UserEntity;
  @ManyToOne(() => PotentialCustomerEntity, (cust) => cust.discussions)
  customer: PotentialCustomerEntity;
  @Column()
  details: string;
  @Column({
    type: 'enum',
    enum: DiscussionStatusEnum,
    default: DiscussionStatusEnum.NORMAL,
  })
  status: DiscussionStatusEnum;
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
