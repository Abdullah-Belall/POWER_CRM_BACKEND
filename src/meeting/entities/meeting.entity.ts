import { DiscussionEntity } from 'src/discussions/entities/discussion.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { MeetingEnum } from 'src/utils/types/enums/meeting-enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'meeting' })
export class MeetingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'uuid' })
  tenant_id: string;
  @Column({ type: 'int' })
  index: number;
  @ManyToMany(() => UserEntity, (user) => user.meetings)
  employees: UserEntity[];
  @OneToOne(() => DiscussionEntity, (dis) => dis.meeting)
  discussion: DiscussionEntity;
  @Column({ type: 'enum', enum: MeetingEnum, nullable: true })
  meeting: MeetingEnum;
  @Column({ nullable: true })
  meeting_url: string;
  @Column({ type: 'timestamptz', nullable: true })
  meeting_date: Date | null;
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
