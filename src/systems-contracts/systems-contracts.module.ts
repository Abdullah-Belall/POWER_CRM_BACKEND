import { Module } from '@nestjs/common';
import { SystemsContractsService } from './systems-contracts.service';
import { SystemsContractsController } from './systems-contracts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemsContractEntity } from './entities/systems-contract.entity';
import { SystemsContractsDBService } from './DB_Service/systems-contracts_db.service';

@Module({
  imports: [TypeOrmModule.forFeature([SystemsContractEntity])],
  controllers: [SystemsContractsController],
  providers: [SystemsContractsService, SystemsContractsDBService],
  exports: [SystemsContractsDBService],
})
export class SystemsContractsModule {}
