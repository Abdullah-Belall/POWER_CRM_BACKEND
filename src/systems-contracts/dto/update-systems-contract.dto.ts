import { PartialType } from '@nestjs/mapped-types';
import { CreateSystemsContractDto } from './create-systems-contract.dto';

export class UpdateSystemsContractDto extends PartialType(CreateSystemsContractDto) {}
