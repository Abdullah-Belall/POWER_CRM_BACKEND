import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractEntity } from './entities/contract.entity';
import { ContractStatusEntity } from './entities/contract-status.entity';
import { ContractsDBService } from './DB_Service/contracts_db.service';
import { SystemsModule } from 'src/systems/systems.module';
import { ServicesModule } from 'src/services/services.module';
import { PotentialCustomersModule } from 'src/potential-customers/potential-customers.module';
import { SystemsContractsModule } from 'src/systems-contracts/systems-contracts.module';
import { ContractStatusDBService } from './DB_Service/contract-status_db.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContractEntity, ContractStatusEntity]),
    SystemsModule,
    ServicesModule,
    PotentialCustomersModule,
    SystemsContractsModule,
  ],
  controllers: [ContractsController],
  providers: [ContractsService, ContractsDBService, ContractStatusDBService],
  exports: [ContractsDBService, ContractStatusDBService],
})
export class ContractsModule {}
