import { PartialType } from '@nestjs/mapped-types';
import { CreatePotentialCustomerDto } from './create-potential-customer.dto';

export class UpdatePotentialCustomerDto extends PartialType(CreatePotentialCustomerDto) {}
