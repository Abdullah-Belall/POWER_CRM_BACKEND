import { PartialType } from '@nestjs/mapped-types';
import { CreateDelayExcuseDto } from './create-delay-excuse.dto';

export class UpdateDelayExcuseDto extends PartialType(CreateDelayExcuseDto) {}
