import { ComplaintsAssignerEntity } from 'src/complaints-assigner/entities/complaints-assigner.entity';
import { ComplaintsSolvingEntity } from 'src/complaints-solving/entities/complaints-solving.entity';
import { ComplaintEntity } from 'src/complaints/entities/complaint.entity';
import { DelayExcusesEntity } from 'src/delay-excuse/entities/delay-excuse.entity';
import { RoleEntity } from 'src/roles/entities/role.entity';
import { TelegramEntity } from 'src/telegram/entities/telegram.entity';
import { LangsEnum } from 'src/utils/types/enums/langs.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'uuid' })
  tenant_id: string;
  @Column({ type: 'int' })
  index: number;
  @ManyToOne(() => RoleEntity, (role) => role.users)
  role: RoleEntity;
  //* FOR CLIENTS ONLY
  @OneToMany(() => ComplaintEntity, (comp) => comp.presenter, { cascade: true })
  presenter_complaints: ComplaintEntity[];
  @OneToMany(() => ComplaintEntity, (comp) => comp.client, { cascade: true })
  complaints: ComplaintEntity[];
  @OneToMany(() => ComplaintsAssignerEntity, (comp) => comp.manager, {
    cascade: true,
  })
  manager_assignments: ComplaintsAssignerEntity[];
  @OneToMany(() => ComplaintsAssignerEntity, (comp) => comp.supporter, {
    cascade: true,
  })
  supporter_assignments: ComplaintsAssignerEntity[];
  @OneToMany(() => ComplaintsSolvingEntity, (comp) => comp.supporter, {
    cascade: true,
  })
  complaints_solving: ComplaintsSolvingEntity[];
  //* FOR SUPPORTERS ONLY
  @OneToMany(() => DelayExcusesEntity, (solv) => solv.user, {
    cascade: true,
  })
  solve_delay_excuses: DelayExcusesEntity[];
  @Column({ unique: true })
  user_name: string;
  @Column({ nullable: true })
  phone: string;
  @Column({ nullable: true })
  email: string;
  @OneToOne(() => TelegramEntity, (teleg) => teleg.user, { cascade: true })
  @JoinColumn()
  chat_id: TelegramEntity;
  @Column()
  password: string;

  @Column({ type: 'enum', enum: LangsEnum, default: LangsEnum.AR })
  lang: LangsEnum;
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
