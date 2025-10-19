import { PartialType } from '@nestjs/mapped-types';
import { CreateComplaintsSolvingDto } from './create-complaints-solving.dto';

export class UpdateComplaintsSolvingDto extends PartialType(CreateComplaintsSolvingDto) {}
