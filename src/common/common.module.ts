import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [CommonController],
  providers: [CommonService],
})
export class CommonModule {}
