import { PartialType } from '@nestjs/mapped-types';
import { CreateComplaintsAssignerDto } from './create-complaints-assigner.dto';

export class UpdateComplaintsAssignerDto extends PartialType(CreateComplaintsAssignerDto) {}
