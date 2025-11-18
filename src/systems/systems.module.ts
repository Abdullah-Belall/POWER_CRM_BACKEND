import { Module } from '@nestjs/common';
import { SystemsService } from './systems.service';
import { SystemsController } from './systems.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemEntity } from './entities/system.entity';
import { SystemFeaturesEntity } from './entities/system-features.entity';
import { SystemsDBService } from './DB_Service/systems_db.service';
import { SystemFeaturesDBService } from './DB_Service/system-features_db.service';

@Module({
  imports: [TypeOrmModule.forFeature([SystemEntity, SystemFeaturesEntity])],
  controllers: [SystemsController],
  providers: [SystemsService, SystemsDBService, SystemFeaturesDBService],
  exports: [SystemsDBService],
})
export class SystemsModule {}
