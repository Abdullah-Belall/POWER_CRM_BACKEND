import { Module } from '@nestjs/common';
import { DiscussionsService } from './discussions.service';
import { DiscussionsController } from './discussions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscussionEntity } from './entities/discussion.entity';
import { DiscussionDBService } from './DB_Service/discussions_db.service';
import { PotentialCustomersModule } from 'src/potential-customers/potential-customers.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DiscussionEntity]),
    PotentialCustomersModule,
    UsersModule,
  ],
  controllers: [DiscussionsController],
  providers: [DiscussionsService, DiscussionDBService],
  exports: [DiscussionDBService],
})
export class DiscussionsModule {}
