import { Module } from '@nestjs/common';
import { PotentialCustomersService } from './potential-customers.service';
import { PotentialCustomersController } from './potential-customers.controller';
import { PotentialCustomersDBService } from './DB_Service/potential-customer-db.dervice';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PotentialCustomerEntity } from './entities/potential-customer.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([PotentialCustomerEntity]), UsersModule],
  controllers: [PotentialCustomersController],
  providers: [PotentialCustomersService, PotentialCustomersDBService],
  exports: [PotentialCustomersDBService],
})
export class PotentialCustomersModule {}
